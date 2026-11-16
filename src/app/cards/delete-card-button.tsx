"use client";

import { useActionState, useState } from "react";

import type { DeleteCardState } from "./actions";

export type DeleteCardAction = (
  prev: DeleteCardState,
  formData: FormData,
) => Promise<DeleteCardState>;

type Props = { cardId: number; action: DeleteCardAction };

export function DeleteCardButton({ cardId, action }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(action, {});

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
      >
        削除
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={cardId} />
      <p className="text-sm">削除しますか？</p>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        削除する
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
      >
        やめる
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
