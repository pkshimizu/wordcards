import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CardsError from "./error";

describe("CardsError", () => {
  it("エラーの中身は出さず固定の文言を出し、もう一度読み込める", () => {
    const retry = vi.fn();
    render(<CardsError error={new Error("secret db detail")} retry={retry} />);
    expect(
      screen.getByRole("heading", { name: "カードを読み込めませんでした" }),
    ).toBeTruthy();
    expect(screen.queryByText(/secret db detail/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "もう一度読み込む" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
