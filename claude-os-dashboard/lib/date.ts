/**
 * Local-date key (YYYY-MM-DD). Shared so every "today" computation uses the
 * same semantics — the user's local day, not UTC. (Daily rollover for the
 * budget, "overdue" comparisons, and the review log should all roll over at
 * local midnight.) Dependency-free so both client and server modules can use it.
 */
export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
