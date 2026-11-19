import { describe, expect, it } from "vitest";

import { parseCardId } from "./parse-card-id";

describe("parseCardId", () => {
  it("正の整数を数に直す", () => {
    expect(parseCardId("1")).toBe(1);
    expect(parseCardId("42")).toBe(42);
  });

  it("整数として読めないものは null を返す", () => {
    for (const raw of ["", "0", "-1", "1.5", "abc", "01", " 1", "1e3"]) {
      expect(parseCardId(raw)).toBeNull();
    }
  });

  it("安全な整数の範囲を超えるものは null を返す", () => {
    expect(parseCardId("99999999999999999999")).toBeNull();
  });
});
