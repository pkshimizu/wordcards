import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { Flashcards } from "./flashcards";

// ルーターの無いテスト環境では、Link をふつうの <a> に置き換える（移動はしない）
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const FRONT_HINT = "カードを押すと裏を表示します";
const BACK_HINT = "カードを押すと次のカードを表示します";

const cards = [
  { id: 1, front: "apple", back: "りんご" },
  { id: 2, front: "banana", back: "バナナ" },
  { id: 3, front: "cherry", back: "さくらんぼ" },
];

function pressCard() {
  fireEvent.click(screen.getByRole("button"));
}

describe("Flashcards", () => {
  it("渡された順番の最初のカードの表を表示し、裏は要素としても置かない", () => {
    const random = vi.fn(() => 0);
    render(<Flashcards cards={cards} random={random} />);

    expect(screen.getByText("表")).toBeInTheDocument();
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText(FRONT_HINT)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "カード一覧へ" })).toHaveAttribute(
      "href",
      "/cards",
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByText("りんご")).not.toBeInTheDocument();
    expect(screen.queryByText("裏")).not.toBeInTheDocument();
    expect(screen.queryByText(BACK_HINT)).not.toBeInTheDocument();
    // 最初の描画では乱数を使わない
    expect(random).not.toHaveBeenCalled();
  });

  it("表を押すと同じカードの裏を表示し、表は要素としても置かない", () => {
    render(<Flashcards cards={cards} />);
    pressCard();

    expect(screen.getByText("裏")).toBeInTheDocument();
    expect(screen.getByText("りんご")).toBeInTheDocument();
    expect(screen.getByText(BACK_HINT)).toBeInTheDocument();
    expect(screen.queryByText("apple")).not.toBeInTheDocument();
    expect(screen.queryByText("表")).not.toBeInTheDocument();
    expect(screen.queryByText(FRONT_HINT)).not.toBeInTheDocument();
  });

  it("裏を押すと次のカードの表を表示し、一巡の途中では乱数を使わない", () => {
    const random = vi.fn(() => 0);
    render(<Flashcards cards={cards} random={random} />);
    pressCard();
    pressCard();

    expect(screen.getByText("表")).toBeInTheDocument();
    expect(screen.getByText("banana")).toBeInTheDocument();
    expect(screen.getByText(FRONT_HINT)).toBeInTheDocument();
    expect(screen.queryByText("りんご")).not.toBeInTheDocument();
    expect(random).not.toHaveBeenCalled();
  });

  it("一巡が終わったら順番を決め直して続け、終わりの画面にしない", () => {
    // この乱数では二巡目の順番が cherry から始まってしまうので、
    // 直前の cherry を避けて入れ替えた banana から始まる
    const values = [0, 0.999, 0];
    let calls = 0;
    const random = () => values[calls++ % values.length];
    render(<Flashcards cards={cards} random={random} />);
    for (let i = 0; i < 5; i += 1) pressCard();
    expect(screen.getByText("さくらんぼ")).toBeInTheDocument();

    pressCard();

    expect(screen.getByText("表")).toBeInTheDocument();
    expect(screen.getByText(FRONT_HINT)).toBeInTheDocument();
    expect(screen.queryByText("cherry")).not.toBeInTheDocument();
    expect(screen.getByText("banana")).toBeInTheDocument();
  });

  it("UT5: カードが 1 枚だけなら、裏を押すと同じカードの表を表示する", () => {
    render(<Flashcards cards={[cards[0]]} />);
    pressCard();
    expect(screen.getByText("裏")).toBeInTheDocument();
    expect(screen.getByText("りんご")).toBeInTheDocument();

    pressCard();

    expect(screen.getByText("表")).toBeInTheDocument();
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText(FRONT_HINT)).toBeInTheDocument();
    expect(screen.queryByText("りんご")).not.toBeInTheDocument();
    expect(screen.queryByText("裏")).not.toBeInTheDocument();
  });

  it("UT6: カードが 0 枚なら「カードがありません」とリンク「カード一覧へ」だけを表示する", () => {
    render(<Flashcards cards={[]} />);

    expect(screen.getByText("カードがありません")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "カード一覧へ" })).toHaveAttribute(
      "href",
      "/cards",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("表")).not.toBeInTheDocument();
    expect(screen.queryByText("裏")).not.toBeInTheDocument();
    expect(screen.queryByText(FRONT_HINT)).not.toBeInTheDocument();
    expect(screen.queryByText(BACK_HINT)).not.toBeInTheDocument();
  });
});
