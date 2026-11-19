"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { isCorrect } from "./grade";

export type QuizCard = { id: number; front: string; back: string };

/** 答え合わせの結果を保存する。失敗したら error に利用者向けの文言を入れて返す */
export type SaveResult = (
  cardId: number,
  correct: boolean,
) => Promise<{ error?: string }>;

type Props = {
  cards: QuizCard[];
  /** 出題するカードが無いときの文言 */
  emptyMessage?: string;
  /** 終わったあとの「もう一度」の行き先 */
  restartHref?: string;
  /** 答え合わせのたびに呼ぶ。結果は保存が終わってから表示する */
  saveResult?: SaveResult;
};

const buttonClass =
  "self-start rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900";
const subButtonClass =
  "self-start rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700";

const SAVE_ERROR = "答えの結果を保存できませんでした";

export function Quiz({
  cards,
  emptyMessage = "カードがありません",
  restartHref = "/quiz",
  saveResult,
}: Props) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  // 今の問題の答え合わせの結果。答え合わせ前は null
  const [result, setResult] = useState<boolean | null>(null);
  // 結果を保存している途中か
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (cards.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">{emptyMessage}</p>;
  }

  function restart() {
    setIndex(0);
    setAnswer("");
    setResult(null);
    setSaveError(null);
    setAnsweredCount(0);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg font-medium">
          {answeredCount}問中{correctCount}問正解
        </p>
        <div className="flex gap-4">
          <Link href={restartHref} onClick={restart} className="underline">
            もう一度
          </Link>
          <Link href="/cards" className="underline">
            カード一覧へ
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const isLast = index === cards.length - 1;

  function showResult(correct: boolean) {
    setResult(correct);
    setAnsweredCount((n) => n + 1);
    if (correct) setCorrectCount((n) => n + 1);
  }

  async function check(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (result !== null || saving) return;
    const correct = isCorrect(answer, card.back);
    if (!saveResult) {
      showResult(correct);
      return;
    }
    // 保存が終わってから結果を出す（結果が見えた時点で保存済みにするため）
    setSaving(true);
    let error: string | undefined;
    try {
      ({ error } = await saveResult(card.id, correct));
    } catch {
      error = SAVE_ERROR;
    }
    setSaving(false);
    setSaveError(error ?? null);
    showResult(correct);
  }

  function next() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setResult(null);
    setSaveError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-zinc-600 dark:text-zinc-400">{index + 1}問目</p>
      <p className="text-3xl font-semibold">{card.front}</p>
      <form onSubmit={check} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="quiz-answer" className="font-medium">
            答え
          </label>
          <input
            id="quiz-answer"
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            readOnly={result !== null || saving}
            autoComplete="off"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </div>
        {result === null && (
          <button type="submit" disabled={saving} className={buttonClass}>
            答え合わせ
          </button>
        )}
      </form>
      {result !== null && (
        <>
          <p role="status" className="text-lg font-medium">
            {result ? "正解" : `不正解（正しい答え：${card.back}）`}
          </p>
          {saveError && (
            <p role="alert" className="text-red-600 dark:text-red-400">
              {saveError}
            </p>
          )}
          <div className="flex gap-4">
            <button type="button" onClick={next} className={buttonClass}>
              {isLast ? "結果を見る" : "次へ"}
            </button>
            <button
              type="button"
              onClick={() => setFinished(true)}
              className={subButtonClass}
            >
              終わる
            </button>
          </div>
        </>
      )}
    </div>
  );
}
