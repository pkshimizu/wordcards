import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { AddCardButton } from "./add-card-button";

describe("AddCardButton", () => {
  it("押すと /cards/new に移動する", async () => {
    render(<AddCardButton />);

    await userEvent.click(screen.getByRole("button", { name: "カードを追加" }));

    expect(push).toHaveBeenCalledWith("/cards/new");
  });
});
