import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardList } from "./card-list";

describe("CardList", () => {
  it("カードが無ければ「カードがありません」と表示する", () => {
    render(<CardList cards={[]} />);
    expect(screen.getByText("カードがありません")).toBeInTheDocument();
  });

  it("カードの表と裏を表示する", () => {
    render(<CardList cards={[{ id: 1, front: "apple", back: "りんご" }]} />);
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText("りんご")).toBeInTheDocument();
    expect(screen.queryByText("カードがありません")).not.toBeInTheDocument();
  });
});
