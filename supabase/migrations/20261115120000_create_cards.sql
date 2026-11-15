-- Issue #2: カードを追加する
-- ログインはないので、全員が同じカードを読み書きする（anon に select と insert を許す）。
create table public.cards (
  id bigint generated always as identity primary key,
  -- 長さの上限は src/lib/cards/validate.ts の CARD_TEXT_MAX_LENGTH と揃える。
  -- REST API へ直接書き込まれても、空や長すぎる値は DB で弾く。
  front text not null
    check (char_length(btrim(front)) > 0 and char_length(front) <= 200),
  back text not null
    check (char_length(btrim(back)) > 0 and char_length(back) <= 200),
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

grant select, insert on table public.cards to anon, authenticated;

create policy "cards_select_all"
  on public.cards for select
  to anon, authenticated
  using (true);

create policy "cards_insert_all"
  on public.cards for insert
  to anon, authenticated
  with check (true);
