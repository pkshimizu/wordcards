"use client";

import { useState } from "react";

import { type Card, CardList } from "./card-list";
import type { DeleteCardAction } from "./delete-card-button";
import { filterCards } from "./filter-cards";

type Props = { cards: Card[]; deleteAction: DeleteCardAction };

export function CardSearch({ cards, deleteAction }: Props) {
  const [query, setQuery] = useState("");
  const filtered = filterCards(cards, query);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="card-search" className="font-medium">
          検索
        </label>
        <input
          id="card-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </div>
      {cards.length > 0 && filtered.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          一致するカードがありません
        </p>
      ) : (
        <CardList cards={filtered} deleteAction={deleteAction} />
      )}
    </div>
  );
}
