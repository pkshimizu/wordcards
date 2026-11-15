import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardList } from "./card-list";

describe("CardList", () => {
  it("カードが無ければ「カードがありません」と表示する", () => {
    render(<CardList cards={[]} />);

    expect(screen.getByText("カードがありません")).toBeInTheDocument();
  });

  it("カードの表と裏を表示する", () => {
    render(
      <CardList
        cards={[
          { id: "1", front: "apple", back: "りんご" },
          { id: "2", front: "dog", back: "犬" },
        ]}
      />,
    );

    expect(screen.queryByText("カードがありません")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText("りんご")).toBeInTheDocument();
    expect(screen.getByText("dog")).toBeInTheDocument();
    expect(screen.getByText("犬")).toBeInTheDocument();
  });
});
