-- Issue #2: カードを追加する
-- ログインは対象外のため、全員（anon を含む）が同じカードを読み書きする。

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  front text not null check (char_length(btrim(front)) > 0),
  back text not null check (char_length(btrim(back)) > 0),
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

grant select, insert on table public.cards to anon, authenticated;

create policy "cards は誰でも読める"
  on public.cards
  for select
  to anon, authenticated
  using (true);

create policy "cards は誰でも追加できる"
  on public.cards
  for insert
  to anon, authenticated
  with check (true);
