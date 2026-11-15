export type CardInput = { front: string; back: string };

export type CardErrors = { front?: string; back?: string };

export type CardValidation =
  { ok: true; card: CardInput } | { ok: false; errors: CardErrors };

function toText(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * カードの入力を確かめる。表・裏とも空（空白だけを含む）なら、それぞれのエラー文を返す。
 */
export function validateCard(input: {
  front: FormDataEntryValue | null | undefined;
  back: FormDataEntryValue | null | undefined;
}): CardValidation {
  const front = toText(input.front);
  const back = toText(input.back);
  const errors: CardErrors = {};
  if (!front) errors.front = "表を入力してください";
  if (!back) errors.back = "裏を入力してください";
  if (errors.front || errors.back) return { ok: false, errors };
  return { ok: true, card: { front, back } };
}
