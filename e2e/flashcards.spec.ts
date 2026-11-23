import { expect, type Page, test } from "@playwright/test";

// Issue #20: カードモードを追加する（仕様: docs/specs/flashcards.md）
//
// /flashcards は、登録されているすべてのカードを一巡ごとにランダムな順で 1 枚ずつ表示する。
// 表を押すと同じカードの裏、裏を押すと次のカードの表を表示する。
//
// Given のカードは seed ではなく、各テストの中で /cards/new から追加する。
// 理由: Issue #2 の AC1（e2e/cards.spec.ts）は「カードが1枚もない」が前提で、
// seed にカードを入れるとそのテストが壊れるため（supabase/seed.sql の注記も参照）。
//
// DB はテスト全体の前に1度だけ空にされるので、各テストの最初に、
// このファイルが使う表の文字のカードを /cards からすべて削除してから Given を作る。
// こうすると、そのテストで追加したカードは、表の文字ごとにちょうど 1 枚になる。
//
// ほかの spec が残したカード（表も裏も同じ文字のカードが複数ある）も /flashcards に出る。
// 文字で確かめるのは、そのテストで追加したカードだけにする
// （id が同じかどうか・乱数による順番は、src/app/flashcards/ の単体テストで確かめる）。

const CARDS_URL = /\/cards\/?(\?.*)?$/;
const LONG_FRONT = `flash-long-${"a".repeat(189)}`;
const LONG_BACK = "あ".repeat(200);
const FLASH_FRONTS = [
  "flash-apple",
  "flash-banana",
  "flash-cherry",
  LONG_FRONT,
];

const FRONT_HINT = "カードを押すと裏を表示します";
const BACK_HINT = "カードを押すと次のカードを表示します";

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
  await expect(cardItem(page, front)).toHaveCount(1);
}

// N: 登録されているカードの枚数（/cards の一覧の項目の数）
async function countCards(page: Page) {
  await page.goto("/cards");
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
  await expect(page.getByRole("listitem").first()).toBeVisible();
  return page.getByRole("listitem").count();
}

function flashcard(page: Page) {
  return page.getByRole("main").getByRole("button");
}

function frontLabel(page: Page) {
  return page.getByText("表", { exact: true });
}

function backLabel(page: Page) {
  return page.getByText("裏", { exact: true });
}

async function openFlashcards(page: Page) {
  await page.goto("/flashcards");
  await expect(
    page.getByRole("heading", { name: "カードモード" }),
  ).toBeVisible();
  await expect(frontLabel(page)).toBeVisible();
}

// 表を押して裏を表示する
async function showBack(page: Page) {
  await flashcard(page).click();
  await expect(backLabel(page)).toBeVisible();
}

// 裏を押して次のカードの表を表示する
async function showNextFront(page: Page) {
  await flashcard(page).click();
  await expect(frontLabel(page)).toBeVisible();
}

// 1 枚進める（表 → 裏 → 次のカードの表）
async function advance(page: Page) {
  await showBack(page);
  await showNextFront(page);
}

// /flashcards を開き、front の表が表示されるまで 1 枚ずつ進める（多くても N 枚）
async function openFlashcardsAt(page: Page, front: string) {
  const total = await countCards(page);
  await openFlashcards(page);
  const target = page.getByText(front, { exact: true });
  for (let seen = 1; seen < total && !(await target.isVisible()); seen += 1) {
    await advance(page);
  }
  await expect(target).toBeVisible();
  await expect(frontLabel(page)).toBeVisible();
}

