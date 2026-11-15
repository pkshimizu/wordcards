import { expect, test } from "@playwright/test";

/**
 * Issue #2: カードを追加する
 *
 * AC1 は「カードが1枚もない」状態が前提なので、seed にはカードを入れず、
 * このファイルの先頭（カードを追加するテストより前）に置く。
 * ほかのテストは、それぞれ自分で入れた文言で確かめる。
 */

test("AC1: カードが1枚もないとき /cards を開くと「カードがありません」と表示される", async ({
  page,
}) => {
  await page.goto("/cards");

  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText("カードがありません")).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-2/AC1.png",
    fullPage: true,
  });
});

test("AC2: /cards で「カードを追加」を押すと /cards/new に移動する", async ({
  page,
}) => {
  await page.goto("/cards");

  await page.getByRole("button", { name: "カードを追加" }).click();

  await expect(page).toHaveURL(/\/cards\/new$/);
  await expect(
    page.getByRole("heading", { name: "カードを追加" }),
  ).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-2/AC2.png",
    fullPage: true,
  });
});

test("AC3: 「表」に apple、「裏」に りんご を入れて保存すると /cards の一覧に表示される", async ({
  page,
}) => {
  await page.goto("/cards/new");

  await page.getByLabel("表", { exact: true }).fill("apple");
  await page.getByLabel("裏", { exact: true }).fill("りんご");
  await page.getByRole("button", { name: "保存" }).click();

  await expect(page).toHaveURL(/\/cards$/);
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText("apple", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("りんご", { exact: true }).first()).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-2/AC3.png",
    fullPage: true,
  });
});

test("AC4: 「表」を空のまま保存すると「表を入力してください」と表示され、保存されない", async ({
  page,
}) => {
  const back = "AC4の裏だけ入力";

  await page.goto("/cards/new");

  await page.getByLabel("裏", { exact: true }).fill(back);
  await page.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("表を入力してください")).toBeVisible();
  await expect(page).toHaveURL(/\/cards\/new$/);

  await page.screenshot({
    path: "screenshots/issue-2/AC4.png",
    fullPage: true,
  });

  // カードが保存されていないことを一覧で確かめる
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText(back)).toHaveCount(0);
});

test("AC5: 「裏」を空のまま保存すると「裏を入力してください」と表示され、保存されない", async ({
  page,
}) => {
  const front = "AC5の表だけ入力";

  await page.goto("/cards/new");

  await page.getByLabel("表", { exact: true }).fill(front);
  await page.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("裏を入力してください")).toBeVisible();
  await expect(page).toHaveURL(/\/cards\/new$/);

  await page.screenshot({
    path: "screenshots/issue-2/AC5.png",
    fullPage: true,
  });

  // カードが保存されていないことを一覧で確かめる
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText(front)).toHaveCount(0);
});

test("AC6: カードを1枚追加したあと再読み込みしても一覧に表示されたまま", async ({
  page,
}) => {
  const front = "AC6-persist";
  const back = "AC6の再読み込み確認";

  await page.goto("/cards/new");
  await page.getByLabel("表", { exact: true }).fill(front);
  await page.getByLabel("裏", { exact: true }).fill(back);
  await page.getByRole("button", { name: "保存" }).click();

  await expect(page).toHaveURL(/\/cards$/);
  await expect(page.getByText(front, { exact: true })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText(front, { exact: true })).toBeVisible();
  await expect(page.getByText(back, { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-2/AC6.png",
    fullPage: true,
  });
});
