"use server";

import { revalidatePath } from "next/cache";
import { capture, setStatus, type Capture } from "@/lib/inbox";

/** Capture from the QuickCapture modal. Returns null on empty input. */
export async function captureAction(raw: string): Promise<Capture | null> {
  // Cap to bound any abuse of the public server action.
  const item = capture(raw.slice(0, 1000));
  if (item) revalidatePath("/");
  return item;
}

export async function setCaptureStatusAction(id: string, status: Capture["status"]): Promise<void> {
  setStatus(id, status);
  revalidatePath("/");
}
