import Form from "next/form";

import { type DeleteCardAction, DeleteCardButton } from "./delete-card-button";

export type Card = { id: number; front: string; back: string };

type Props = { cards: Card[]; deleteAction: DeleteCardAction };

export function CardList({ cards, deleteAction }: Props) {
  if (cards.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">カードがありません</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {cards.map((card) => (
        <li
          key={card.id}
          className="flex flex-wrap items-center gap-4 rounded border border-zinc-200 px-4 py-3 dark:border-zinc-800"
        >
          <span className="font-medium">{card.front}</span>
          <span className="text-zinc-600 dark:text-zinc-400">{card.back}</span>
          <div className="ml-auto flex items-center gap-2">
            {/* Issue の指定どおり「ボタン」で編集画面へ移動する */}
            <Form action={`/cards/${card.id}/edit`}>
              <button
                type="submit"
                className="rounded border border-zinc-300 px-3 py-1 dark:border-zinc-700"
              >
                編集
              </button>
            </Form>
            <DeleteCardButton cardId={card.id} action={deleteAction} />
          </div>
        </li>
      ))}
    </ul>
  );
}
