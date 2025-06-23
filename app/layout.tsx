import "./globals.css";

export const metadata = {
  title: "デジハク講師面談管理ダッシュボード",
  description: "デジハクの講師面談データを管理・可視化するダッシュボード",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  )
}
