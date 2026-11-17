import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CardSearch } from "./card-search";

const cards = [
  { id: 1, front: "apple", back: "りんご" },
  { id: 2, front: "banana", back: "バナナ" },
];

function search(value: string) {
  fireEvent.change(screen.getByLabelText("検索"), { target: { value } });
}

describe("CardSearch", () => {
  it("検索語に一致するカードだけを表示する", () => {
    render(<CardSearch cards={cards} deleteAction={vi.fn()} />);
    search("APP");
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.queryByText("banana")).not.toBeInTheDocument();
  });

  it("一致しなければ「一致するカードがありません」と表示する", () => {
    render(<CardSearch cards={cards} deleteAction={vi.fn()} />);
    search("zzz");
    expect(screen.getByText("一致するカードがありません")).toBeInTheDocument();
    expect(screen.queryByText("apple")).not.toBeInTheDocument();
  });

  it("検索語を空にするとすべてのカードを表示する", () => {
    render(<CardSearch cards={cards} deleteAction={vi.fn()} />);
    search("app");
    search("");
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText("banana")).toBeInTheDocument();
    expect(
      screen.queryByText("一致するカードがありません"),
    ).not.toBeInTheDocument();
  });

  it("カードが1枚もなければ「カードがありません」と表示する", () => {
    render(<CardSearch cards={[]} deleteAction={vi.fn()} />);
    search("zzz");
    expect(screen.getByText("カードがありません")).toBeInTheDocument();
    expect(
      screen.queryByText("一致するカードがありません"),
    ).not.toBeInTheDocument();
  });
});
