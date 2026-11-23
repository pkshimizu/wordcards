# 実装

## 作業フォルダ

作業フォルダは git worktree です。依存パッケージの導入（`npm ci`）と、ローカルの Supabase の接続先の書き出し（`npm run db:env`）は、Tasuki が実行済みです。Supabase はこの PC で起動済みです。

## 画面とデータ

- 画面は `src/app/` の下に置く。URL と文言は Issue・仕様に書かれたとおりにする。
- 入力欄には `<label>` を付ける。ボタンは `<button>`、移動は `<Link>` にする。
- Supabase へは `src/lib/supabase/` の `client.ts`（ブラウザ）と `server.ts`（サーバー）を通して接続する。新しく接続のしかたを作らない。
- テーブルの追加・変更は `supabase/migrations/` に新しいファイルを足す。ファイル名は `<YYYYMMDDHHMMSS>_<内容>.sql`。既存の migration は書き換えない。
- テーブルを作ったら RLS を有効にし、必要なポリシーを書く。

## そのほか

- 依存パッケージは増やさない。どうしても必要なときは、その理由を結果に書く。
- Issue の「対象外」に書かれたことはしない。

## PR を作る前に

`npm run format`・`npm run lint`・`npm run typecheck`・`npm test`・`npm run build`・受け入れテストを実行して通す（CI の `check` と `e2e` で点検される）。
