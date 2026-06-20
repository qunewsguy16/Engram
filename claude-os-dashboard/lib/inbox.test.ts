import { describe, it, expect } from "vitest";
import { parseCapture } from "./parseCapture";

describe("parseCapture", () => {
  it("extracts inline #tags and returns the cleaned text", () => {
    expect(parseCapture("rethink RAG eval #rag #engram")).toEqual({
      text: "rethink RAG eval",
      tags: ["rag", "engram"],
    });
  });

  it("extracts a tag at the start of the string", () => {
    expect(parseCapture("#idea read the SSM paper")).toEqual({
      text: "read the SSM paper",
      tags: ["idea"],
    });
  });

  it("dedupes case-insensitively and normalizes to lowercase", () => {
    expect(parseCapture("foo #Engram #engram #ENGRAM").tags).toEqual(["engram"]);
  });

  it("collapses whitespace left behind by removed tags", () => {
    expect(parseCapture("alpha  #a  beta   #b  gamma").text).toBe("alpha beta gamma");
  });

  it("does not match # inside a word (e.g. urls or C#)", () => {
    expect(parseCapture("see https://x.com/path#frag and C#").tags).toEqual([]);
  });

  it("returns empty tags + trimmed text for plain input", () => {
    expect(parseCapture("  just a thought  ")).toEqual({ text: "just a thought", tags: [] });
  });
});
