import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "単語カード",
  description: "conductor の動作確認用の単語カードアプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
