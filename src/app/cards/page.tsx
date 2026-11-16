import Form from "next/form";

import { createClient } from "@/lib/supabase/server";

import { deleteCard } from "./actions";
import { CardList } from "./card-list";

export default async function CardsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("id, front, back")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) {
    // 詳しい内容はサーバーのログにだけ残し、利用者には固定の文言を出す
    console.error("カードの読み込みに失敗しました", error);
    throw new Error("カードを読み込めませんでした");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">カード一覧</h1>
        {/* Issue の指定どおり「ボタン」で /cards/new へ移動する */}
        <Form action="/cards/new">
          <button
            type="submit"
            className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            カードを追加
          </button>
        </Form>
      </div>
      <CardList cards={data ?? []} deleteAction={deleteCard} />
    </main>
  );
}
