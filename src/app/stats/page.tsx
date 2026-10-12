import { db } from "@/lib/db";

export default async function StatsPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [totalPatients, newPatientsThisMonth, monthAppointments] = await Promise.all([
    db.patient.count(),
    db.patient.count({ where: { createdAt: { gte: monthStart } } }),
    db.appointment.findMany({ where: { startsAt: { gte: monthStart } } }),
  ]);

  const count = (s: string) => monthAppointments.filter((a) => a.status === s).length;
  const completed = count("COMPLETED");
  const noShow = count("NO_SHOW");
  const cancelled = count("CANCELLED");
  const finished = completed + noShow;
  const attendance = finished ? Math.round((completed / finished) * 100) : 0;

  const cards = [
    { label: "إجمالي المرضى", value: totalPatients },
    { label: "مرضى جدد هذا الشهر", value: newPatientsThisMonth },
    { label: "مواعيد هذا الشهر", value: monthAppointments.length },
    { label: "تم الحضور", value: completed },
    { label: "لم يحضروا", value: noShow },
    { label: "ملغي", value: cancelled },
    { label: "نسبة الحضور", value: `${attendance}%` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإحصاءات</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
