import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("トップページ", () => {
  it("サービス名を見出しとして表示する", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "単語カード" }),
    ).toBeInTheDocument();
  });
});
