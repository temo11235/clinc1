import Link from "next/link";
import { db } from "@/lib/db";
import { DOCTORS, SERVICES, STATUSES, STATUS_META } from "@/lib/constants";
import { addDays, cairoDateKey, dayRange, fmtDate, fmtTime, isValidDateKey } from "@/lib/time";
import { BTN, BTN_SOFT, Card, INPUT, Notice, PageHeader, StatusBadge } from "@/components/ui";
import { createAppointment, updateStatus } from "./actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  invalid: "من فضلك اكمل كل البيانات بشكل صحيح",
  overlap: "الدكتور عنده موعد في نفس الوقت ده، اختار وقت تاني",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; error?: string; patientId?: string }>;
}) {
  const sp = await searchParams;
  const today = cairoDateKey(new Date());
  const dateKey = sp.date && isValidDateKey(sp.date) ? sp.date : today;
  const { start, end } = dayRange(dateKey);

  const [patients, appts] = await Promise.all([
    db.patient.findMany({ orderBy: { fullName: "asc" }, select: { id: true, fullName: true } }),
    db.appointment.findMany({
      where: { startsAt: { gte: start, lt: end } },
      include: { patient: true },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  const counts = {
    total: appts.length,
    done: appts.filter((a) => a.status === "COMPLETED").length,
    waiting: appts.filter((a) => a.status === "SCHEDULED").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="المواعيد" subtitle={fmtDate(start)}>
        <div className="flex flex-wrap gap-2">
          <Link href={`/appointments?date=${addDays(dateKey, -1)}`} className={BTN_SOFT}>اليوم اللي قبله</Link>
          <Link href={`/appointments?date=${today}`} className={BTN_SOFT}>النهارده</Link>
          <Link href={`/appointments?date=${addDays(dateKey, 1)}`} className={BTN_SOFT}>اليوم اللي بعده</Link>
        </div>
      </PageHeader>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-700">إجمالي: {counts.total}</span>
        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700">تم: {counts.done}</span>
        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-700">مستنية: {counts.waiting}</span>
      </div>

      {sp.error && errors[sp.error] && <Notice>{errors[sp.error]}</Notice>}

      <Card>
        <h2 className="mb-4 font-bold">حجز موعد جديد</h2>
        <form action={createAppointment} className="grid gap-4 md:grid-cols-2">
          <select name="patientId" required defaultValue={sp.patientId ?? ""} className={INPUT}>
            <option value="">اختار المريض</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
            ))}
          </select>
          <select name="doctorName" required className={INPUT}>
            {DOCTORS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select name="service" required className={INPUT}>
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select name="durationMin" defaultValue="30" className={INPUT}>
            {[30, 45, 60, 90].map((d) => (
              <option key={d} value={d}>{d} دقيقة</option>
            ))}
          </select>
          <input name="startsAt" type="datetime-local" required defaultValue={`${dateKey}T10:00`} className={`${INPUT} md:col-span-2`} />
          <div className="md:col-span-2">
            <button className={BTN}>حجز الموعد</button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">مواعيد اليوم</h2>
        {appts.length === 0 ? (
          <p className="py-8 text-center text-slate-500">مفيش مواعيد في اليوم ده</p>
        ) : (
          <div className="space-y-3">
            {appts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 bg-white p-4">
                <div className="w-20 rounded-lg bg-teal-50 py-2 text-center text-sm font-bold text-teal-700">
                  {fmtTime(a.startsAt)}
                </div>
                <div className="min-w-40 flex-1">
                  <Link href={`/patients/${a.patientId}`} className="font-semibold hover:text-teal-700">
                    {a.patient.fullName}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {a.service} · {a.doctorName} · {a.durationMin} دقيقة
                  </p>
                </div>
                <StatusBadge status={a.status} />
                <form action={updateStatus} className="flex flex-wrap gap-1.5">
                  <input type="hidden" name="id" value={a.id} />
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      name="status"
                      value={s}
                      disabled={a.status === s}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-40 ${STATUS_META[s].cls}`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </form>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
