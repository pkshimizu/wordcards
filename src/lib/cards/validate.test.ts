import { describe, expect, it } from "vitest";
import { CARD_TEXT_MAX_LENGTH, validateCard } from "./validate";

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

  it("上限ちょうどの文字数なら ok", () => {
    const max = "a".repeat(CARD_TEXT_MAX_LENGTH);
    expect(validateCard({ front: max, back: max })).toEqual({
      ok: true,
      card: { front: max, back: max },
    });
  });

  it("上限を1文字超えたら表・裏それぞれのエラー", () => {
    const over = "a".repeat(CARD_TEXT_MAX_LENGTH + 1);
    expect(validateCard({ front: over, back: over })).toEqual({
      ok: false,
      errors: {
        front: "表は200文字以内で入力してください",
        back: "裏は200文字以内で入力してください",
      },
    });
  });

  it("文字数は前後の空白を除いてから数える", () => {
    const padded = ` ${"a".repeat(CARD_TEXT_MAX_LENGTH)} `;
    expect(validateCard({ front: padded, back: "りんご" }).ok).toBe(true);
  });

  it("サロゲートペアの文字は1文字として数える（DB の char_length と揃える）", () => {
    const emoji = "😀".repeat(CARD_TEXT_MAX_LENGTH);
    expect(validateCard({ front: emoji, back: "りんご" }).ok).toBe(true);
    expect(validateCard({ front: `${emoji}😀`, back: "りんご" })).toEqual({
      ok: false,
      errors: { front: "表は200文字以内で入力してください" },
    });
  });

  it("どちらも無ければ両方のエラー", () => {
    expect(validateCard({ front: null, back: undefined })).toEqual({
      ok: false,
      errors: { front: "表を入力してください", back: "裏を入力してください" },
    });
  });
});
