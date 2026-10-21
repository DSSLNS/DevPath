export type LogLevel = "log" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  text: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface RunResult {
  logs: LogEntry[];
  /** Uncaught error raised by the learner's code ("Name: message"). */
  error: string | null;
  /** 1-based line in the learner's code where the error was raised, when known. */
  errorLine: number | null;
  syntaxError: boolean;
  timedOut?: boolean;
  tests: TestResult[];
  durationMs: number;
}
