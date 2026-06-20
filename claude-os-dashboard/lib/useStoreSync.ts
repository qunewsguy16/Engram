import { useEffect, useReducer } from "react";

type Unsubscribe = () => void;
type Subscriber = (fn: () => void) => Unsubscribe;

/**
 * Re-render the calling component whenever any of the given local stores change.
 * Collapses the repeated "useReducer refresh + subscribe + cleanup" boilerplate
 * the widgets share (inbox/review/learning are synchronous stores, so a plain
 * re-render is all that's needed).
 */
export function useStoreSync(...subscribers: Subscriber[]): void {
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const unsubs = subscribers.map((sub) => sub(refresh));
    return () => unsubs.forEach((u) => u());
    // Subscribers are module-level singletons; intentionally subscribe once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
