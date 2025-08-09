import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b">
          <div className="container py-3 flex items-center gap-4">
            <Link href="/" className="font-semibold">Voice Judge</Link>
            <nav className="ml-auto flex gap-3">
              <Link href="/record" className="btn btn-ghost">녹음 업로드</Link>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
