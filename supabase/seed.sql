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

-- Issue #13（カードで出題する）: カードは入れない。
-- Issue #2 の AC1 と両立させるため、出題の前提になるカード
-- 「quiz-banana／バナナ」「quiz-apple／りんご」は e2e/quiz.spec.ts の各テストが
-- この順に /cards/new から追加する（新しい順の出題で quiz-apple が1問目になる）。

-- Issue #12（カードを編集する）: カードは入れない。
-- Issue #2 の AC1 と両立させるため、編集の前提になるカード（Issue の「aple／りんご」）は
-- e2e/edit-cards.spec.ts の各テストが /cards/new から追加する。
-- 他の spec のカードとぶつからないよう、表・裏は「edit-AC{n}-」で始まる文言にしている。

-- Issue #14（間違えたカードを復習する）: カードも答えの結果も入れない。
-- Issue #2 の AC1 と両立させるため、復習の前提になるカード
-- 「review-apple／りんご」「review-banana／バナナ」は e2e/review.spec.ts の各テストが
-- /cards/new から追加し、/quiz・/review で答えて結果を作る。
-- 前のテストのカードが残らないよう、各テストの最初に /cards からこの2つを削除する。
