import "server-only";

/**
 * Minimal zero-dependency leveled logger.
 *
 * Why not pino: pino-pretty's worker-thread transport cannot be bundled into
 * Next route handlers / server actions and does not exist on the edge runtime,
 * so it breaks the build the moment it is imported server-side. For a
 * single-user local tool a console-based logger is sufficient and has no
 * native/transport footguns. Swap to pino only if structured log shipping is
 * ever actually needed.
 */

const LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;
type Level = (typeof LEVELS)[number];

function threshold(): number {
  const env = (process.env.LOG_LEVEL ?? "info") as Level;
  const i = LEVELS.indexOf(env);
  return i === -1 ? LEVELS.indexOf("info") : i;
}

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (LEVELS.indexOf(level) < threshold()) return;
  const line = { level, time: new Date().toISOString(), msg, ...meta };
  const sink = level === "error" || level === "fatal" ? console.error : console.log;
  sink(JSON.stringify(line));
}

export const log = {
  trace: (msg: string, meta?: Record<string, unknown>) => emit("trace", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
  fatal: (msg: string, meta?: Record<string, unknown>) => emit("fatal", msg, meta),
};
