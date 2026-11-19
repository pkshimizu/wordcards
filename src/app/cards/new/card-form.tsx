"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { CreateCardState } from "./actions";

type Props = {
  action: (
    prev: CreateCardState,
    formData: FormData,
  ) => Promise<CreateCardState>;
  /** 入力欄に最初から入れておく値（編集のとき） */
  initialValues?: CreateCardState["values"];
  /** 指定すると「やめる」リンクを出す */
  cancelHref?: string;
};

export function CardForm({
  action,
  initialValues = { front: "", back: "" },
  cancelHref,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {
    errors: {},
    values: initialValues,
  });
  const { errors, values } = state;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="card-front" className="font-medium">
          表
        </label>
        <input
          id="card-front"
          name="front"
          type="text"
          defaultValue={values.front}
          aria-invalid={errors.front ? true : undefined}
          aria-describedby={errors.front ? "card-front-error" : undefined}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
        {errors.front && (
          <p id="card-front-error" role="alert" className="text-red-600">
            {errors.front}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="card-back" className="font-medium">
          裏
        </label>
        <input
          id="card-back"
          name="back"
          type="text"
          defaultValue={values.back}
          aria-invalid={errors.back ? true : undefined}
          aria-describedby={errors.back ? "card-back-error" : undefined}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
        {errors.back && (
          <p id="card-back-error" role="alert" className="text-red-600">
            {errors.back}
          </p>
        )}
      </div>
      {errors.form && (
        <p role="alert" className="text-red-600">
          {errors.form}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          保存
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="underline">
            やめる
          </Link>
        )}
      </div>
    </form>
  );
}
