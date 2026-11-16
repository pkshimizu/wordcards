import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type DeleteCardAction, DeleteCardButton } from "./delete-card-button";

describe("DeleteCardButton", () => {
  it("「削除」を押すと確認を表示する", async () => {
    render(<DeleteCardButton cardId={1} action={vi.fn()} />);
    expect(screen.queryByText("削除しますか？")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(screen.getByText("削除しますか？")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除する" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "やめる" })).toBeInTheDocument();
  });

  it("「やめる」を押すと確認を閉じ、action を呼ばない", async () => {
    const action = vi.fn();
    render(<DeleteCardButton cardId={1} action={action} />);

    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await userEvent.click(screen.getByRole("button", { name: "やめる" }));

    expect(screen.queryByText("削除しますか？")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("「削除する」を押すとカードの id を action に渡し、エラーを表示する", async () => {
    const action = vi.fn<DeleteCardAction>(async () => ({
      error: "カードを削除できませんでした",
    }));
    render(<DeleteCardButton cardId={42} action={action} />);

    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await userEvent.click(screen.getByRole("button", { name: "削除する" }));

    expect(
      await screen.findByText("カードを削除できませんでした"),
    ).toBeInTheDocument();
    expect(action.mock.calls[0][1].get("id")).toBe("42");
  });
});