// 今の表から count 枚の表を順に見て、fronts のそれぞれが表示された回数を数える。
// 最後のカードは表を表示したままにする
async function countFronts(page: Page, count: number, fronts: string[]) {
  const counts = new Map(fronts.map((front) => [front, 0]));
  for (let seen = 1; seen <= count; seen += 1) {
    await expect(frontLabel(page)).toBeVisible();
    for (const front of fronts) {
      if (await page.getByText(front, { exact: true }).isVisible()) {
        counts.set(front, (counts.get(front) ?? 0) + 1);
      }
    }
    if (seen < count) await advance(page);
  }
  return counts;
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

// /review の問題を最後まで進め、どの問題にも front が出ないことを確かめる
// （途中のカードには間違った答えを入れるので、復習するカードの顔ぶれは変わらない）
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

    await answer(page, "flash-わからない");
    await page.getByRole("button", { name: /^(次へ|結果を見る)$/ }).click();

    const next = page.getByText(`${n + 1}問目`, { exact: true });
    await expect(next.or(finished)).toBeVisible();
    if (await finished.isVisible()) return;
  }
  throw new Error("/review の問題が終わらない");
}

async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.beforeEach(async ({ page }) => {
  for (const front of FLASH_FRONTS) {
    await deleteCardsByFront(page, front);
  }
});

