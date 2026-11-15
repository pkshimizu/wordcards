"use client";

import { useActionState } from "react";

import type { CreateCardState } from "./actions";

type Props = {
  action: (
    prev: CreateCardState,
    formData: FormData,
  ) => Promise<CreateCardState>;
};

const initialState: CreateCardState = {
  errors: {},
  values: { front: "", back: "" },
};

export function CardForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="card-front" className="font-medium">
          表
        </label>
        <input
          id="card-front"
          name="front"
          type="text"
          defaultValue={state.values.front}
          aria-invalid={state.errors.front ? true : undefined}
          aria-describedby={state.errors.front ? "card-front-error" : undefined}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
        {state.errors.front && (
          <p id="card-front-error" role="alert" className="text-red-600">
            {state.errors.front}
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
          defaultValue={state.values.back}
          aria-invalid={state.errors.back ? true : undefined}
          aria-describedby={state.errors.back ? "card-back-error" : undefined}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
        {state.errors.back && (
          <p id="card-back-error" role="alert" className="text-red-600">
            {state.errors.back}
          </p>
        )}
      </div>
      {state.errors.form && (
        <p role="alert" className="text-red-600">
          {state.errors.form}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          保存
        </button>
      </div>
    </form>
  );
}
