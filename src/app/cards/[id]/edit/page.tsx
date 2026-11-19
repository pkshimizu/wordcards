import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { CardForm } from "../../new/card-form";
import { updateCard } from "./actions";
import { parseCardId } from "./parse-card-id";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseCardId(rawId);

  let card: { front: string; back: string } | null = null;
  if (id !== null) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cards")
      .select("front, back")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      // 詳しい内容はサーバーのログにだけ残し、利用者には固定の文言を出す
      console.error("カードの読み込みに失敗しました", error);
      throw new Error("カードを読み込めませんでした");
    }
    card = data;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">カードを編集</h1>
      {id !== null && card ? (
        <CardForm
          action={updateCard.bind(null, id)}
          initialValues={{ front: card.front, back: card.back }}
          cancelHref="/cards"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            カードが見つかりません
          </p>
          <Link href="/cards" className="self-start underline">
            カード一覧へ戻る
          </Link>
        </div>
      )}
    </main>
  );
}
