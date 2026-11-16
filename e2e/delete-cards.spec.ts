import { expect, type Page, test } from "@playwright/test";

// Issue #3: カードを削除する
//
// Given のカードは seed ではなく、各テストの中で /cards/new から追加する。
// 理由: Issue #2 の AC1（e2e/cards.spec.ts）は「カードが1枚もない」が前提で、
// seed にカードを入れるとそのテストが壊れるため（supabase/seed.sql の注記も参照）。
// このファイル名は cards.spec.ts より後に流れるよう delete-cards.spec.ts にしている。
//
// Issue #2 の AC3 が「apple」のカードをすでに追加しているので、ここでは
// テストごとに「apple」を含む別の表の文言を使い、そのテストで入れた文言で確かめる。

const CARDS_URL = /\/cards\/?(\?.*)?$/;

async function addCard(page: Page, front: string, back: string) {
  await page.goto("/cards/new");
  await expect(
    page.getByRole("heading", { name: "カードを追加" }),
  ).toBeVisible();
  await page.getByLabel("表", { exact: true }).fill(front);
  await page.getByLabel("裏", { exact: true }).fill(back);
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page).toHaveURL(CARDS_URL);
  await expect(page.getByText(front, { exact: true })).toBeVisible();
}

function cardItem(page: Page, front: string) {
  return page.getByRole("listitem").filter({
    has: page.getByText(front, { exact: true }),
  });
}

async function openDeleteConfirm(page: Page, front: string) {
  await cardItem(page, front)
    .getByRole("button", { name: "削除", exact: true })
    .click();
  await expect(page.getByText("削除しますか？")).toBeVisible();
}

test("AC1: /cards でカードの「削除」を押すと「削除しますか？」と確認が表示される", async ({
  page,
}) => {
  const front = "apple-AC1";
  await addCard(page, front, "りんご");

  await cardItem(page, front)
    .getByRole("button", { name: "削除", exact: true })
    .click();

  await expect(page.getByText("削除しますか？")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "削除する", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "やめる", exact: true }),
  ).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-3/AC1.png",
    fullPage: true,
  });
});

test("AC2: 確認で「削除する」を押すと一覧からそのカードが消える", async ({
  page,
}) => {
  const front = "apple-AC2";
  await addCard(page, front, "りんご");
  await openDeleteConfirm(page, front);

  await page.getByRole("button", { name: "削除する", exact: true }).click();

  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText(front, { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-3/AC2.png",
    fullPage: true,
  });
});

test("AC3: 確認で「やめる」を押すと一覧にそのカードが残る", async ({
  page,
}) => {
  const front = "apple-AC3";
  await addCard(page, front, "りんご");
  await openDeleteConfirm(page, front);

  await page.getByRole("button", { name: "やめる", exact: true }).click();

  await expect(page.getByText("削除しますか？")).toBeHidden();
  await expect(page.getByText(front, { exact: true })).toBeVisible();

  // 消されていないことを、再読み込みしても確かめる
  await page.reload();
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText(front, { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-3/AC3.png",
    fullPage: true,
  });
});

test("AC4: カードを削除したあと再読み込みしても一覧にそのカードが表示されない", async ({
  page,
}) => {
  const front = "apple-AC4";
  await addCard(page, front, "りんご");
  await openDeleteConfirm(page, front);
  await page.getByRole("button", { name: "削除する", exact: true }).click();
  await expect(page.getByText(front, { exact: true })).toHaveCount(0);

  await page.reload();

  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText(front, { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-3/AC4.png",
    fullPage: true,
  });
});

test("AC5: カードが2枚あり1枚を削除すると、残りの1枚は表示されたまま", async ({
  page,
}) => {
  const deleted = "apple-AC5";
  const kept = "banana-AC5";
  await addCard(page, deleted, "りんご");
  await addCard(page, kept, "バナナ");

  await openDeleteConfirm(page, deleted);
  await page.getByRole("button", { name: "削除する", exact: true }).click();
  await expect(page.getByText(deleted, { exact: true })).toHaveCount(0);

  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByText(kept, { exact: true })).toBeVisible();
  await expect(page.getByText("バナナ", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-3/AC5.png",
    fullPage: true,
  });
});
