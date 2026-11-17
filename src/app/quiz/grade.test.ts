import { describe, expect, it } from "vitest";

import { isCorrect } from "./grade";

describe("isCorrect", () => {
  it("裏と一致すれば正解", () => {
    expect(isCorrect("りんご", "りんご")).toBe(true);
  });

  it("前後の空白は無視する", () => {
    expect(isCorrect(" りんご ", "りんご")).toBe(true);
    expect(isCorrect("　りんご\t", "りんご")).toBe(true);
  });

  it("違う答えは不正解", () => {
    expect(isCorrect("みかん", "りんご")).toBe(false);
  });

  it("部分一致は不正解", () => {
    expect(isCorrect("りん", "りんご")).toBe(false);
  });

  it("空の答えは不正解", () => {
    expect(isCorrect("  ", "りんご")).toBe(false);
  });
});
