import { db } from "@/lib/db";
import { SERVICES, money } from "@/lib/constants";
import { fmtShortDate } from "@/lib/time";
import { BTN, BTN_SOFT, Card, INPUT, Notice, PageHeader, StatCard } from "@/components/ui";
import { addPayment, createInvoice } from "./actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  invalid: "من فضلك اختار المريض واكتب مبلغ صحيح (المدفوع ما يزيدش عن الإجمالي)",
  payment: "المبلغ لازم يكون أكبر من صفر",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [patients, invoices, totals] = await Promise.all([
    db.patient.findMany({ orderBy: { fullName: "asc" }, select: { id: true, fullName: true } }),
    db.invoice.findMany({
      include: { patient: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.invoice.aggregate({ _sum: { amount: true, paid: true } }),
  ]);

  const billed = totals._sum.amount ?? 0;
  const collected = totals._sum.paid ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="الحسابات" subtitle="الفواتير والمدفوعات" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي الفواتير" value={money(billed)} tone="sky" />
        <StatCard label="المحصّل" value={money(collected)} tone="emerald" />
        <StatCard label="المتبقي" value={money(billed - collected)} tone="rose" />
      </div>

      {error && errors[error] && <Notice>{errors[error]}</Notice>}

      <Card>
        <h2 className="mb-4 font-bold">فاتورة جديدة</h2>
        <form action={createInvoice} className="grid gap-4 md:grid-cols-4">
          <select name="patientId" required className={INPUT}>
            <option value="">اختار المريض</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
            ))}
          </select>
          <select name="title" required className={INPUT}>
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input name="amount" type="number" min={1} required placeholder="المبلغ" className={INPUT} />
          <input name="paid" type="number" min={0} defaultValue={0} placeholder="المدفوع" className={INPUT} />
          <div className="md:col-span-4">
            <button className={BTN}>حفظ الفاتورة</button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 font-medium">المريض</th>
              <th className="p-4 font-medium">البند</th>
              <th className="p-4 font-medium">الإجمالي</th>
              <th className="p-4 font-medium">المدفوع</th>
              <th className="p-4 font-medium">التقدم</th>
              <th className="p-4 font-medium">تسجيل دفعة</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const remaining = inv.amount - inv.paid;
              const pct = Math.round((inv.paid / inv.amount) * 100);
              return (
                <tr key={inv.id} className="border-t border-slate-100">
                  <td className="p-4">
                    <p className="font-semibold">{inv.patient.fullName}</p>
                    <p className="text-xs text-slate-500">{fmtShortDate(inv.createdAt)}</p>
                  </td>
                  <td className="p-4">{inv.title}</td>
                  <td className="p-4">{money(inv.amount)}</td>
                  <td className="p-4 text-emerald-700">{money(inv.paid)}</td>
                  <td className="p-4">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
                    </div>
                    {remaining > 0 && <p className="mt-1 text-xs text-rose-600">متبقي {money(remaining)}</p>}
                  </td>
                  <td className="p-4">
                    {remaining > 0 ? (
                      <form action={addPayment} className="flex gap-2">
                        <input type="hidden" name="id" value={inv.id} />
                        <input name="amount" type="number" min={1} max={remaining} required placeholder="المبلغ" className={`${INPUT} w-24 py-1.5`} />
                        <button className={BTN_SOFT}>سداد</button>
                      </form>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">مدفوعة بالكامل</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-500">مفيش فواتير لسه</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
