import type { Card } from "./card-list";

/**
 * 表か裏に検索語を含むカードだけを返す（部分一致・大文字小文字を区別しない）。
 * 検索語が空（空白だけを含む）ならすべてのカードを返す。
 */
export function filterCards(cards: Card[], query: string): Card[] {
  const q = query.trim().toLowerCase();
  if (q === "") return cards;
  return cards.filter(
    (card) =>
      card.front.toLowerCase().includes(q) ||
      card.back.toLowerCase().includes(q),
  );
}
