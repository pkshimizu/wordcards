import { describe, expect, it } from "vitest";

import { filterCards } from "./filter-cards";

const cards = [
  { id: 1, front: "apple", back: "りんご" },
  { id: 2, front: "banana", back: "バナナ" },
];

describe("filterCards", () => {
  it("表の部分一致で絞り込む", () => {
    expect(filterCards(cards, "app")).toEqual([cards[0]]);
  });

  it("裏も検索対象にする", () => {
    expect(filterCards(cards, "バナナ")).toEqual([cards[1]]);
  });

  it("大文字小文字を区別しない", () => {
    expect(filterCards(cards, "APPLE")).toEqual([cards[0]]);
  });

  it("一致しなければ空を返す", () => {
    expect(filterCards(cards, "zzz")).toEqual([]);
  });

  it("検索語が空ならすべてを返す", () => {
    expect(filterCards(cards, "")).toEqual(cards);
    expect(filterCards(cards, "   ")).toEqual(cards);
  });
});
