import { db } from "./db";
import { DOCTORS, SERVICES, SERVICE_PRICES } from "./constants";
import { addDays, cairoDateKey, parseCairoLocal } from "./time";

const NAMES = [
  "أحمد محمود", "سارة إبراهيم", "محمد عادل", "منى السيد", "يوسف حسن", "نور عبد الله",
  "هدى علي", "كريم سامي", "ريم طارق", "عمر خالد", "مريم فتحي", "إسلام رضا",
];

const PREFIXES = ["010", "011", "012", "015"];

// بيانات تجريبية: بتتضاف بس لو قاعدة البيانات فاضية
export async function seedDemoData() {
  if ((await db.patient.count()) > 0) return;

  const patients: { id: string }[] = [];
  for (let i = 0; i < NAMES.length; i++) {
    const patient = await db.patient.create({
      data: {
        fullName: NAMES[i],
        phone: PREFIXES[i % 4] + String(10000000 + i * 7919).slice(0, 8),
        birthDate: new Date(Date.UTC(1975 + ((i * 3) % 30), i % 12, 1 + i)),
        allergies: i % 4 === 0 ? "بنسيلين" : null,
        notes: i % 3 === 0 ? "مواظب على المواعيد" : null,
      },
    });
    patients.push(patient);
  }

  const todayKey = cairoDateKey(new Date());

  for (let off = -6; off <= 3; off++) {
    const dayKey = addDays(todayKey, off);
    let cursor = 10 * 60;
    const count = 3 + ((off + 10) % 3);

    for (let k = 0; k < count; k++) {
      const patient = patients[((off + 6) * 7 + k * 5) % patients.length];
      const service = SERVICES[(k * 3 + off + 6) % SERVICES.length];
      const duration = [30, 45, 60][(k + off + 6) % 3];
      const hh = String(Math.floor(cursor / 60)).padStart(2, "0");
      const mm = String(cursor % 60).padStart(2, "0");
      const startsAt = parseCairoLocal(`${dayKey}T${hh}:${mm}`);
      cursor += duration + 15;

      const status =
        off < 0
          ? k === 3
            ? "NO_SHOW"
            : k === 4
              ? "CANCELLED"
              : "COMPLETED"
          : off === 0 && k < 2
            ? "COMPLETED"
            : "SCHEDULED";

      await db.appointment.create({
        data: {
          patientId: patient.id,
          doctorName: DOCTORS[k % DOCTORS.length],
          service,
          startsAt,
          durationMin: duration,
          status,
        },
      });

      if (status === "COMPLETED") {
        const price = SERVICE_PRICES[service];
        await db.invoice.create({
          data: {
            patientId: patient.id,
            title: service,
            amount: price,
            paid: k % 3 === 1 ? Math.round(price / 2) : price,
            createdAt: startsAt,
          },
        });
      }
    }
  }

  // فواتير قديمة عشان الإحصاءات تبان على 6 شهور
  for (let m = 1; m <= 5; m++) {
    const service = SERVICES[m % SERVICES.length];
    await db.invoice.create({
      data: {
        patientId: patients[m % patients.length].id,
        title: service,
        amount: SERVICE_PRICES[service],
        paid: SERVICE_PRICES[service],
        createdAt: parseCairoLocal(`${addDays(todayKey, -30 * m)}T12:00`),
      },
    });
  }
}

// يمسح كل البيانات (استخدمه قبل إدخال البيانات الحقيقية)
export async function clearAllData() {
  await db.invoice.deleteMany();
  await db.appointment.deleteMany();
  await db.patient.deleteMany();
}
