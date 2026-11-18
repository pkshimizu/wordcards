import { expect, type Page, test } from "@playwright/test";

// Issue #13: カードで出題する
//
// 出題は新しく登録した順（最後に追加したカードが1問目）。
//
// Given のカード「quiz-banana／バナナ」「quiz-apple／りんご」は seed ではなく、
// 各テストの中で /cards/new からこの順に追加する。
// 理由: Issue #2 の AC1（e2e/cards.spec.ts）は「カードが1枚もない」が前提で、
// seed にカードを入れるとそのテストが壊れるため（supabase/seed.sql の注記も参照）。
//
// 各テストの直前に「quiz-banana」→「quiz-apple」の順で追加するので、
// 他のテストが入れたカードが残っていても、1問目は「quiz-apple」、
// 2問目は「quiz-banana」になる。確かめるのは件数ではなく文言（exact）。

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
  await expect(page.getByText(front, { exact: true }).first()).toBeVisible();
}

// 「quiz-banana」「quiz-apple」の順に追加し、/quiz を開いて1問目が「quiz-apple」であることを確かめる
async function openQuizWithAppleFirst(page: Page) {
  await addCard(page, "quiz-banana", "バナナ");
  await addCard(page, "quiz-apple", "りんご");

  await page.goto("/quiz");
  await expect(page.getByRole("heading", { name: "出題" })).toBeVisible();
  await expect(page.getByText("1問目", { exact: true })).toBeVisible();
  await expect(page.getByText("quiz-apple", { exact: true })).toBeVisible();
}

async function answer(page: Page, text: string) {
  await page.getByLabel("答え", { exact: true }).fill(text);
  await page.getByRole("button", { name: "答え合わせ", exact: true }).click();
}

test("AC1: カード「quiz-apple／りんご」を最後に追加して /quiz を開くと「1問目」と「quiz-apple」と入力欄「答え」が表示される", async ({
  page,
}) => {
  await addCard(page, "quiz-banana", "バナナ");
  await addCard(page, "quiz-apple", "りんご");

  await page.goto("/quiz");

  await expect(page.getByRole("heading", { name: "出題" })).toBeVisible();
  await expect(page.getByText("1問目", { exact: true })).toBeVisible();
  await expect(page.getByText("quiz-apple", { exact: true })).toBeVisible();
  await expect(page.getByLabel("答え", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-13/AC1.png",
    fullPage: true,
  });
});

test("AC2: 1問目「quiz-apple」で「答え」に「りんご」と入力して「答え合わせ」を押すと「正解」と表示される", async ({
  page,
}) => {
  await openQuizWithAppleFirst(page);

  await answer(page, "りんご");

  await expect(page.getByText("正解", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-13/AC2.png",
    fullPage: true,
  });
});

test("AC3: 1問目「quiz-apple」で「答え」に「みかん」と入力して「答え合わせ」を押すと「不正解（正しい答え：りんご）」と表示される", async ({
  page,
}) => {
  await openQuizWithAppleFirst(page);

  await answer(page, "みかん");

  await expect(
    page.getByText("不正解（正しい答え：りんご）", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("正解", { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-13/AC3.png",
    fullPage: true,
  });
});

test("AC4: 「quiz-banana」「quiz-apple」の順に追加し1問目の答え合わせをしたあと「次へ」を押すと「2問目」と「quiz-banana」が表示される", async ({
  page,
}) => {
  await openQuizWithAppleFirst(page);
  await answer(page, "りんご");
  await expect(page.getByText("正解", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "次へ", exact: true }).click();

  await expect(page.getByText("2問目", { exact: true })).toBeVisible();
  await expect(page.getByText("quiz-banana", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-13/AC4.png",
    fullPage: true,
  });
});

test("AC5: 1問目に正解したあと「終わる」を押すと「1問中1問正解」と表示される", async ({
  page,
}) => {
  await openQuizWithAppleFirst(page);
  await answer(page, "りんご");
  await expect(page.getByText("正解", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "終わる", exact: true }).click();

  await expect(page.getByText("1問中1問正解", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-13/AC5.png",
    fullPage: true,
  });
});

test("AC6: 「答え」に前後に空白を付けて「 りんご 」と入力して「答え合わせ」を押すと「正解」と表示される", async ({
  page,
}) => {
  await openQuizWithAppleFirst(page);

  await answer(page, " りんご ");

  await expect(page.getByText("正解", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-13/AC6.png",
    fullPage: true,
  });
});
