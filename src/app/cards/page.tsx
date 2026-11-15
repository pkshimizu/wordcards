import { createClient } from "@/lib/supabase/server";

import { AddCardButton } from "./add-card-button";
import { CardList } from "./card-list";

export default async function CardsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("id, front, back")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`カードを読み込めませんでした: ${error.message}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">カード一覧</h1>
        <AddCardButton />
      </div>
      <CardList cards={data ?? []} />
    </main>
  );
}
