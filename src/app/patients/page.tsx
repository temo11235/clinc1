import Link from "next/link";
import { db } from "@/lib/db";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim();

  const patients = await db.patient.findMany({
    where: term
      ? {
          OR: [
            { fullName: { contains: term, mode: "insensitive" } },
            { phone: { contains: term } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المرضى</h1>
        <Link href="/patients/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          مريض جديد
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={term ?? ""}
          placeholder="ابحث بالاسم أو التليفون"
          className="w-full rounded border p-2"
        />
        <button className="rounded bg-slate-800 px-4 text-white">بحث</button>
      </form>

      <table className="w-full bg-white text-right">
        <thead>
          <tr className="border-b">
            <th className="p-2">الاسم</th>
            <th className="p-2">التليفون</th>
            <th className="p-2">الحساسية</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.fullName}</td>
              <td className="p-2" dir="ltr">{p.phone}</td>
              <td className="p-2">{p.allergies ?? "—"}</td>
            </tr>
          ))}
          {patients.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-slate-500">
                مفيش مرضى مطابقين
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
