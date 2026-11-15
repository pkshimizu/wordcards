import { expect, test } from "@playwright/test";

test("トップページにアプリ名が表示される", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "単語カード" }),
  ).toBeVisible();
});

test("ヘルスチェックで Supabase に接続できる", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({
    status: "ok",
    supabase: { status: "ok" },
  });
});
