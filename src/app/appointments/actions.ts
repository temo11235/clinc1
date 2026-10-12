"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppointmentStatus } from "@prisma/client";

const MAX_APPOINTMENT_MIN = 240; // بنفترض إن أي موعد أقصى مدة 4 ساعات

export async function createAppointment(formData: FormData) {
  const patientId = String(formData.get("patientId") ?? "");
  const doctorName = String(formData.get("doctorName") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const durationMin = Number(formData.get("durationMin") || 30);

  if (!patientId || !doctorName || !service || isNaN(startsAt.getTime())) {
    redirect("/appointments?error=invalid");
  }

  const endsAt = new Date(startsAt.getTime() + durationMin * 60000);
  const windowStart = new Date(startsAt.getTime() - MAX_APPOINTMENT_MIN * 60000);

  const nearby = await db.appointment.findMany({
    where: {
      doctorName,
      status: { not: AppointmentStatus.CANCELLED },
      startsAt: { gte: windowStart, lt: endsAt },
    },
  });

  const overlap = nearby.some((a) => {
    const aEnd = new Date(a.startsAt.getTime() + a.durationMin * 60000);
    return a.startsAt < endsAt && aEnd > startsAt;
  });

  if (overlap) redirect("/appointments?error=overlap");

  await db.appointment.create({
    data: { patientId, doctorName, service, startsAt, durationMin },
  });

  revalidatePath("/appointments");
  redirect("/appointments");
}

export async function updateStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as AppointmentStatus;

  await db.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/appointments");
  revalidatePath("/stats");
}
