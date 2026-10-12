import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { money } from "@/lib/constants";
import { fmtShortDate, fmtTime } from "@/lib/time";
import { BTN, Card, Notice, PageHeader, StatCard, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: { startsAt: "desc" }, take: 30 },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!patient) notFound();

  const billed = patient.invoices.reduce((s, i) => s + i.amount, 0);
  const paid = patient.invoices.reduce((s, i) => s + i.paid, 0);
  const visits = patient.appointments.filter((a) => a.status === "COMPLETED").length;
  const age = patient.birthDate
    ? Math.floor((Date.now() - patient.birthDate.getTime()) / 31557600000)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.fullName}
        subtitle={`${patient.phone}${age !== null ? ` · ${age} سنة` : ""}`}
      >
        <Link href={`/appointments?patientId=${patient.id}`} className={BTN}>+ حجز موعد</Link>
      </PageHeader>

      {patient.allergies && <Notice tone="amber">⚠️ حساسية: {patient.allergies}</Notice>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="زيارات مكتملة" value={visits} tone="sky" />
        <StatCard label="إجمالي الفواتير" value={money(billed)} tone="violet" />
        <StatCard label="المتبقي عليه" value={money(billed - paid)} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold">المواعيد</h2>
          {patient.appointments.length === 0 ? (
            <p className="text-sm text-slate-500">مفيش مواعيد مسجلة</p>
          ) : (
            <div className="space-y-2">
              {patient.appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                  <div>
                    <p className="font-medium">{a.service}</p>
                    <p className="text-xs text-slate-500">
                      {fmtShortDate(a.startsAt)} · {fmtTime(a.startsAt)} · {a.doctorName}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">الفواتير</h2>
          {patient.invoices.length === 0 ? (
            <p className="text-sm text-slate-500">مفيش فواتير</p>
          ) : (
            <div className="space-y-2">
              {patient.invoices.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                  <div>
                    <p className="font-medium">{i.title}</p>
                    <p className="text-xs text-slate-500">{fmtShortDate(i.createdAt)}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{money(i.amount)}</p>
                    <p className={`text-xs ${i.paid >= i.amount ? "text-emerald-600" : "text-rose-600"}`}>
                      {i.paid >= i.amount ? "مدفوعة" : `متبقي ${money(i.amount - i.paid)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {patient.notes && (
        <Card>
          <h2 className="mb-2 font-bold">ملاحظات</h2>
          <p className="text-sm text-slate-600">{patient.notes}</p>
        </Card>
      )}
    </div>
  );
}
