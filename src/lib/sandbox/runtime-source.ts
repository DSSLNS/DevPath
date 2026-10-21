/**
 * Source code of the in-sandbox runtime.
 *
 * This string is evaluated INSIDE the isolated execution environment (a Web
 * Worker spawned by an opaque-origin sandboxed iframe in the browser, or a
 * `vm` context in Node for content verification). It must be self-contained
 * and must not contain backticks or "${" sequences.
 *
 * It installs:
 *   - a capturing `console` with Node-style single-line value formatting
 *   - an `assert` helper used by exercise tests
 *   - tracked timers so a run completes once pending timers drain
 *   - globalThis.__jsaRun(code, tests) -> Promise<RunResult>
 */
export const SANDBOX_RUNTIME_SOURCE = String.raw`
(function () {
  'use strict';
  var g = globalThis;
  var MAX_LOGS = 500;
  var MAX_LINE = 10000;
  var logs = [];
  var emit = null; // optional live log callback

  // ---------------------------------------------------------------- format
  var IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
  function quote(s) {
    if (s.indexOf("'") === -1) return "'" + s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n') + "'";
    if (s.indexOf('"') === -1) return '"' + s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n') + '"';
    return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  }
  function fnName(f) {
    var src = '';
    try { src = Function.prototype.toString.call(f); } catch (e) {}
    if (/^class[\s{]/.test(src)) return '[class ' + (f.name || '(anonymous)') + ']';
    return f.name ? '[Function: ' + f.name + ']' : '[Function (anonymous)]';
  }
  function keyStr(k) {
    if (typeof k === 'symbol') return '[' + k.toString() + ']';
    return IDENT.test(k) ? k : quote(k);
  }
  function ctorName(o) {
    var p = Object.getPrototypeOf(o);
    if (p === null) return null;
    var c = p.constructor;
    return c && typeof c.name === 'string' ? c.name : '';
  }
  function fmt(v, depth, seen) {
    var t = typeof v;
    if (v === null) return 'null';
    if (t === 'undefined') return 'undefined';
    if (t === 'string') return depth === 0 ? v : quote(v);
    if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
    if (t === 'bigint') return String(v) + 'n';
    if (t === 'boolean') return String(v);
    if (t === 'symbol') return v.toString();
    if (t === 'function') {
      var fname = fnName(v);
      var fkeys = Object.keys(v);
      if (!fkeys.length) return fname;
      return fname + ' ' + fmtProps(v, fkeys, depth, seen);
    }
    if (seen.indexOf(v) !== -1) return '[Circular]';
    if (v instanceof Error) {
      return (v.name || 'Error') + ': ' + v.message;
    }
    if (v instanceof Date) return isNaN(v.getTime()) ? 'Invalid Date' : v.toISOString();
    if (v instanceof RegExp) return String(v);
    if (typeof Promise !== 'undefined' && v instanceof Promise) return 'Promise {}';
    if (typeof WeakMap !== 'undefined' && v instanceof WeakMap) return 'WeakMap { <items unknown> }';
    if (typeof WeakSet !== 'undefined' && v instanceof WeakSet) return 'WeakSet { <items unknown> }';
    if (depth > 2) {
      if (Array.isArray(v)) return '[Array]';
      var cn0 = ctorName(v);
      return cn0 && cn0 !== 'Object' ? '[' + cn0 + ']' : '[Object]';
    }
    seen = seen.concat([v]);
    if (Array.isArray(v)) {
      if (v.length === 0) return '[]';
      var parts = [];
      var holes = 0;
      for (var i = 0; i < v.length; i++) {
        if (!(i in v)) { holes++; continue; }
        if (holes) { parts.push('<' + holes + ' empty item' + (holes > 1 ? 's' : '') + '>'); holes = 0; }
        if (parts.length >= 100) { parts.push('... ' + (v.length - i) + ' more items'); holes = 0; break; }
        parts.push(fmt(v[i], depth + 1, seen));
      }
      if (holes) parts.push('<' + holes + ' empty item' + (holes > 1 ? 's' : '') + '>');
      return '[ ' + parts.join(', ') + ' ]';
    }
    if (v instanceof Map) {
      if (v.size === 0) return 'Map(0) {}';
      var mp = [];
      v.forEach(function (val, key) { mp.push(fmt(key, depth + 1, seen) + ' => ' + fmt(val, depth + 1, seen)); });
      return 'Map(' + v.size + ') { ' + mp.join(', ') + ' }';
    }
    if (v instanceof Set) {
      if (v.size === 0) return 'Set(0) {}';
      var sp = [];
      v.forEach(function (val) { sp.push(fmt(val, depth + 1, seen)); });
      return 'Set(' + v.size + ') { ' + sp.join(', ') + ' }';
    }
    var cn = ctorName(v);
    var keys = Object.keys(v).concat(Object.getOwnPropertySymbols(v).filter(function (s) {
      return Object.getOwnPropertyDescriptor(v, s).enumerable;
    }));
    var prefix = cn === null ? '[Object: null prototype] ' : cn && cn !== 'Object' ? cn + ' ' : '';
    if (!keys.length) return prefix + '{}';
    return prefix + fmtProps(v, keys, depth, seen);
  }
  function fmtProps(o, keys, depth, seen) {
    var out = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var d = Object.getOwnPropertyDescriptor(o, k);
      var val;
      if (d && (d.get || d.set)) val = d.get && d.set ? '[Getter/Setter]' : d.get ? '[Getter]' : '[Setter]';
      else val = fmt(o[k], depth + 1, seen);
      out.push(keyStr(k) + ': ' + val);
    }
    return '{ ' + out.join(', ') + ' }';
  }
  function format(v) { return fmt(v, 0, []); }

  function formatArgs(args) {
    args = Array.prototype.slice.call(args);
    if (typeof args[0] === 'string' && /%[sdifoOc%]/.test(args[0])) {
      var fmtStr = args.shift();
      fmtStr = fmtStr.replace(/%([sdifoOc%])/g, function (m, c) {
        if (c === '%') return '%';
        if (!args.length) return m;
        var a = args.shift();
        if (c === 's') return typeof a === 'string' ? a : fmt(a, 1, []);
        if (c === 'd' || c === 'i') return typeof a === 'bigint' ? a + 'n' : String(c === 'i' ? parseInt(a, 10) : Number(a));
        if (c === 'f') return String(parseFloat(a));
        if (c === 'c') return '';
        return fmt(a, 1, []);
      });
      args.unshift(fmtStr);
    }
    return args.map(function (a) { return format(a); }).join(' ');
  }

  // ---------------------------------------------------------------- console
  function push(level, text) {
    if (logs.length >= MAX_LOGS) {
      if (logs.length === MAX_LOGS) logs.push({ level: 'warn', text: '[output truncated after ' + MAX_LOGS + ' lines]' });
      return;
    }
    if (text.length > MAX_LINE) text = text.slice(0, MAX_LINE) + '... [line truncated]';
    var entry = { level: level, text: text };
    logs.push(entry);
    if (emit) { try { emit(entry); } catch (e) {} }
  }
  var counts = {};
  var timersLabel = {};
  var groupDepth = 0;
  function indent(t) { return groupDepth ? new Array(groupDepth + 1).join('  ') + t.split('\n').join('\n' + new Array(groupDepth + 1).join('  ')) : t; }
  var con = {
    log: function () { push('log', indent(formatArgs(arguments))); },
    info: function () { push('info', indent(formatArgs(arguments))); },
    debug: function () { push('log', indent(formatArgs(arguments))); },
    warn: function () { push('warn', indent(formatArgs(arguments))); },
    error: function () { push('error', indent(formatArgs(arguments))); },
    trace: function () { push('log', indent('Trace: ' + formatArgs(arguments))); },
    dir: function (v) { push('log', indent(format(v))); },
    assert: function (cond) {
      if (!cond) push('error', indent('Assertion failed' + (arguments.length > 1 ? ': ' + formatArgs(Array.prototype.slice.call(arguments, 1)) : '')));
    },
    count: function (label) { label = label === undefined ? 'default' : String(label); counts[label] = (counts[label] || 0) + 1; push('log', indent(label + ': ' + counts[label])); },
    countReset: function (label) { counts[label === undefined ? 'default' : String(label)] = 0; },
    group: function () { if (arguments.length) push('log', indent(formatArgs(arguments))); groupDepth++; },
    groupCollapsed: function () { if (arguments.length) push('log', indent(formatArgs(arguments))); groupDepth++; },
    groupEnd: function () { if (groupDepth > 0) groupDepth--; },
    time: function (label) { timersLabel[label === undefined ? 'default' : String(label)] = Date.now(); },
    timeEnd: function (label) { label = label === undefined ? 'default' : String(label); var s = timersLabel[label]; if (s !== undefined) { push('log', indent(label + ': ' + (Date.now() - s) + 'ms')); delete timersLabel[label]; } },
    timeLog: function (label) { label = label === undefined ? 'default' : String(label); var s = timersLabel[label]; if (s !== undefined) push('log', indent(label + ': ' + (Date.now() - s) + 'ms')); },
    clear: function () {},
    table: function (data) {
      if (data === null || typeof data !== 'object') { push('log', indent(format(data))); return; }
      var rows = Array.isArray(data) ? data.map(function (r, i) { return [i, r]; }) : Object.keys(data).map(function (k) { return [k, data[k]]; });
      var cols = [];
      rows.forEach(function (r) { if (r[1] && typeof r[1] === 'object') Object.keys(r[1]).forEach(function (c) { if (cols.indexOf(c) === -1) cols.push(c); }); });
      var lines = ['(index)' + (cols.length ? ' | ' + cols.join(' | ') : ' | Values')];
      rows.forEach(function (r) {
        var cells = cols.length && r[1] && typeof r[1] === 'object' ? cols.map(function (c) { return r[1][c] === undefined ? '' : fmt(r[1][c], 1, []); }) : [fmt(r[1], 1, [])];
        lines.push(String(r[0]) + ' | ' + cells.join(' | '));
      });
      push('log', indent(lines.join('\n')));
    }
  };
  g.console = con;

  // ---------------------------------------------------------------- capabilities
  // Defence in depth: the sandbox also blocks network via CSP and an opaque origin.
  ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'Worker', 'SharedWorker'].forEach(function (name) {
    try { if (name in g) g[name] = undefined; } catch (e) {}
  });
  if (typeof g.alert !== 'function' || g.document) {
    g.alert = function (msg) { push('info', '[alert] ' + (msg === undefined ? '' : String(msg))); };
    g.confirm = function (msg) { push('info', '[confirm] ' + (msg === undefined ? '' : String(msg)) + ' -> false (dialogs are disabled in the sandbox)'); return false; };
    g.prompt = function (msg) { push('info', '[prompt] ' + (msg === undefined ? '' : String(msg)) + ' -> null (dialogs are disabled in the sandbox)'); return null; };
  }

  // ---------------------------------------------------------------- timers
  var pending = 0;
  var drainWaiters = [];
  var liveTimers = {};
  var nativeSetTimeout = g.setTimeout.bind(g);
  var nativeClearTimeout = g.clearTimeout.bind(g);
  var nativeSetInterval = g.setInterval.bind(g);
  var nativeClearInterval = g.clearInterval.bind(g);
  function checkDrain() {
    if (pending === 0) {
      var w = drainWaiters; drainWaiters = [];
      w.forEach(function (fn) { fn(); });
    }
  }
  function reportAsync(err) {
    push('error', 'Uncaught ' + describeError(err).text);
  }
  g.setTimeout = function (fn, ms) {
    var args = Array.prototype.slice.call(arguments, 2);
    pending++;
    var id = nativeSetTimeout(function () {
      delete liveTimers[key];
      pending--;
      try { if (typeof fn === 'function') fn.apply(null, args); }
      catch (e) { reportAsync(e); }
      finally { nativeSetTimeout(checkDrain, 0); }
    }, ms);
    var key = typeof id === 'object' ? (id.__jsaKey = Math.random()) : id;
    liveTimers[key] = 'timeout';
    return id;
  };
  g.clearTimeout = function (id) {
    if (id == null) return;
    var key = typeof id === 'object' ? id.__jsaKey : id;
    if (liveTimers[key] === 'timeout') { delete liveTimers[key]; pending--; checkDrain(); }
    nativeClearTimeout(id);
  };
  g.setInterval = function (fn, ms) {
    var args = Array.prototype.slice.call(arguments, 2);
    pending++;
    var id = nativeSetInterval(function () {
      try { if (typeof fn === 'function') fn.apply(null, args); }
      catch (e) { reportAsync(e); }
    }, ms);
    var key = typeof id === 'object' ? (id.__jsaKey = Math.random()) : id;
    liveTimers[key] = 'interval';
    return id;
  };
  g.clearInterval = function (id) {
    if (id == null) return;
    var key = typeof id === 'object' ? id.__jsaKey : id;
    if (liveTimers[key] === 'interval') { delete liveTimers[key]; pending--; nativeSetTimeout(checkDrain, 0); }
    nativeClearInterval(id);
  };
  function drained() {
    return new Promise(function (resolve) {
      // let microtasks and zero-delay macrotasks settle first
      nativeSetTimeout(function () {
        if (pending === 0) resolve();
        else drainWaiters.push(resolve);
      }, 0);
    });
  }

  // ---------------------------------------------------------------- assert
  function AssertionError(message) { this.name = 'AssertionError'; this.message = message; }
  AssertionError.prototype = Object.create(Error.prototype);
  AssertionError.prototype.constructor = AssertionError;
  function deepEq(a, b, seen) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    var pa = Object.getPrototypeOf(a), pb = Object.getPrototypeOf(b);
    if (pa !== pb) {
      // Plain objects and arrays from different realms (e.g. structuredClone) are structurally comparable.
      var plain = function (p) { return p === null || (Object.getPrototypeOf(p) === null && p.constructor && p.constructor.name === 'Object'); };
      if (!(Array.isArray(a) && Array.isArray(b)) && !(plain(pa) && plain(pb))) return false;
    }
    seen = seen || [];
    for (var i = 0; i < seen.length; i++) if (seen[i][0] === a && seen[i][1] === b) return true;
    seen.push([a, b]);
    if (a instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp) return String(a) === String(b);
    if (a instanceof Map) {
      if (a.size !== b.size) return false;
      var ok = true;
      a.forEach(function (v, k) { if (!b.has(k) || !deepEq(v, b.get(k), seen)) ok = false; });
      return ok;
    }
    if (a instanceof Set) {
      if (a.size !== b.size) return false;
      var ok2 = true;
      a.forEach(function (v) { if (!b.has(v)) ok2 = false; });
      return ok2;
    }
    if (Array.isArray(a) && a.length !== b.length) return false;
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (var j = 0; j < ka.length; j++) {
      if (!Object.prototype.hasOwnProperty.call(b, ka[j])) return false;
      if (!deepEq(a[ka[j]], b[ka[j]], seen)) return false;
    }
    return true;
  }
  var assert = {
    equal: function (actual, expected, msg) {
      if (!Object.is(actual, expected) && !(actual === expected)) throw new AssertionError(msg || ('Expected ' + fmt(expected, 1, []) + ' but received ' + fmt(actual, 1, [])));
    },
    notEqual: function (actual, expected, msg) {
      if (Object.is(actual, expected)) throw new AssertionError(msg || ('Expected value not to equal ' + fmt(expected, 1, [])));
    },
    deepEqual: function (actual, expected, msg) {
      if (!deepEq(actual, expected)) throw new AssertionError(msg || ('Expected ' + fmt(expected, 1, []) + ' but received ' + fmt(actual, 1, [])));
    },
    ok: function (value, msg) {
      if (!value) throw new AssertionError(msg || ('Expected a truthy value but received ' + fmt(value, 1, [])));
    },
    throws: function (fn, msg) {
      var threw = false;
      try { fn(); } catch (e) { threw = true; }
      if (!threw) throw new AssertionError(msg || 'Expected the function to throw an error');
    },
    rejects: function (p, msg) {
      var promise = typeof p === 'function' ? p() : p;
      return Promise.resolve(promise).then(function () {
        throw new AssertionError(msg || 'Expected the promise to reject');
      }, function () {});
    }
  };
  g.assert = assert;

  // ---------------------------------------------------------------- errors
  var HEADER_LINES = 2; // "async function anonymous(\n) {\n"
  function describeError(e) {
    if (e instanceof AssertionError || (e && e.name === 'AssertionError')) return { text: 'AssertionError: ' + e.message, line: null };
    if (e && typeof e === 'object' && 'message' in e) {
      var line = null;
      var m = /, <anonymous>:(\d+):(\d+)\)/.exec(String(e.stack || ''));
      if (m) { var n = parseInt(m[1], 10) - HEADER_LINES; if (n > 0) line = n; }
      return { text: (e.name || 'Error') + ': ' + e.message, line: line };
    }
    return { text: format(e), line: null };
  }

  var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  g.__jsaSetEmitter = function (fn) { emit = fn; };

  g.__jsaRun = function (code, tests) {
    logs.length = 0;
    groupDepth = 0;
    var started = Date.now();
    var result = { logs: logs, error: null, errorLine: null, syntaxError: false, tests: [], durationMs: 0 };
    var userFn;
    try {
      userFn = new AsyncFunction(code);
    } catch (e) {
      result.syntaxError = true;
      result.error = (e && e.name ? e.name : 'SyntaxError') + ': ' + (e && e.message ? e.message : String(e));
      result.durationMs = Date.now() - started;
      return Promise.resolve(result);
    }
    var testFns = [];
    if (tests && tests.length) {
      for (var i = 0; i < tests.length; i++) {
        try {
          // Tests run in the same function scope as the learner code so they can see its declarations.
          testFns.push(new AsyncFunction(code + '\n;return (async () => {\n' + tests[i].code + '\n})();'));
        } catch (e2) {
          testFns.push(null);
        }
      }
    }
    return Promise.resolve()
      .then(function () { return userFn.call(g); })
      .then(drained, function (e) {
        var d = describeError(e);
        result.error = d.text; result.errorLine = d.line;
      })
      .then(function () {
        if (!tests || !tests.length || result.error) return;
        var userLogs = logs.slice();
        var chain = Promise.resolve();
        tests.forEach(function (t, idx) {
          chain = chain.then(function () {
            var fn = testFns[idx];
            if (!fn) { result.tests.push({ name: t.name, passed: false, message: 'Test could not be compiled' }); return; }
            // Re-run learner code silently inside the test scope; expose the original logs.
            var before = logs.length;
            g.__logs = userLogs.map(function (l) { return l.text; });
            var saveEmit = emit; emit = null;
            return Promise.resolve()
              .then(function () { return fn.call(g); })
              .then(drained)
              .then(function () { result.tests.push({ name: t.name, passed: true, message: '' }); },
                    function (e) { result.tests.push({ name: t.name, passed: false, message: describeError(e).text }); })
              .then(function () { logs.length = before; emit = saveEmit; });
          });
        });
        return chain;
      })
      .then(function () {
        result.durationMs = Date.now() - started;
        result.logs = logs.slice();
        return result;
      });
  };
  g.__jsaFormat = format;
})();
`;
