"use server";

import type { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { STATUSES } from "@/lib/constants";
import { cairoDateKey, isValidLocalDateTime, parseCairoLocal } from "@/lib/time";

const MAX_MIN = 240;

export async function createAppointment(formData: FormData) {
  const patientId = String(formData.get("patientId") ?? "");
  const doctorName = String(formData.get("doctorName") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const raw = String(formData.get("startsAt") ?? "");
  const durationMin = Math.min(Math.max(Number(formData.get("durationMin")) || 30, 5), MAX_MIN);

  if (!patientId || !doctorName || !service || !isValidLocalDateTime(raw)) {
    redirect("/appointments?error=invalid");
  }

  const startsAt = parseCairoLocal(raw);
  const endsAt = new Date(startsAt.getTime() + durationMin * 60000);

  const nearby = await db.appointment.findMany({
    where: {
      doctorName,
      status: { not: "CANCELLED" },
      startsAt: { gte: new Date(startsAt.getTime() - MAX_MIN * 60000), lt: endsAt },
    },
    select: { startsAt: true, durationMin: true },
  });

  const overlap = nearby.some(
    (a) =>
      a.startsAt < endsAt &&
      new Date(a.startsAt.getTime() + a.durationMin * 60000) > startsAt,
  );
  if (overlap) redirect(`/appointments?date=${cairoDateKey(startsAt)}&error=overlap`);

  try {
    await db.appointment.create({
      data: { patientId, doctorName, service, startsAt, durationMin },
    });
  } catch {
    redirect("/appointments?error=invalid");
  }

  revalidatePath("/appointments");
  revalidatePath("/");
  redirect(`/appointments?date=${cairoDateKey(startsAt)}`);
}

export async function updateStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(STATUSES as readonly string[]).includes(status)) return;

  await db.appointment.update({
    where: { id },
    data: { status: status as AppointmentStatus },
  });

  revalidatePath("/appointments");
  revalidatePath("/");
  revalidatePath("/stats");
}
