import { describe, it, expect } from "vitest";
import { reduceSignals, renderBlob } from "./reduce";

describe("reduceSignals", () => {
  it("assigns stable, kind-prefixed ids", () => {
    const blob = reduceSignals({
      commits: [{ sha: "a", message: "add feature" }],
      tasks: [{ content: "write tests" }],
      notes: [{ title: "idea" }],
    });
    const ids = blob.signals.map((s) => s.id);
    expect(ids).toContain("c1");
    expect(ids).toContain("t1");
    expect(ids).toContain("n1");
  });

  it("drops noise commits (merge/wip/bump/etc.)", () => {
    const blob = reduceSignals({
      commits: [
        { sha: "1", message: "Merge pull request #1" },
        { sha: "2", message: "wip" },
        { sha: "3", message: "bump deps" },
        { sha: "4", message: "implement dream pipeline" },
      ],
    });
    expect(blob.signals.map((s) => s.text)).toEqual(["implement dream pipeline"]);
    expect(blob.signals[0].id).toBe("c1");
  });

  it("dedupes case/whitespace-insensitively within a kind", () => {
    const blob = reduceSignals({
      tasks: [{ content: "Ship  it" }, { content: "ship it" }, { content: "SHIP IT" }],
    });
    expect(blob.signals.filter((s) => s.kind === "task")).toHaveLength(1);
  });

  it("caps each category", () => {
    const commits = Array.from({ length: 40 }, (_, i) => ({ sha: `${i}`, message: `feature ${i}` }));
    const blob = reduceSignals({ commits });
    expect(blob.signals.filter((s) => s.kind === "commit").length).toBeLessThanOrEqual(15);
  });

  it("renders a numbered, grounded blob", () => {
    const blob = reduceSignals({ commits: [{ sha: "a", message: "do thing" }] });
    const text = renderBlob(blob);
    expect(text).toContain("[c1] (commit) do thing");
  });

  it("handles an empty day", () => {
    expect(renderBlob(reduceSignals({}))).toContain("(no signals)");
  });
});
