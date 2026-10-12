import { db } from "@/lib/db";
import { money } from "@/lib/constants";
import { cairoDateKey, parseCairoLocal } from "@/lib/time";
import { Card, PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

const MONTHS = 6;

export default async function StatsPage() {
  const today = cairoDateKey(new Date());
  const [y, m] = today.split("-").map(Number);
  const key = (d: Date) => d.toISOString().slice(0, 10);

  const months = Array.from({ length: MONTHS }, (_, idx) => {
    const i = MONTHS - 1 - idx;
    const from = new Date(Date.UTC(y, m - 1 - i, 1));
    const to = new Date(Date.UTC(y, m - i, 1));
    return {
      label: from.toLocaleDateString("ar-EG", { month: "long", timeZone: "UTC" }),
      start: parseCairoLocal(`${key(from)}T00:00`).getTime(),
      end: parseCairoLocal(`${key(to)}T00:00`).getTime(),
    };
  });

  const from = new Date(months[0].start);
  const [appts, invoices, patients] = await Promise.all([
    db.appointment.findMany({ where: { startsAt: { gte: from } }, select: { startsAt: true, status: true, service: true } }),
    db.invoice.findMany({ where: { createdAt: { gte: from } }, select: { createdAt: true, paid: true } }),
    db.patient.findMany({ where: { createdAt: { gte: from } }, select: { createdAt: true } }),
  ]);

  const inMonth = (t: Date, mo: { start: number; end: number }) =>
    t.getTime() >= mo.start && t.getTime() < mo.end;

  const rows = months.map((mo) => {
    const a = appts.filter((x) => inMonth(x.startsAt, mo));
    return {
      label: mo.label,
      visits: a.length,
      completed: a.filter((x) => x.status === "COMPLETED").length,
      revenue: invoices.filter((x) => inMonth(x.createdAt, mo)).reduce((s, x) => s + x.paid, 0),
      newPatients: patients.filter((x) => inMonth(x.createdAt, mo)).length,
    };
  });

  const completed = appts.filter((a) => a.status === "COMPLETED").length;
  const noShow = appts.filter((a) => a.status === "NO_SHOW").length;
  const cancelled = appts.filter((a) => a.status === "CANCELLED").length;
  const scheduled = appts.filter((a) => a.status === "SCHEDULED").length;
  const attendance = completed + noShow ? Math.round((completed / (completed + noShow)) * 100) : 0;
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);

  const svc = new Map<string, number>();
  appts.forEach((a) => svc.set(a.service, (svc.get(a.service) ?? 0) + 1));
  const topServices = [...svc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSvc = Math.max(1, ...topServices.map((s) => s[1]));

  const maxRevenue = Math.max(1, ...rows.map((r) => r.revenue));
  const maxVisits = Math.max(1, ...rows.map((r) => r.visits));

  return (
    <div className="space-y-6">
      <PageHeader title="الإحصاءات" subtitle="آخر 6 شهور" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إيرادات الفترة" value={money(totalRevenue)} tone="emerald" />
        <StatCard label="نسبة الحضور" value={`${attendance}%`} hint="من المواعيد المنتهية" tone="sky" />
        <StatCard label="مرضى جدد" value={rows.reduce((s, r) => s + r.newPatients, 0)} tone="violet" />
        <StatCard label="ملغي / لم يحضر" value={`${cancelled} / ${noShow}`} hint={`${scheduled} مواعيد جاية`} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 font-bold">الإيرادات الشهرية</h2>
          <div className="flex h-56 items-end gap-3">
            {rows.map((r) => (
              <div key={r.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-slate-500">{r.revenue ? money(r.revenue) : "—"}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-teal-500 to-emerald-300"
                  style={{ height: `${Math.max(4, (r.revenue / maxRevenue) * 100)}%` }}
                />
                <span className="text-xs text-slate-600">{r.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-6 font-bold">عدد الزيارات الشهرية</h2>
          <div className="flex h-56 items-end gap-3">
            {rows.map((r) => (
              <div key={r.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-slate-500">{r.visits}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-sky-500 to-violet-400"
                  style={{ height: `${Math.max(4, (r.visits / maxVisits) * 100)}%` }}
                />
                <span className="text-xs text-slate-600">{r.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">أكتر الخدمات طلباً</h2>
          <div className="space-y-4">
            {topServices.map(([name, n], idx) => {
              const colors = ["bg-teal-500", "bg-sky-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-emerald-500"];
              return (
                <div key={name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-slate-500">{n}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${colors[idx % colors.length]}`} style={{ width: `${(n / maxSvc) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {topServices.length === 0 && <p className="text-sm text-slate-500">مفيش بيانات بعد</p>}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">حالات المواعيد</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "تم", value: completed, cls: "from-emerald-500 to-teal-600" },
              { label: "مجدول", value: scheduled, cls: "from-sky-500 to-blue-600" },
              { label: "لم يحضر", value: noShow, cls: "from-amber-400 to-orange-500" },
              { label: "ملغي", value: cancelled, cls: "from-rose-500 to-pink-600" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl bg-gradient-to-br p-4 text-white ${s.cls}`}>
                <p className="text-sm opacity-90">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
