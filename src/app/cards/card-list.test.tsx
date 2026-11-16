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
});
