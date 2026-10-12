"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function normalizePhone(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("20")) digits = digits.slice(2);
  if (digits.length === 10 && !digits.startsWith("0")) digits = "0" + digits;
  return digits;
}

export async function createPatient(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const birth = String(formData.get("birthDate") ?? "");
  const allergies = String(formData.get("allergies") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!fullName || !/^01\d{9}$/.test(phone)) {
    redirect("/patients/new?error=invalid");
  }

  try {
    await db.patient.create({
      data: {
        fullName,
        phone,
        birthDate: birth ? new Date(birth) : null,
        allergies,
        notes,
      },
    });
  } catch {
    redirect("/patients/new?error=duplicate");
  }

  revalidatePath("/patients");
  redirect("/patients");
}
