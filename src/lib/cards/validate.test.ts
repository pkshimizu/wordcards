import { describe, expect, it } from "vitest";
import { validateCard } from "./validate";

describe("validateCard", () => {
  it("表と裏があれば ok で、前後の空白を除く", () => {
    expect(validateCard({ front: " apple ", back: "りんご" })).toEqual({
      ok: true,
      card: { front: "apple", back: "りんご" },
    });
  });

  it("表が空なら「表を入力してください」", () => {
    expect(validateCard({ front: "", back: "りんご" })).toEqual({
      ok: false,
      errors: { front: "表を入力してください" },
    });
  });

  it("裏が空白だけなら「裏を入力してください」", () => {
    expect(validateCard({ front: "apple", back: "   " })).toEqual({
      ok: false,
      errors: { back: "裏を入力してください" },
    });
  });

  it("どちらも無ければ両方のエラー", () => {
    expect(validateCard({ front: null, back: undefined })).toEqual({
      ok: false,
      errors: { front: "表を入力してください", back: "裏を入力してください" },
    });
  });
});
