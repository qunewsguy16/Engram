import { getReview, reviewStreak, type ReviewEntry } from "@/lib/review";
import { DailyReviewClient } from "./DailyReviewClient";

/**
 * Server wrapper: reads today's review + streak from SQLite, then hands the
 * client modal a stable initial. The page revalidates after save, so the next
 * render reflects the new state.
 */
export function DailyReview() {
  const initial: ReviewEntry | null = getReview();
  const streak = reviewStreak();
  return <DailyReviewClient initial={initial} streak={streak} />;
}
