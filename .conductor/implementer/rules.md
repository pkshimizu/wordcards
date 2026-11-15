## 技術の前提

- Next.js 16（App Router）、React 19、TypeScript、Tailwind CSS v4、Supabase。
- この Next.js は学習時の知識と違うところがある。書く前に `node_modules/next/dist/docs/` の該当する説明を読み、非推奨の書き方を避ける（`AGENTS.md` も参照）。
- 画面は `src/app/` の下に置く。URL は Issue の「画面の URL・文言」に合わせる。
- Supabase へは `src/lib/supabase/` の `client.ts`（ブラウザ）と `server.ts`（サーバー）を通して接続する。新しく接続のしかたを作らない。

## DB

- テーブルの追加・変更は `supabase/migrations/` に新しいファイルを足す。ファイル名は `<YYYYMMDDHHMMSS>_<内容>.sql`。既存の migration は書き換えない。
- テーブルを作ったら RLS（行ごとのアクセス制限）を有効にし、必要なポリシーを書く。
- `supabase/seed.sql` と `e2e/` はテスト役のもの。変えてはいけない。

## 書き方

- 画面の文言は Issue に書かれたとおりにする（受け入れテストが文言で要素を探す）。
- 入力欄には `<label>` を付ける。ボタンは `<button>`、移動は `<Link>` にする。
- 変えた部分には vitest の単体テストを足す。テストは対象のファイルの隣に `*.test.ts(x)` で置く。
- 依存パッケージは増やさない。どうしても必要なときは、その理由を結果に書く。
- Issue の「対象外」に書かれたことはしない。

## 終える前に

- `npm run format` で整形し、`npm run lint` が通ることを確かめる（CI で点検される）。
