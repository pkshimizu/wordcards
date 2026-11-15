// ローカルの Supabase（npm run db:start）の接続先を .env.local に書き出す
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const out = execFileSync("npx", ["supabase", "status", "-o", "json"], {
  encoding: "utf8",
  shell: process.platform === "win32",
  stdio: ["ignore", "pipe", "ignore"],
});
const status = JSON.parse(out.slice(out.indexOf("{")));
const url = status.API_URL;
const key = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
if (!url || !key) {
  console.error(
    "Supabase の接続先が取れませんでした。npm run db:start を先に実行してください",
  );
  process.exit(1);
}
writeFileSync(
  ".env.local",
  `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\n`,
);
console.log(".env.local を書き出しました");
