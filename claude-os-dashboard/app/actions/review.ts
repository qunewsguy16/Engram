"use server";

import { revalidatePath } from "next/cache";
import { saveReview, type ReviewEntry } from "@/lib/review";

export interface ReviewPatch {
  oneThingDone?: boolean | null;
  learned?: string;
  blockers?: string;
}

/** Save (upsert) today's review and refresh the dashboard. */
export async function saveReviewAction(patch: ReviewPatch): Promise<ReviewEntry> {
  const trimmed: ReviewPatch = {
    oneThingDone: patch.oneThingDone,
    learned: patch.learned?.slice(0, 2000),
    blockers: patch.blockers?.slice(0, 1000),
  };
  const entry = saveReview(trimmed);
  revalidatePath("/");
  return entry;
}
