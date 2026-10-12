import { db } from "@/lib/db";
import { createAppointment, updateStatus } from "./actions";

const errors: Record<string, string> = {
  invalid: "من فضلك اكمل كل البيانات بشكل صحيح",
  overlap: "الدكتور عنده موعد في نفس الوقت ده",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "مجدول",
  COMPLETED: "تم",
  NO_SHOW: "لم يحضر",
  CANCELLED: "ملغي",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [patients, appointments] = await Promise.all([
    db.patient.findMany({ orderBy: { fullName: "asc" } }),
    db.appointment.findMany({
      where: { startsAt: { gte: todayStart } },
      include: { patient: true },
      orderBy: { startsAt: "asc" },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">المواعيد</h1>

      {error && errors[error] && (
        <p className="rounded bg-red-100 p-3 text-red-700">{errors[error]}</p>
      )}

      <form action={createAppointment} className="grid gap-3 rounded bg-white p-6 md:grid-cols-2">
        <select name="patientId" required className="rounded border p-2">
          <option value="">اختار المريض</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.fullName}</option>
          ))}
        </select>
        <input name="doctorName" required placeholder="اسم الدكتور" className="rounded border p-2" />
        <input name="service" required placeholder="الخدمة (كشف، حشو، تنظيف...)" className="rounded border p-2" />
        <input name="durationMin" type="number" defaultValue={30} min={5} step={5} className="rounded border p-2" />
        <input name="startsAt" type="datetime-local" required className="rounded border p-2 md:col-span-2" />
        <button className="rounded bg-blue-600 px-6 py-2 text-white md:col-span-2">حجز الموعد</button>
      </form>

      <table className="w-full bg-white text-right">
        <thead>
          <tr className="border-b">
            <th className="p-2">الوقت</th>
            <th className="p-2">المريض</th>
            <th className="p-2">الدكتور</th>
            <th className="p-2">الخدمة</th>
            <th className="p-2">الحالة</th>
            <th className="p-2">تغيير</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id} className="border-b">
              <td className="p-2" dir="ltr">
                {a.startsAt.toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
              </td>
              <td className="p-2">{a.patient.fullName}</td>
              <td className="p-2">{a.doctorName}</td>
              <td className="p-2">{a.service}</td>
              <td className="p-2">{statusLabels[a.status]}</td>
              <td className="p-2">
                <form action={updateStatus} className="flex gap-1">
                  <input type="hidden" name="id" value={a.id} />
                  <button name="status" value="COMPLETED" className="rounded bg-green-600 px-2 text-white">تم</button>
                  <button name="status" value="NO_SHOW" className="rounded bg-amber-500 px-2 text-white">لم يحضر</button>
                  <button name="status" value="CANCELLED" className="rounded bg-red-600 px-2 text-white">إلغاء</button>
                </form>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-slate-500">مفيش مواعيد جاية</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
