import { describe, expect, it } from "vitest";
import { validateCardInput } from "./validate";

describe("validateCardInput", () => {
  it("表と裏があれば ok で、前後の空白を取り除く", () => {
    expect(validateCardInput({ front: " apple ", back: "りんご\n" })).toEqual({
      ok: true,
      value: { front: "apple", back: "りんご" },
    });
  });

  it("表が空なら「表を入力してください」", () => {
    expect(validateCardInput({ front: "", back: "りんご" })).toEqual({
      ok: false,
      errors: { front: "表を入力してください" },
    });
  });

  it("裏が空なら「裏を入力してください」", () => {
    expect(validateCardInput({ front: "apple", back: "" })).toEqual({
      ok: false,
      errors: { back: "裏を入力してください" },
    });
  });

  it("空白だけ・未送信も空として扱う", () => {
    expect(validateCardInput({ front: "   ", back: null })).toEqual({
      ok: false,
      errors: {
        front: "表を入力してください",
        back: "裏を入力してください",
      },
    });
  });
});
