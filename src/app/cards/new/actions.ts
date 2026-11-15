"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { validateCardInput, type CardErrors } from "@/lib/cards/validate";

export type CreateCardState = {
  errors: CardErrors & { form?: string };
  values: { front: string; back: string };
};

export async function createCard(
  _prev: CreateCardState,
  formData: FormData,
): Promise<CreateCardState> {
  const rawFront = formData.get("front");
  const rawBack = formData.get("back");
  const values = {
    front: typeof rawFront === "string" ? rawFront : "",
    back: typeof rawBack === "string" ? rawBack : "",
  };

  const result = validateCardInput({ front: rawFront, back: rawBack });
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cards").insert(result.value);
  if (error) {
    console.error("カードの保存に失敗しました", error);
    return {
      errors: { form: "保存できませんでした。もう一度お試しください" },
      values,
    };
  }

  revalidatePath("/cards");
  redirect("/cards");
}
