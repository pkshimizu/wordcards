"use client";

export default function CardsError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        カードを読み込めませんでした
      </h1>
      <p>時間をおいてもう一度お試しください。</p>
      <button
        type="button"
        onClick={() => retry()}
        className="self-start rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        もう一度読み込む
      </button>
    </main>
  );
}
