import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import type { CreateCardState } from "./actions";
import { CardForm } from "./card-form";

// ルーターの無いテスト環境では、Link をふつうの <a> に置き換える
vi.mock("next/link", () => ({
  default: ({ children, ...rest }: ComponentProps<"a">) => (
    <a {...rest}>{children}</a>
  ),
}));

describe("CardForm", () => {
  it("表・裏の入力欄と保存ボタンを表示する", () => {
    render(<CardForm action={vi.fn()} />);
    expect(screen.getByLabelText("表")).toBeInTheDocument();
    expect(screen.getByLabelText("裏")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
  });

  it("保存すると入力を action に渡し、返ったエラーを表示する", async () => {
    const action = vi.fn(
      async (_prev: CreateCardState, formData: FormData) => ({
        errors: { front: "表を入力してください" },
        values: {
          front: String(formData.get("front")),
          back: String(formData.get("back")),
        },
      }),
    );
    render(<CardForm action={action} />);

    await userEvent.type(screen.getByLabelText("裏"), "りんご");
    await userEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("表を入力してください")).toBeInTheDocument();
    const formData = action.mock.calls[0][1];
    expect(formData.get("front")).toBe("");
    expect(formData.get("back")).toBe("りんご");
    expect(screen.getByLabelText("裏")).toHaveValue("りんご");
  });

  it("initialValues を渡すと入力欄に最初から入れておく", () => {
    render(
      <CardForm
        action={vi.fn()}
        initialValues={{ front: "aple", back: "りんご" }}
      />,
    );
    expect(screen.getByLabelText("表")).toHaveValue("aple");
    expect(screen.getByLabelText("裏")).toHaveValue("りんご");
  });

  it("cancelHref を渡したときだけ「やめる」リンクを出す", () => {
    const { unmount } = render(<CardForm action={vi.fn()} />);
    expect(
      screen.queryByRole("link", { name: "やめる" }),
    ).not.toBeInTheDocument();
    unmount();

    render(<CardForm action={vi.fn()} cancelHref="/cards" />);
    expect(screen.getByRole("link", { name: "やめる" })).toHaveAttribute(
      "href",
      "/cards",
    );
  });
});
