-- Issue #12: カードを編集する
-- ログインはないので、全員が同じカードを編集できる（anon に表・裏の update を許す）。
-- id と created_at は書き換えさせない。
grant update (front, back) on table public.cards to anon, authenticated;

create policy "cards_update_all"
  on public.cards for update
  to anon, authenticated
  using (true)
  with check (true);
