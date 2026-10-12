import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/constants";
import { addDays, cairoDateKey, dayRange, fmtDate, fmtTime } from "@/lib/time";
import { BTN, BTN_SOFT, Card, PageHeader, StatCard, StatusBadge } from "@/components/ui";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { clearData, loadDemo } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = cairoDateKey(new Date());
  const { start, end } = dayRange(today);
  const monthStart = dayRange(`${today.slice(0, 8)}01`).start;

  const [todays, monthRevenue, totals, newPatients, totalPatients, monthAppts] = await Promise.all([
    db.appointment.findMany({
      where: { startsAt: { gte: start, lt: end } },
      include: { patient: true },
      orderBy: { startsAt: "asc" },
    }),
    db.invoice.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { paid: true } }),
    db.invoice.aggregate({ _sum: { amount: true, paid: true } }),
    db.patient.count({ where: { createdAt: { gte: monthStart } } }),
    db.patient.count(),
    db.appointment.findMany({ where: { startsAt: { gte: monthStart } }, select: { status: true } }),
  ]);

  const waiting = todays.filter((a) => a.status === "SCHEDULED").length;
  const completedMonth = monthAppts.filter((a) => a.status === "COMPLETED").length;
  const noShowMonth = monthAppts.filter((a) => a.status === "NO_SHOW").length;
  const attendance = completedMonth + noShowMonth
    ? Math.round((completedMonth / (completedMonth + noShowMonth)) * 100)
    : 0;
  const outstanding = (totals._sum.amount ?? 0) - (totals._sum.paid ?? 0);

  return (
    <div className="space-y-8">
      <PageHeader title="أهلاً بيك 👋" subtitle={fmtDate(new Date())}>
        <Link href="/appointments" className={BTN}>+ حجز موعد</Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="مواعيد النهارده" value={todays.length} hint={`${waiting} لسه مستنية`} tone="sky" />
        <StatCard label="إيرادات الشهر" value={money(monthRevenue._sum.paid ?? 0)} hint="المبالغ المحصّلة" tone="emerald" />
        <StatCard label="مرضى جدد الشهر" value={newPatients} hint={`إجمالي ${totalPatients} مريض`} tone="violet" />
        <StatCard label="نسبة الحضور" value={`${attendance}%`} hint="هذا الشهر" tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">مواعيد النهارده</h2>
            <Link href={`/appointments?date=${today}`} className="text-sm text-teal-700 hover:underline">
              عرض الكل
            </Link>
          </div>
          {todays.length === 0 ? (
            <p className="py-10 text-center text-slate-500">مفيش مواعيد النهارده</p>
          ) : (
            <div className="space-y-3">
              {todays.map((a) => (
                <div key={a.id} className="flex items-center gap-4 rounded-xl bg-slate-50 p-3">
                  <div className="w-16 rounded-lg bg-teal-100 py-1.5 text-center text-sm font-bold text-teal-800">
                    {fmtTime(a.startsAt)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{a.patient.fullName}</p>
                    <p className="text-xs text-slate-500">{a.service} · {a.doctorName}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-bold">المتبقي على المرضى</h2>
            <p className="text-3xl font-bold text-rose-600">{money(outstanding)}</p>
            <Link href="/billing" className={`${BTN_SOFT} mt-4 w-full`}>صفحة الحسابات</Link>
          </Card>

          <Card>
            <h2 className="mb-3 font-bold">بيانات تجريبية</h2>
            <p className="mb-4 text-sm text-slate-500">
              حمّل بيانات وهمية عشان تشوف الموقع شغال. لما الدكتور يديك البيانات الحقيقية امسح التجريبية وابدأ.
            </p>
            <div className="space-y-2">
              <form action={loadDemo}>
                <button className={`${BTN} w-full`}>تحميل بيانات تجريبية</button>
              </form>
              <form action={clearData}>
                <ConfirmSubmit
                  label="مسح كل البيانات"
                  message="هيتم مسح كل المرضى والمواعيد والفواتير. متأكد؟"
                  className="w-full rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                />
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
