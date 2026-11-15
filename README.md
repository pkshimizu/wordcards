# wordcards

単語と意味をカードにして覚える Web アプリです。
自律開発エージェント [conductor](https://github.com/pkshimizu/conductor) の練習用リポジトリで、機能は conductor が Issue から作ります。

## 技術

- Next.js 16（App Router）、TypeScript、Tailwind CSS
- Supabase（ローカルは Docker で動かす）
- テスト：Vitest（単体）、Playwright（受け入れテスト）

## 準備

Node 22 と Docker Desktop が必要です。

```sh
npm ci
npm run db:start   # Supabase を起動する（ポートは 55321 など）
npm run db:env     # 接続先を .env.local に書き出す
npx playwright install chromium
npm run dev        # http://127.0.0.1:3100
```

## コマンド

| コマンド                                                      | 内容                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `npm run lint` / `npm run format:check` / `npm run typecheck` | 静的チェック                                                             |
| `npm test`                                                    | 単体テスト（Vitest）                                                     |
| `npm run db:reset`                                            | DB を空にして、マイグレーションと `supabase/seed.sql` を入れ直す         |
| `npm run test:e2e`                                            | 受け入れテスト（Playwright、`e2e/`）。先に `npm run db:reset` を実行する |
| `npm run build`                                               | ビルド                                                                   |

## 開発の決まり

- main には直接 push しません。PR を作り、CI（check と e2e）が通ってから squash でマージします（ブランチ保護で強制）。
- コミットメッセージは Conventional Commits（例：`feat: カードを追加できるようにする`）。
