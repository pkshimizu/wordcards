-- Issue #2: カードを追加する
-- ログインはないので、全員が同じカードを読み書きする（anon に select と insert を許す）。
create table public.cards (
  id bigint generated always as identity primary key,
  front text not null check (char_length(btrim(front)) > 0),
  back text not null check (char_length(btrim(back)) > 0),
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
