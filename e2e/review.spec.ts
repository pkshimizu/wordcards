import { expect, type Page, test } from "@playwright/test";

// Issue #14: 間違えたカードを復習する
//
// 「復習するカード」＝最後に答えたときに不正解だったカード。出題は新しく登録した順。
//
// Given のカード「review-apple／りんご」「review-banana／バナナ」は seed ではなく、
// 各テストの中で /cards/new から追加する。
// 理由: Issue #2 の AC1（e2e/cards.spec.ts）は「カードが1枚もない」が前提で、
// seed にカードを入れるとそのテストが壊れるため（supabase/seed.sql の注記も参照）。
//
// DB はテスト全体の前に1度だけ空にされるので、前のテストが入れた
// 「review-apple」が不正解のまま残っていると、「出題されない」の確認が壊れる。
// そのため各テストの最初に、/cards から「review-apple」「review-banana」を
// すべて削除してから Given を作る（Issue の文言どおりのカード名を使うため）。
//
// 他の spec が残したカード（例: e2e/quiz.spec.ts で不正解にした quiz-apple）も
// /review に出ることがある。確かめるのは件数ではなく、そのテストで入れた文言（exact）。
// 「出題されない」は1問目だけでなく、/review の問題を最後まで1問ずつ進めて確かめる
// （途中のカードには間違った答えを入れるので、復習するカードの顔ぶれは変わらない）。

const CARDS_URL = /\/cards\/?(\?.*)?$/;
const REVIEW_FRONTS = ["review-apple", "review-banana"];

function cardItem(page: Page, front: string) {
  return page.getByRole("listitem").filter({
    has: page.getByText(front, { exact: true }),
  });
}

async function deleteCardsByFront(page: Page, front: string) {
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  for (let remaining = await cardItem(page, front).count(); remaining > 0;) {
    await cardItem(page, front)
      .first()
      .getByRole("button", { name: "削除", exact: true })
      .click();
    await expect(page.getByText("削除しますか？")).toBeVisible();
    await page.getByRole("button", { name: "削除する", exact: true }).click();
    remaining -= 1;
    await expect(cardItem(page, front)).toHaveCount(remaining);
  }
}

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

async function answer(page: Page, text: string) {
  await page.getByLabel("答え", { exact: true }).fill(text);
  await page.getByRole("button", { name: "答え合わせ", exact: true }).click();
}

// /quiz を開き、1問目が front であることを確かめる（最後に追加したカードが1問目）
async function openQuizWithFirst(page: Page, front: string) {
  await page.goto("/quiz");
  await expect(page.getByRole("heading", { name: "出題" })).toBeVisible();
  await expect(page.getByText("1問目", { exact: true })).toBeVisible();
  await expect(page.getByText(front, { exact: true })).toBeVisible();
}

// /review を開き、見出し「復習」と1問目が front であることを確かめる
async function openReviewWithFirst(page: Page, front: string) {
  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "復習" })).toBeVisible();
  await expect(page.getByText("1問目", { exact: true })).toBeVisible();
  await expect(page.getByText(front, { exact: true })).toBeVisible();
}

// /review の問題を最後まで進め、どの問題にも front が出ないことを確かめる
async function expectNotInReview(page: Page, front: string) {
  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "復習" })).toBeVisible();

  const empty = page.getByText("復習するカードはありません", { exact: true });
  const firstQuestion = page.getByText("1問目", { exact: true });
  await expect(empty.or(firstQuestion)).toBeVisible();
  if (await empty.isVisible()) return;

  const finished = page.getByText(/^\d+問中\d+問正解$/);
  for (let n = 1; n <= 100; n += 1) {
    await expect(page.getByText(`${n}問目`, { exact: true })).toBeVisible();
    await expect(page.getByText(front, { exact: true })).toHaveCount(0);

    await answer(page, "review-わからない");
    await page.getByRole("button", { name: /^(次へ|結果を見る)$/ }).click();

    const next = page.getByText(`${n + 1}問目`, { exact: true });
    await expect(next.or(finished)).toBeVisible();
    if (await finished.isVisible()) return;
  }
  throw new Error("/review の問題が終わらない");
}

