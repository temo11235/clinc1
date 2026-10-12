import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/constants";
import { fmtShortDate } from "@/lib/time";
import { BTN, Card, INPUT, PageHeader, BTN_SOFT } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  const patients = await db.patient.findMany({
    where: term
      ? {
          OR: [
            { fullName: { contains: term, mode: "insensitive" } },
            { phone: { contains: term } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { appointments: true } },
      invoices: { select: { amount: true, paid: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="المرضى" subtitle={`${patients.length} مريض${term ? " في نتيجة البحث" : ""}`}>
        <Link href="/patients/new" className={BTN}>+ مريض جديد</Link>
      </PageHeader>

      <form className="flex gap-2">
        <input name="q" defaultValue={term} placeholder="ابحث بالاسم أو التليفون" className={INPUT} />
        <button className={BTN_SOFT}>بحث</button>
      </form>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 font-medium">الاسم</th>
              <th className="p-4 font-medium">التليفون</th>
              <th className="p-4 font-medium">الزيارات</th>
              <th className="p-4 font-medium">المتبقي</th>
              <th className="p-4 font-medium">الحساسية</th>
              <th className="p-4 font-medium">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const balance = p.invoices.reduce((s, i) => s + (i.amount - i.paid), 0);
              return (
                <tr key={p.id} className="border-t border-slate-100 transition hover:bg-teal-50/50">
                  <td className="p-4">
                    <Link href={`/patients/${p.id}`} className="font-semibold text-slate-900 hover:text-teal-700">
                      {p.fullName}
                    </Link>
                  </td>
                  <td className="p-4" dir="ltr">{p.phone}</td>
                  <td className="p-4">{p._count.appointments}</td>
                  <td className={`p-4 font-medium ${balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {money(balance)}
                  </td>
                  <td className="p-4">
                    {p.allergies ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800">{p.allergies}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{fmtShortDate(p.createdAt)}</td>
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-500">مفيش مرضى مطابقين</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
