-- Issue #14: 間違えたカードを復習する
-- /quiz と /review の答え合わせの結果を、カードごとに1行だけ保存する（最後に答えた結果で上書きする）。
-- 「復習するカード」＝ correct が false のカード。
-- カードを削除したら結果も消す（on delete cascade）。
-- ログインはないので、全員が同じ結果を読み書きする（anon に select・insert・update を許す）。
create table public.card_results (
  card_id bigint primary key references public.cards (id) on delete cascade,
  correct boolean not null,
  answered_at timestamptz not null default now()
);

alter table public.card_results enable row level security;

grant select, insert on table public.card_results to anon, authenticated;
-- 保存は upsert（insert ... on conflict (card_id) do update）で行う。
-- PostgREST の upsert は送った列をすべて SET するので、card_id にも update の権限が要る。
grant update (card_id, correct, answered_at) on table public.card_results to anon, authenticated;

create policy "card_results_select_all"
  on public.card_results for select
  to anon, authenticated
  using (true);

create policy "card_results_insert_all"
  on public.card_results for insert
  to anon, authenticated
  with check (true);

create policy "card_results_update_all"
  on public.card_results for update
  to anon, authenticated
  using (true)
  with check (true);
