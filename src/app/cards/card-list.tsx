export type CardItem = {
  id: string;
  front: string;
  back: string;
};

export function CardList({ cards }: { cards: CardItem[] }) {
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
          className="flex gap-4 rounded border border-zinc-200 px-4 py-3 dark:border-zinc-800"
        >
          <span className="flex-1 font-medium">{card.front}</span>
          <span className="flex-1">{card.back}</span>
        </li>
      ))}
    </ul>
  );
}
