-- テスト用のデータ。npm run db:reset のたびに DB を空にしてから入れ直す。
-- 機能の Issue で、受け入れテストに必要なデータを追加する。

-- Issue #2（カードを追加する）: カードは入れない。
-- AC1 の前提「カードが1枚もない」を保つため、cards は空のまま始める。

-- Issue #3（カードを削除する）: カードは入れない。
-- Issue #2 の AC1 と両立させるため、削除の前提になるカードは
-- e2e/delete-cards.spec.ts の各テストが /cards/new から追加する。

-- Issue #4（カードを検索する）: カードは入れない。
-- Issue #2 の AC1 と両立させるため、検索の前提になるカード
-- 「apple／りんご」「banana／バナナ」は e2e/search-cards.spec.ts の各テストが
-- まだ無ければ /cards/new から追加する。
