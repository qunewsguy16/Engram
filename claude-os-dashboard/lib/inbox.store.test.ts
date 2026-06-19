import { describe, it, expect, beforeEach } from "vitest";
import { installLocalStorageShim, resetLocalStorage } from "../test/stubs/localstorage";

installLocalStorageShim();

import { capture, listInbox, setStatus, recentCaptureTexts } from "./inbox";

beforeEach(() => resetLocalStorage());

describe("inbox store", () => {
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
    const ids = listInbox().map((c) => c.text);
    expect(ids).toEqual(["second"]);
  });

  it("recentCaptureTexts returns newest first, limited", () => {
    capture("oldest");
    capture("middle");
    capture("newest");
    expect(recentCaptureTexts(2)).toEqual(["newest", "middle"]);
  });
});
