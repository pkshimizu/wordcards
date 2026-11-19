import { describe, expect, it } from "vitest";

import { pickReviewCards } from "./review-cards";

describe("pickReviewCards", () => {
  it("最後に不正解だったカードだけを、並びを変えずに返す", () => {
    const rows = [
      { id: 4, front: "d", back: "D", card_results: { correct: false } },
      { id: 3, front: "c", back: "C", card_results: { correct: true } },
      { id: 2, front: "b", back: "B", card_results: null },
      { id: 1, front: "a", back: "A", card_results: [{ correct: false }] },
    ];
    expect(pickReviewCards(rows)).toEqual([
      { id: 4, front: "d", back: "D" },
      { id: 1, front: "a", back: "A" },
    ]);
  });

  it("カードが無ければ空の配列を返す", () => {
    expect(pickReviewCards([])).toEqual([]);
  });
});
