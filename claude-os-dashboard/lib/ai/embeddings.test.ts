import { describe, it, expect } from "vitest";
import { encodeVector, decodeVector, cosine, contentHash, stubEmbedder, EMBEDDING_DIM } from "./embeddings";

describe("vector BLOB storage", () => {
  it("round-trips a Float32Array exactly", () => {
    const v = new Float32Array([0.5, -1.25, 3.0, 0.0]);
    const back = decodeVector(encodeVector(v));
    expect(Array.from(back)).toEqual(Array.from(v));
  });

  it("round-trips a non-zero byteOffset view (the classic footgun)", () => {
    // A Float32Array that is a view into a larger buffer with an offset.
    const big = new Float32Array([9, 9, 0.5, -1.25, 3.0]);
    const view = big.subarray(2); // byteOffset != 0
    const back = decodeVector(encodeVector(view));
    expect(Array.from(back)).toEqual([0.5, -1.25, 3.0]);
  });
});

describe("cosine", () => {
  it("is 1 for identical vectors", () => {
    const v = new Float32Array([1, 2, 3]);
    expect(cosine(v, v)).toBeCloseTo(1, 6);
  });
  it("is 0 for orthogonal vectors", () => {
    expect(cosine(new Float32Array([1, 0]), new Float32Array([0, 1]))).toBeCloseTo(0, 6);
  });
  it("throws on dimension mismatch", () => {
    expect(() => cosine(new Float32Array([1]), new Float32Array([1, 2]))).toThrow(/dim mismatch/);
  });
  it("handles a zero vector without NaN", () => {
    expect(cosine(new Float32Array([0, 0]), new Float32Array([1, 1]))).toBe(0);
  });
});

describe("contentHash", () => {
  it("is stable across whitespace normalization", async () => {
    expect(await contentHash("hello  world")).toEqual(await contentHash(" hello world "));
  });
  it("differs for different content", async () => {
    expect(await contentHash("a")).not.toEqual(await contentHash("b"));
  });
});

describe("stubEmbedder", () => {
  it("is deterministic and correctly dimensioned", async () => {
    const [a] = await stubEmbedder.embed(["hello"]);
    const [b] = await stubEmbedder.embed(["hello"]);
    expect(a.length).toBe(EMBEDDING_DIM);
    expect(Array.from(a)).toEqual(Array.from(b));
  });
});
