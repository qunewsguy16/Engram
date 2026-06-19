/**
 * Runtime feature-flag read. Mirrors the strict parsing in lib/config.ts
 * (only "true"/"1" enable) but is dependency-light and safe to import
 * anywhere server-side — used at call time where reading the whole validated
 * config object would be overkill.
 */
export function flag(name: string): boolean {
  const v = process.env[name];
  return v === "true" || v === "1";
}
