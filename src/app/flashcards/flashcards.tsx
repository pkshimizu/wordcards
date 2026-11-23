"use client";

import Link from "next/link";
import { useState } from "react";

import { advance, type Progress, type Random } from "./order";

export type Flashcard = { id: number; front: string; back: string };

type Props = {
  /** 最初の一巡の順番に並べたカード（順番はサーバー側で決めて渡す） */
  cards: Flashcard[];
  /** 二巡目からの順番を決める乱数。テストでは決まった値に差し替える */
  random?: Random;
};

type State = Progress<Flashcard> & { side: "front" | "back" };

export function Flashcards({ cards, random = Math.random }: Props) {
  // 最初の描画では乱数を使わない（サーバーの描画とブラウザの描画を同じにするため）
  const [state, setState] = useState<State>({
    round: cards,
    position: 0,
    side: "front",
  });

  const backLink = (
    <Link href="/cards" className="self-start underline">
      カード一覧へ
    </Link>
  );

  const card = state.round[state.position];
  if (!card) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-zinc-600 dark:text-zinc-400">カードがありません</p>
        {backLink}
      </div>
    );
  }

  const showingFront = state.side === "front";

  function flip() {
    if (showingFront) {
      setState({ ...state, side: "back" });
      return;
    }
    // 裏を押したら次のカードの表へ。一巡の最後なら、ここで次の一巡の順番を決める
    setState({ ...advance(state, random), side: "front" });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={flip}
        className="flex min-h-48 w-full flex-col gap-4 rounded border border-zinc-300 px-6 py-6 text-left dark:border-zinc-700"
      >
        <span className="text-zinc-600 dark:text-zinc-400">
          {showingFront ? "表" : "裏"}
        </span>
        <span className="text-3xl font-semibold wrap-anywhere">
          {showingFront ? card.front : card.back}
        </span>
      </button>
      <p className="text-zinc-600 dark:text-zinc-400">
        {showingFront
          ? "カードを押すと裏を表示します"
          : "カードを押すと次のカードを表示します"}
      </p>
      {backLink}
    </div>
  );
}
