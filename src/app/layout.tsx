import type { Metadata } from "next";
import Link from "next/link";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "عيادة الأسنان",
  description: "نظام إدارة العيادة",
};

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/patients", label: "المرضى" },
  { href: "/appointments", label: "المواعيد" },
  { href: "/billing", label: "الحسابات" },
  { href: "/stats", label: "الإحصاءات" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${tajawal.className} min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-sky-50 text-slate-800 antialiased`}
      >
        <header className="sticky top-0 z-10 border-b border-white/60 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-500 text-xl shadow-md">
                🦷
              </span>
              <span className="text-lg font-bold">عيادة الأسنان</span>
            </Link>
            <nav className="flex flex-wrap gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
