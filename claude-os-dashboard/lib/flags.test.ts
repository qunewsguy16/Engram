import { describe, it, expect, beforeEach } from "vitest";
import { flag } from "./flags";

describe("flag", () => {
  beforeEach(() => delete process.env.X_FLAG);

  it('enables only on "true" or "1"', () => {
    process.env.X_FLAG = "true";
    expect(flag("X_FLAG")).toBe(true);
    process.env.X_FLAG = "1";
    expect(flag("X_FLAG")).toBe(true);
  });

  it('treats "false", other strings, and unset as false', () => {
    process.env.X_FLAG = "false";
    expect(flag("X_FLAG")).toBe(false);
    process.env.X_FLAG = "yes";
    expect(flag("X_FLAG")).toBe(false);
    delete process.env.X_FLAG;
    expect(flag("X_FLAG")).toBe(false);
  });
});
