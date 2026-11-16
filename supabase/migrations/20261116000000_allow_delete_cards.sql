-- Issue #3: カードを削除する
-- ログインはないので、全員が同じカードを削除できる（anon に delete を許す）。
grant delete on table public.cards to anon, authenticated;

create policy "cards_delete_all"
  on public.cards for delete
  to anon, authenticated
  using (true);
