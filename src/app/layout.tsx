import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "إدارة عيادة الأسنان",
  description: "نظام إدارة العيادة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <nav className="flex gap-6 border-b bg-white px-6 py-4 font-medium">
          <a href="/">الرئيسية</a>
          <a href="/patients">المرضى</a>
          <a href="/appointments">المواعيد</a>
          <a href="/stats">الإحصاءات</a>
        </nav>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
