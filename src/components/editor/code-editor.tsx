"use client";

import { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, placeholder as cmPlaceholder } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { html as htmlLang } from "@codemirror/lang-html";
import { bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle, syntaxTree, ensureSyntaxTree } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { tags as t } from "@lezer/highlight";

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword, t.definitionKeyword], color: "var(--syn-keyword)" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "var(--syn-string)" },
  { tag: [t.number, t.bool, t.null], color: "var(--syn-number)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--syn-comment)", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--syn-fn)" },
  { tag: [t.propertyName], color: "var(--syn-prop)" },
  { tag: [t.typeName, t.className, t.tagName], color: "var(--syn-fn)" },
  { tag: [t.attributeName], color: "var(--syn-prop)" },
  { tag: [t.punctuation, t.bracket, t.operator], color: "var(--syn-punct)" },
]);

/** Find the first syntax error in a JavaScript document (1-based line), using the Lezer parse tree. */
export function findSyntaxErrorLine(state: EditorState): number | null {
  const tree = ensureSyntaxTree(state, state.doc.length, 200) ?? syntaxTree(state);
  let pos: number | null = null;
  tree.iterate({
    enter: (n) => {
      if (pos !== null) return false;
      if (n.type.isError) {
        pos = n.from;
        return false;
      }
    },
  });
  return pos === null ? null : state.doc.lineAt(pos).number;
}

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  language?: "js" | "html";
  ariaLabel: string;
  minHeight?: number;
  maxHeight?: number;
  readOnly?: boolean;
  placeholder?: string;
  /** Called with the first syntax error line (or null) whenever the document changes. */
  onSyntaxCheck?: (line: number | null) => void;
}

export function CodeEditor({
  value,
  onChange,
  onRun,
  language = "js",
  ariaLabel,
  minHeight = 160,
  maxHeight = 520,
  readOnly,
  placeholder,
  onSyntaxCheck,
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cbs = useRef({ onChange, onRun, onSyntaxCheck });
  useEffect(() => {
    cbs.current = { onChange, onRun, onSyntaxCheck };
  });
  const readOnlyComp = useRef(new Compartment());

  useEffect(() => {
    if (!host.current) return;
    const runKey = keymap.of([
      {
        key: "Mod-Enter",
        preventDefault: true,
        run: () => {
          cbs.current.onRun?.();
          return true;
        },
      },
    ]);
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        syntaxHighlighting(highlight),
        language === "html" ? htmlLang() : javascript({ jsx: false }),
        runKey,
        // indentWithTab: Escape then Tab moves focus out of the editor (built into CodeMirror).
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
        readOnlyComp.current.of(EditorState.readOnly.of(!!readOnly)),
        EditorView.contentAttributes.of({ "aria-label": ariaLabel, "aria-multiline": "true" }),
        placeholder ? cmPlaceholder(placeholder) : [],
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            const text = u.state.doc.toString();
            cbs.current.onChange(text);
            if (language === "js") cbs.current.onSyntaxCheck?.(text.trim() ? findSyntaxErrorLine(u.state) : null);
          }
        }),
        EditorView.theme({
          "&": { minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` },
          ".cm-scroller": { overflow: "auto" },
          ".cm-content": { padding: "10px 0" },
        }),
      ],
    });
    const v = new EditorView({ state, parent: host.current });
    view.current = v;
    if (language === "js") cbs.current.onSyntaxCheck?.(value.trim() ? findSyntaxErrorLine(state) : null);
    return () => {
      v.destroy();
      view.current = null;
    };
    // Editor is created once; external value changes are synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Sync external value changes (e.g. Reset) without recreating the editor.
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: readOnlyComp.current.reconfigure(EditorState.readOnly.of(!!readOnly)) });
  }, [readOnly]);

  return <div ref={host} className="overflow-hidden" data-testid="code-editor" />;
}