test("AC1: /flashcards で「flash-apple」まで進めると、見出し「カードモード」、面のラベル「表」、「flash-apple」、操作の説明、リンク「カード一覧へ」が表示され、裏は表示されない", async ({
  page,
}) => {
  await addCard(page, "flash-apple", "りんご");

  await openFlashcardsAt(page, "flash-apple");

  await expect(
    page.getByRole("heading", { name: "カードモード" }),
  ).toBeVisible();
  await expect(frontLabel(page)).toBeVisible();
  await expect(page.getByText("flash-apple", { exact: true })).toBeVisible();
  await expect(page.getByText(FRONT_HINT, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "カード一覧へ", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("りんご", { exact: true })).toHaveCount(0);
  await expect(backLabel(page)).toHaveCount(0);
  await expect(page.getByText(BACK_HINT, { exact: true })).toHaveCount(0);
  await expect(flashcard(page)).toHaveCount(1);
});

test("AC2: 「flash-apple」の表を押すと、面のラベル「裏」、「りんご」、「カードを押すと次のカードを表示します」が表示され、表は表示されない", async ({
  page,
}) => {
  await addCard(page, "flash-apple", "りんご");
  await openFlashcardsAt(page, "flash-apple");

  await flashcard(page).click();

  await expect(backLabel(page)).toBeVisible();
  await expect(page.getByText("りんご", { exact: true })).toBeVisible();
  await expect(page.getByText(BACK_HINT, { exact: true })).toBeVisible();
  await expect(page.getByText("flash-apple", { exact: true })).toHaveCount(0);
  await expect(frontLabel(page)).toHaveCount(0);
  await expect(page.getByText(FRONT_HINT, { exact: true })).toHaveCount(0);
});

test("AC3: 「flash-apple」の裏を押すと、次のカードの表が表示され、「flash-apple」は続けて表示されない", async ({
  page,
}) => {
  await addCard(page, "flash-apple", "りんご");
  await addCard(page, "flash-banana", "バナナ");
  await openFlashcardsAt(page, "flash-apple");
  await showBack(page);
  await expect(page.getByText("りんご", { exact: true })).toBeVisible();

  await flashcard(page).click();

  await expect(frontLabel(page)).toBeVisible();
  await expect(page.getByText(FRONT_HINT, { exact: true })).toBeVisible();
  await expect(backLabel(page)).toHaveCount(0);
  await expect(page.getByText(BACK_HINT, { exact: true })).toHaveCount(0);
  await expect(page.getByText("flash-apple", { exact: true })).toHaveCount(0);
});

test("AC4: 最初のカードから N 枚の表を順に見ると、「flash-apple」と「flash-banana」はそれぞれちょうど 1 回表示される", async ({
  page,
}) => {
  await addCard(page, "flash-apple", "りんご");
  await addCard(page, "flash-banana", "バナナ");
  const total = await countCards(page);

  await openFlashcards(page);
  const counts = await countFronts(page, total, [
    "flash-apple",
    "flash-banana",
  ]);

  expect(counts.get("flash-apple")).toBe(1);
  expect(counts.get("flash-banana")).toBe(1);
});

test("AC5: N 枚目のカードの裏を押しても終わりの画面にならず、次の N 枚でも「flash-apple」がちょうど 1 回表示される", async ({
  page,
}) => {
  await addCard(page, "flash-apple", "りんご");
  await addCard(page, "flash-banana", "バナナ");
  const total = await countCards(page);
  await openFlashcards(page);
  await countFronts(page, total, []);
  await showBack(page);

  await flashcard(page).click();

  await expect(
    page.getByRole("heading", { name: "カードモード" }),
  ).toBeVisible();
  await expect(frontLabel(page)).toBeVisible();
  await expect(page.getByText(FRONT_HINT, { exact: true })).toBeVisible();

  const counts = await countFronts(page, total, ["flash-apple"]);
  expect(counts.get("flash-apple")).toBe(1);
});

test("AC6: リンク「カード一覧へ」を押すと /cards へ移動し、見出し「カード一覧」が表示される", async ({
  page,
}) => {
  await page.goto("/flashcards");
  await expect(
    page.getByRole("heading", { name: "カードモード" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "カード一覧へ", exact: true }).click();

  await expect(page).toHaveURL(CARDS_URL);
  await expect(page.getByRole("heading", { name: "カード一覧" })).toBeVisible();
});

test("AC7: /quiz で不正解にした「flash-banana」は、カードモードで表と裏を見ても /review の「1問目」に表示される", async ({
  page,
}) => {
  await addCard(page, "flash-banana", "バナナ");
  await openQuizWithFirst(page, "flash-banana");
  await answer(page, "みかん");
  await expect(
    page.getByText("不正解（正しい答え：バナナ）", { exact: true }),
  ).toBeVisible();

  await openFlashcardsAt(page, "flash-banana");
  await showBack(page);
  await expect(page.getByText("バナナ", { exact: true })).toBeVisible();
  await page.goto("/review");

  await expect(page.getByRole("heading", { name: "復習" })).toBeVisible();
  await expect(page.getByText("1問目", { exact: true })).toBeVisible();
  await expect(page.getByText("flash-banana", { exact: true })).toBeVisible();
});

test("AC8: /quiz で正解した「flash-cherry」は、カードモードで表と裏を見ても /review のどの問題にも表示されない", async ({
  page,
}) => {
  await addCard(page, "flash-cherry", "さくらんぼ");
  await openQuizWithFirst(page, "flash-cherry");
  await answer(page, "さくらんぼ");
  await expect(page.getByText("正解", { exact: true })).toBeVisible();

  await openFlashcardsAt(page, "flash-cherry");
  await showBack(page);
  await expect(page.getByText("さくらんぼ", { exact: true })).toBeVisible();

  await expectNotInReview(page, "flash-cherry");
});

test("AC9: カードにフォーカスして Enter を押すと裏が、続けて Space を押すと次のカードの表が表示される", async ({
  page,
}) => {
  await addCard(page, "flash-apple", "りんご");
  await openFlashcardsAt(page, "flash-apple");

  await flashcard(page).focus();
  await page.keyboard.press("Enter");

  await expect(backLabel(page)).toBeVisible();
  await expect(page.getByText("りんご", { exact: true })).toBeVisible();

  await expect(flashcard(page)).toBeFocused();
  await page.keyboard.press("Space");

  await expect(frontLabel(page)).toBeVisible();
  await expect(page.getByText(FRONT_HINT, { exact: true })).toBeVisible();
});

test("AC10: 200 文字の表と裏が省略されずに表示され、どちらのときも画面に横スクロールが出ない", async ({
  page,
}) => {
  await addCard(page, LONG_FRONT, LONG_BACK);

  await openFlashcardsAt(page, LONG_FRONT);

  await expect(page.getByText(LONG_FRONT, { exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);

  await flashcard(page).click();

  await expect(backLabel(page)).toBeVisible();
  await expect(page.getByText(LONG_BACK, { exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);
});
