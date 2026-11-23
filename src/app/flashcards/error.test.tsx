import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FlashcardsError from "./error";

describe("FlashcardsError", () => {
  it("UT7: 読み込みに失敗したら、エラーの中身は出さず固定の文言を出し、もう一度読み込める", () => {
    const retry = vi.fn();
    render(
      <FlashcardsError error={new Error("secret db detail")} retry={retry} />,
    );
    expect(
      screen.getByRole("heading", { name: "カードを読み込めませんでした" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("時間をおいてもう一度お試しください。"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/secret db detail/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "もう一度読み込む" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
