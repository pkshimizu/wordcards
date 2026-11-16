import { expect, type Page, test } from "@playwright/test";

// Issue #4: カードを検索する
//
// Given のカード「apple／りんご」「banana／バナナ」は seed ではなく、テストの中で
// /cards/new から追加する。
// 理由: Issue #2 の AC1（e2e/cards.spec.ts）は「カードが1枚もない」が前提で、
// seed にカードを入れるとそのテストが壊れるため（supabase/seed.sql の注記も参照）。
//
// 他のテストが入れたカード（Issue #2 AC3 の「apple」、Issue #3 の「apple-AC1」
// 「banana-AC5」など）が残っていても壊れないよう、
// - 同じ表のカードがすでにあれば追加しない（「apple」「banana」はそれぞれ1枚だけにする）
// - 表示・非表示は件数ではなく、表の文言（exact）で確かめる
// ようにしている。

const CARDS_URL = /\/cards\/?(\?.*)?$/;

function cardItem(page: Page, front: string) {
  return page.getByRole("listitem").filter({
    has: page.getByText(front, { exact: true }),
  });
}

async function ensureCard(page: Page, front: string, back: string) {
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  if ((await cardItem(page, front).count()) > 0) return;

  await page.goto("/cards/new");
  await expect(
    page.getByRole("heading", { name: "カードを追加" }),
  ).toBeVisible();
  await page.getByLabel("表", { exact: true }).fill(front);
  await page.getByLabel("裏", { exact: true }).fill(back);
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page).toHaveURL(CARDS_URL);
  await expect(cardItem(page, front)).toBeVisible();
}

async function openCardsWithAppleAndBanana(page: Page) {
  await ensureCard(page, "apple", "りんご");
  await ensureCard(page, "banana", "バナナ");
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(cardItem(page, "apple")).toBeVisible();
  await expect(cardItem(page, "banana")).toBeVisible();
}

test("AC1: /cards の「検索」に「app」と入力すると「apple」だけが表示される", async ({
  page,
}) => {
  await openCardsWithAppleAndBanana(page);

  await page.getByLabel("検索", { exact: true }).fill("app");

  await expect(cardItem(page, "apple")).toBeVisible();
  await expect(cardItem(page, "banana")).toBeHidden();

  await page.screenshot({
    path: "screenshots/issue-4/AC1.png",
    fullPage: true,
  });
});

test("AC2: 「検索」に「バナナ」と入力すると「banana」だけが表示される（裏も検索対象）", async ({
  page,
}) => {
  await openCardsWithAppleAndBanana(page);

  await page.getByLabel("検索", { exact: true }).fill("バナナ");

  await expect(cardItem(page, "banana")).toBeVisible();
  await expect(cardItem(page, "apple")).toBeHidden();

  await page.screenshot({
    path: "screenshots/issue-4/AC2.png",
    fullPage: true,
  });
});

test("AC3: 「検索」に「APPLE」と入力すると「apple」が表示される（大文字小文字を区別しない）", async ({
  page,
}) => {
  await openCardsWithAppleAndBanana(page);

  await page.getByLabel("検索", { exact: true }).fill("APPLE");

  await expect(cardItem(page, "apple")).toBeVisible();
  await expect(cardItem(page, "banana")).toBeHidden();

  await page.screenshot({
    path: "screenshots/issue-4/AC3.png",
    fullPage: true,
  });
});

test("AC4: 「検索」に「zzz」と入力すると「一致するカードがありません」と表示される", async ({
  page,
}) => {
  await openCardsWithAppleAndBanana(page);

  await page.getByLabel("検索", { exact: true }).fill("zzz");

  await expect(page.getByText("一致するカードがありません")).toBeVisible();
  await expect(cardItem(page, "apple")).toBeHidden();
  await expect(cardItem(page, "banana")).toBeHidden();

  await page.screenshot({
    path: "screenshots/issue-4/AC4.png",
    fullPage: true,
  });
});

test("AC5: 「検索」に文字が入っている状態から「検索」を空にすると、すべてのカードが表示される", async ({
  page,
}) => {
  await openCardsWithAppleAndBanana(page);

  const search = page.getByLabel("検索", { exact: true });
  await search.fill("app");
  await expect(cardItem(page, "banana")).toBeHidden();

  await search.fill("");

  await expect(search).toHaveValue("");
  await expect(cardItem(page, "apple")).toBeVisible();
  await expect(cardItem(page, "banana")).toBeVisible();
  await expect(page.getByText("一致するカードがありません")).toBeHidden();

  await page.screenshot({
    path: "screenshots/issue-4/AC5.png",
    fullPage: true,
  });
});
