import type { QuizCard } from "../quiz/quiz";

/** cards に card_results を埋め込んで読んだ1行（card_results は card_id が主キーなので1件か null） */
export type CardWithResult = QuizCard & {
  card_results:
    { correct: boolean } | { correct: boolean }[] | null | undefined;
};

/**
 * 復習するカード（最後に答えたときに不正解だったカード）だけを、並びを変えずに取り出す。
 * まだ答えていないカード・最後に正解したカードは含めない。
 */
export function pickReviewCards(rows: CardWithResult[]): QuizCard[] {
  return rows
    .filter((row) => {
      const result = Array.isArray(row.card_results)
        ? row.card_results[0]
        : row.card_results;
      return result?.correct === false;
    })
    .map(({ id, front, back }) => ({ id, front, back }));
}
