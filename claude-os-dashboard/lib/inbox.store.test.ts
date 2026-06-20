import { describe, it, expect } from "vitest";
import { useTestDb } from "../test/stubs/db";

import { capture, listInbox, setStatus, recentCaptureTexts } from "./inbox";

describe("inbox store (SQLite-backed)", () => {
  useTestDb();

  it("captures text and lists it in the inbox", () => {
    capture("rethink retrieval #rag");
    const items = listInbox();
    expect(items).toHaveLength(1);
    expect(items[0].text).toBe("rethink retrieval");
    expect(items[0].tags).toEqual(["rag"]);
    expect(items[0].status).toBe("inbox");
  });

  it("rejects empty / tags-only captures", () => {
    expect(capture("   ")).toBeNull();
    expect(capture("#only #tags")).toBeNull();
    expect(listInbox()).toHaveLength(0);
  });

  it("triage removes items from the inbox list", () => {
    const a = capture("first")!;
    capture("second");
    setStatus(a.id, "archived");
    expect(listInbox().map((c) => c.text)).toEqual(["second"]);
  });

  it("recentCaptureTexts returns newest first, limited", () => {
    capture("oldest");
    capture("middle");
    capture("newest");
    const recent = recentCaptureTexts(2);
    expect(recent).toContain("newest");
    expect(recent).toHaveLength(2);
  });

  it("persists tags as JSON and reads them back as an array", () => {
    capture("multi #a #b #c");
    const item = listInbox()[0];
    expect(item.tags).toEqual(["a", "b", "c"]);
  });
});
