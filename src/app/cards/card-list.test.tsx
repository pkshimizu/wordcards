import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CardList } from "./card-list";

describe("CardList", () => {
  it("カードが無ければ「カードがありません」と表示する", () => {
    render(<CardList cards={[]} deleteAction={vi.fn()} />);
    expect(screen.getByText("カードがありません")).toBeInTheDocument();
  });

  it("カードの表と裏と「削除」ボタンを表示する", () => {
    render(
      <CardList
        cards={[{ id: 1, front: "apple", back: "りんご" }]}
        deleteAction={vi.fn()}
      />,
    );
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText("りんご")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    expect(screen.queryByText("カードがありません")).not.toBeInTheDocument();
  });

  it("各カードに、そのカードの編集画面へ移る「編集」ボタンを表示する", () => {
    render(
      <CardList
        cards={[
          { id: 1, front: "apple", back: "りんご" },
          { id: 7, front: "banana", back: "バナナ" },
        ]}
        deleteAction={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole("button", { name: "編集" });
    expect(buttons).toHaveLength(2);
    expect(buttons[0].closest("form")).toHaveAttribute(
      "action",
      "/cards/1/edit",
    );
    expect(buttons[1].closest("form")).toHaveAttribute(
      "action",
      "/cards/7/edit",
    );
  });
});
