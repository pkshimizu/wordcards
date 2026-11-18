import { expect, type Page, test } from "@playwright/test";

// Issue #12: カードを編集する
//
// Given のカード（Issue では「aple／りんご」）は seed ではなく、各テストの中で
// /cards/new から追加する。
// 理由: Issue #2 の AC1（e2e/cards.spec.ts）は「カードが1枚もない」が前提で、
// seed にカードを入れるとそのテストが壊れるため（supabase/seed.sql の注記も参照）。
//
// DB はテスト全体の前に1度だけ空にされるので、他の spec が入れたカード
// （Issue #2 の「apple」、Issue #3 の「apple-AC3」など）が残っている。
// それらと表の文言がぶつかると一覧で同じ文言が2件になり壊れるため、
// このファイルで使う表・裏の文言はすべて「edit-」で始め、AC 番号を含めて
// 他の spec ともこのファイルの他のテストとも重ならないようにしている。
// 表示・非表示は件数ではなく、そのテストで入れた文言（exact）で確かめる。

const CARDS_URL = /\/cards\/?(\?.*)?$/;
const EDIT_URL = /\/cards\/[^/?#]+\/edit\/?(\?.*)?$/;

async function addCard(page: Page, front: string, back: string) {
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

function cardItem(page: Page, front: string) {
  return page.getByRole("listitem").filter({
    has: page.getByText(front, { exact: true }),
  });
}

// /cards でそのカードの「編集」を押し、編集画面が開いたことを確かめる
async function openEdit(page: Page, front: string) {
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await cardItem(page, front)
    .getByRole("button", { name: "編集", exact: true })
    .click();
  await expect(page).toHaveURL(EDIT_URL);
  await expect(
    page.getByRole("heading", { name: "カードを編集" }),
  ).toBeVisible();
}

test("AC1: /cards でカード「aple／りんご」の「編集」を押すと、編集画面の「表」に aple、「裏」に りんご が入っている", async ({
  page,
}) => {
  const front = "edit-AC1-aple";
  const back = "edit-AC1-りんご";
  await addCard(page, front, back);

  await openEdit(page, front);

  await expect(page.getByLabel("表", { exact: true })).toHaveValue(front);
  await expect(page.getByLabel("裏", { exact: true })).toHaveValue(back);

  await page.screenshot({
    path: "screenshots/issue-12/AC1.png",
    fullPage: true,
  });
});

test("AC2: 編集画面で「表」を aple から apple に直して「保存」を押すと、/cards に戻り apple が表示され aple は表示されない", async ({
  page,
}) => {
  const before = "edit-AC2-aple";
  const after = "edit-AC2-apple";
  await addCard(page, before, "edit-AC2-りんご");
  await openEdit(page, before);

  await page.getByLabel("表", { exact: true }).fill(after);
  await page.getByRole("button", { name: "保存", exact: true }).click();

  await expect(page).toHaveURL(CARDS_URL);
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(cardItem(page, after)).toBeVisible();
  await expect(page.getByText(before, { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-12/AC2.png",
    fullPage: true,
  });
});

test("AC3: カードを編集して保存したあとページを再読み込みしても、直した内容が表示される", async ({
  page,
}) => {
  const before = "edit-AC3-aple";
  const after = "edit-AC3-apple";
  const afterBack = "edit-AC3-りんご直した";
  await addCard(page, before, "edit-AC3-りんご");
  await openEdit(page, before);

  await page.getByLabel("表", { exact: true }).fill(after);
  await page.getByLabel("裏", { exact: true }).fill(afterBack);
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page).toHaveURL(CARDS_URL);
  await expect(cardItem(page, after)).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(cardItem(page, after)).toBeVisible();
  await expect(
    cardItem(page, after).getByText(afterBack, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(before, { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-12/AC3.png",
    fullPage: true,
  });
});

test("AC4: 編集画面で「表」を空にして「保存」を押すと「表を入力してください」と表示され、カードは変わらない", async ({
  page,
}) => {
  const front = "edit-AC4-aple";
  const back = "edit-AC4-りんご";
  await addCard(page, front, back);
  await openEdit(page, front);

  await page.getByLabel("表", { exact: true }).fill("");
  await page.getByRole("button", { name: "保存", exact: true }).click();

  await expect(page.getByText("表を入力してください")).toBeVisible();

  // カードが変わっていないことを、一覧を開き直して確かめる
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(cardItem(page, front)).toBeVisible();
  await expect(
    cardItem(page, front).getByText(back, { exact: true }),
  ).toBeVisible();

  // 撮影は AC を確かめた画面（エラーの表示）にする
  await openEdit(page, front);
  await page.getByLabel("表", { exact: true }).fill("");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("表を入力してください")).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-12/AC4.png",
    fullPage: true,
  });
});

test("AC5: 編集画面で「表」を書き換えてから「やめる」を押すと、/cards に戻りカードは元のまま", async ({
  page,
}) => {
  const front = "edit-AC5-aple";
  const back = "edit-AC5-りんご";
  const changed = "edit-AC5-apple";
  await addCard(page, front, back);
  await openEdit(page, front);

  await page.getByLabel("表", { exact: true }).fill(changed);
  await page.getByRole("link", { name: "やめる", exact: true }).click();

  await expect(page).toHaveURL(CARDS_URL);
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(cardItem(page, front)).toBeVisible();
  await expect(
    cardItem(page, front).getByText(back, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(changed, { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-12/AC5.png",
    fullPage: true,
  });
});
