import { createCard } from "./actions";
import { CardForm } from "./card-form";

export default function NewCardPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">カードを追加</h1>
      <CardForm action={createCard} />
    </main>
  );
}
