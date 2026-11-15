export type CardInput = {
  front: string;
  back: string;
};

export type CardErrors = {
  front?: string;
  back?: string;
};

export type ValidateResult =
  { ok: true; value: CardInput } | { ok: false; errors: CardErrors };

function toText(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * カードの入力を確かめる。前後の空白は取り除き、空なら誤りとする。
 */
export function validateCardInput(input: {
  front: FormDataEntryValue | null | undefined;
  back: FormDataEntryValue | null | undefined;
}): ValidateResult {
  const front = toText(input.front);
  const back = toText(input.back);
  const errors: CardErrors = {};

  if (front === "") errors.front = "表を入力してください";
  if (back === "") errors.back = "裏を入力してください";

  if (errors.front || errors.back) return { ok: false, errors };
  return { ok: true, value: { front, back } };
}