test.beforeEach(async ({ page }) => {
  for (const front of REVIEW_FRONTS) {
    await deleteCardsByFront(page, front);
  }
});

test("AC1: カード「review-apple／りんご」を追加し /quiz で「みかん」と答えたあと /review を開くと「1問目」と「review-apple」が表示される", async ({
  page,
}) => {
  await addCard(page, "review-apple", "りんご");
  await openQuizWithFirst(page, "review-apple");
  await answer(page, "みかん");
  await expect(
    page.getByText("不正解（正しい答え：りんご）", { exact: true }),
  ).toBeVisible();

  await page.goto("/review");

  await expect(page.getByRole("heading", { name: "復習" })).toBeVisible();
  await expect(page.getByText("1問目", { exact: true })).toBeVisible();
  await expect(page.getByText("review-apple", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-14/AC1.png",
    fullPage: true,
  });
});

test("AC2: AC1 のあとページを再読み込みしてから /review を開いても「review-apple」が出題される", async ({
  page,
}) => {
  await addCard(page, "review-apple", "りんご");
  await openQuizWithFirst(page, "review-apple");
  await answer(page, "みかん");
  await expect(
    page.getByText("不正解（正しい答え：りんご）", { exact: true }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "出題" })).toBeVisible();

  await page.goto("/review");

  await expect(page.getByRole("heading", { name: "復習" })).toBeVisible();
  await expect(page.getByText("1問目", { exact: true })).toBeVisible();
  await expect(page.getByText("review-apple", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "screenshots/issue-14/AC2.png",
    fullPage: true,
  });
});

test("AC3: 「review-apple」を間違えたあと /review で「りんご」と正しく答えると、/review を開き直しても「review-apple」は出題されない", async ({
  page,
}) => {
  await addCard(page, "review-apple", "りんご");
  await openQuizWithFirst(page, "review-apple");
  await answer(page, "みかん");
  await expect(
    page.getByText("不正解（正しい答え：りんご）", { exact: true }),
  ).toBeVisible();

  await openReviewWithFirst(page, "review-apple");
  await answer(page, "りんご");
  await expect(page.getByText("正解", { exact: true })).toBeVisible();

  await expectNotInReview(page, "review-apple");

  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "復習" })).toBeVisible();
  await expect(page.getByText("review-apple", { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-14/AC3.png",
    fullPage: true,
  });
});

test("AC4: カード「review-banana／バナナ」を追加し /quiz で「バナナ」と正しく答えたあと /review を開くと「review-banana」は出題されない", async ({
  page,
}) => {
  await addCard(page, "review-banana", "バナナ");
  await openQuizWithFirst(page, "review-banana");
  await answer(page, "バナナ");
  await expect(page.getByText("正解", { exact: true })).toBeVisible();

  await expectNotInReview(page, "review-banana");

  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "復習" })).toBeVisible();
  await expect(page.getByText("review-banana", { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-14/AC4.png",
    fullPage: true,
  });
});

test("AC5: 「review-apple」を間違えたあと /quiz でもう一度「りんご」と正しく答えると、/review を開いても「review-apple」は出題されない", async ({
  page,
}) => {
  await addCard(page, "review-apple", "りんご");
  await openQuizWithFirst(page, "review-apple");
  await answer(page, "みかん");
  await expect(
    page.getByText("不正解（正しい答え：りんご）", { exact: true }),
  ).toBeVisible();

  await openQuizWithFirst(page, "review-apple");
  await answer(page, "りんご");
  await expect(page.getByText("正解", { exact: true })).toBeVisible();

  await expectNotInReview(page, "review-apple");

  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "復習" })).toBeVisible();
  await expect(page.getByText("review-apple", { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: "screenshots/issue-14/AC5.png",
    fullPage: true,
  });
});
