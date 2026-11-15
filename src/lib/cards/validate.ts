export type CardInput = { front: string; back: string };

export type CardErrors = { front?: string; back?: string };

export type CardValidation =
  { ok: true; card: CardInput } | { ok: false; errors: CardErrors };

/**
 * 表・裏それぞれの最大文字数。
 * DB の check 制約（supabase/migrations/20261115120000_create_cards.sql）と値を揃えること。
 */
export const CARD_TEXT_MAX_LENGTH = 200;

function toText(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Postgres の char_length と同じく、コードポイント単位で数える。 */
function countChars(text: string): number {
  return Array.from(text).length;
}

function checkText(text: string, label: string): string | undefined {
  if (!text) return `${label}を入力してください`;
  if (countChars(text) > CARD_TEXT_MAX_LENGTH) {
    return `${label}は${CARD_TEXT_MAX_LENGTH}文字以内で入力してください`;
  }
  return undefined;
}

/**
 * カードの入力を確かめる。表・裏それぞれについて、空（空白だけを含む）か、
 * 前後の空白を除いた文字数が上限を超えていればエラー文を返す。
 */
export function validateCard(input: {
  front: FormDataEntryValue | null | undefined;
  back: FormDataEntryValue | null | undefined;
}): CardValidation {
  const front = toText(input.front);
  const back = toText(input.back);
  const errors: CardErrors = {};
  const frontError = checkText(front, "表");
  const backError = checkText(back, "裏");
  if (frontError) errors.front = frontError;
  if (backError) errors.back = backError;
  if (errors.front || errors.back) return { ok: false, errors };
  return { ok: true, card: { front, back } };
}
