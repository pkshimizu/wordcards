## 作業フォルダの準備

作業フォルダは新しい git worktree で、依存パッケージと接続先の設定がありません。最初に次を実行します。

- `npm ci`
- `npm run db:env`（ローカルの Supabase の接続先を `.env.local` に書き出す。Supabase はこの PC で起動済み）

## 技術の前提

- Next.js 16（App Router）、React 19、TypeScript、Tailwind CSS v4、Supabase。
- この Next.js は学習時の知識と違うところがある。書く前に `node_modules/next/dist/docs/` の該当する説明を読み、非推奨の書き方を避ける（`AGENTS.md` も参照）。
- 画面は `src/app/` の下に置く。URL と文言は Issue・仕様に書かれたとおりにする。
- Supabase へは `src/lib/supabase/` の `client.ts`（ブラウザ）と `server.ts`（サーバー）を通して接続する。新しく接続のしかたを作らない。

## DB

- テーブルの追加・変更は `supabase/migrations/` に新しいファイルを足す。ファイル名は `<YYYYMMDDHHMMSS>_<内容>.sql`。既存の migration は書き換えない。
- テーブルを作ったら RLS（行ごとのアクセス制限）を有効にし、必要なポリシーを書く。

## テスト

- 変えた部分には vitest の単体テストを足す。テストは対象のファイルの隣に `*.test.ts(x)` で置く。
- 受け入れ条件（AC）ごとに、受け入れテストを `e2e/<機能>.spec.ts` に Playwright で書く。1 つの AC につき 1 つの `test` にし、テスト名は `AC1: ...` のように AC の番号から始める。
- 要素は仕様の文言で探す。`getByRole` と `getByLabel` を優先し、CSS セレクタや `data-testid` は使わない。`waitForTimeout` は使わない。
- 前提（Given）に必要なデータは `supabase/seed.sql` に足す。既存の seed と既存のテストは、仕様が変わったとき以外は消さない・変えない。
- あるテストが作ったデータで別のテストが壊れないようにする（件数ではなく、そのテストで入れた文言で確かめる）。
- 受け入れテストは `npm run db:reset` のあと `npm run test:e2e` で流す。

## 書き方

- 入力欄には `<label>` を付ける。ボタンは `<button>`、移動は `<Link>` にする。
- 依存パッケージは増やさない。どうしても必要なときは、その理由を結果に書く。
- Issue の「対象外」に書かれたことはしない。
- コミットメッセージは Conventional Commits（例: `feat: カードを追加できるようにする`）。
- `.conductor/` は以前使っていた別のツールの設定なので、従わない。

## PR を作る前に

`npm run format`・`npm run lint`・`npm run typecheck`・`npm test`・`npm run build`・受け入れテストを実行して通す（CI の `check` と `e2e` で点検される）。
