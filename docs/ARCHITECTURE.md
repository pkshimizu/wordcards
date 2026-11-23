# アーキテクチャ

## 技術

- Next.js 16（App Router）、React 19、TypeScript、Tailwind CSS v4
- Supabase（PostgreSQL）。ローカルは Docker で動かす（API のポートは 55321 など）
- テスト: Vitest ＋ Testing Library（単体）、Playwright（受け入れテスト）
- 開発サーバーと `next start` のポートは 3100

この Next.js は、広く知られている版と違うところがあります。書く前に `node_modules/next/dist/docs/` の該当する説明を読みます（`AGENTS.md` も参照）。

## 構成

```
src/app/                  画面（App Router）。URL ごとにフォルダを作る
  cards/                  カードの一覧・追加・編集・削除・検索
  quiz/                   出題と採点
  review/                 間違えたカードの復習
  flashcards/             カードモード
  api/                    API の入口
src/lib/supabase/         Supabase への接続（client.ts: ブラウザ、server.ts: サーバー）
src/lib/cards/            カードの入力の確かめ
supabase/migrations/      テーブルの定義（追加・変更ごとに 1 ファイル）
supabase/seed.sql         受け入れテストの初期データ
e2e/                      受け入れテスト（機能ごとに 1 ファイル）
docs/specs/               仕様（機能ごとに 1 ファイル）
```

## データ

- `cards`: カード（表・裏）
- `card_results`: 出題の答えの結果（復習に使う）
- テーブルは RLS（行ごとのアクセス制限）を有効にしています。

## 決まった形

- 画面は Server Component でデータを読み、操作のある部分だけを Client Component（`"use client"`）にして props で渡します。
- Supabase へは必ず `src/lib/supabase/` を通して接続します。
- 読み込みに失敗したときの画面は、`error.tsx` で `src/app/cards/error.tsx` を使い回します。
