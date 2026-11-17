import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { Quiz } from "./quiz";

// ルーターの無いテスト環境では、Link をふつうの <a> に置き換える（移動はしない）
vi.mock("next/link", () => ({
  default: ({ href, onClick, children, ...rest }: ComponentProps<"a">) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

const cards = [
  { id: 2, front: "apple", back: "りんご" },
  { id: 1, front: "banana", back: "バナナ" },
];

function answer(value: string) {
  fireEvent.change(screen.getByLabelText("答え"), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "答え合わせ" }));
}

describe("Quiz", () => {
  it("1問目の表と入力欄を表示する", () => {
    render(<Quiz cards={cards} />);
    expect(screen.getByText("1問目")).toBeInTheDocument();
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByLabelText("答え")).toBeInTheDocument();
  });

  it("正しい答えなら「正解」と表示する（前後の空白は無視）", () => {
    render(<Quiz cards={cards} />);
    answer(" りんご ");
    expect(screen.getByText("正解")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "次へ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "終わる" })).toBeInTheDocument();
  });

  it("違う答えなら正しい答えを添えて「不正解」と表示する", () => {
    render(<Quiz cards={cards} />);
    answer("みかん");
    expect(
      screen.getByText("不正解（正しい答え：りんご）"),
    ).toBeInTheDocument();
    expect(screen.queryByText("正解")).not.toBeInTheDocument();
  });

  it("「次へ」で2問目に進む", () => {
    render(<Quiz cards={cards} />);
    answer("りんご");
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    expect(screen.getByText("2問目")).toBeInTheDocument();
    expect(screen.getByText("banana")).toBeInTheDocument();
    expect(screen.getByLabelText("答え")).toHaveValue("");
  });

  it("最後の問題では「結果を見る」で結果を表示する", () => {
    render(<Quiz cards={cards} />);
    answer("りんご");
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    answer("みかん");
    expect(
      screen.queryByRole("button", { name: "次へ" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "結果を見る" }));
    expect(screen.getByText("2問中1問正解")).toBeInTheDocument();
  });

  it("「終わる」で答えた問題だけを数えた結果を表示する", () => {
    render(<Quiz cards={cards} />);
    answer("りんご");
    fireEvent.click(screen.getByRole("button", { name: "終わる" }));
    expect(screen.getByText("1問中1問正解")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "もう一度" })).toHaveAttribute(
      "href",
      "/quiz",
    );
    expect(screen.getByRole("link", { name: "カード一覧へ" })).toHaveAttribute(
      "href",
      "/cards",
    );
  });

  it("「もう一度」で1問目からやり直す", () => {
    render(<Quiz cards={cards} />);
    answer("りんご");
    fireEvent.click(screen.getByRole("button", { name: "終わる" }));
    fireEvent.click(screen.getByRole("link", { name: "もう一度" }));
    expect(screen.getByText("1問目")).toBeInTheDocument();
    expect(screen.getByText("apple")).toBeInTheDocument();
  });

  it("カードが1枚もなければ「カードがありません」と表示する", () => {
    render(<Quiz cards={[]} />);
    expect(screen.getByText("カードがありません")).toBeInTheDocument();
    expect(screen.queryByLabelText("答え")).not.toBeInTheDocument();
  });
});
