/** Tiny ID generator: base36 timestamp + 6 random chars. Sortable-by-time, */
/** good-enough collision resistance for personal-scale local data. */
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
