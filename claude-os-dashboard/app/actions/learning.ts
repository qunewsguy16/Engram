"use server";

import { revalidatePath } from "next/cache";
import { setStatus, markDone, type Progress, type ReadStatus } from "@/lib/learningProgress";

export async function setReadingStatusAction(id: string, status: ReadStatus): Promise<Progress> {
  const p = setStatus(id, status);
  revalidatePath("/");
  return p;
}

/** Returns null if the takeaway is too thin; caller keeps the editor open. */
export async function markReadingDoneAction(id: string, takeaway: string): Promise<Progress | null> {
  const p = markDone(id, takeaway.slice(0, 2000));
  if (p) revalidatePath("/");
  return p;
}
