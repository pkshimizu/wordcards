"use client";

import { useRouter } from "next/navigation";

/**
 * Issue では「ボタン」と指定されているため、<Link> ではなく <button> で /cards/new に移動する。
 */
export function AddCardButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/cards/new")}
      className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
    >
      カードを追加
    </button>
  );
}
