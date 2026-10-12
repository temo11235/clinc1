"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function createInvoice(formData: FormData) {
  const patientId = String(formData.get("patientId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const amount = Math.round(Number(formData.get("amount")));
  const paid = Math.round(Number(formData.get("paid")) || 0);

  if (!patientId || !title || !(amount > 0) || paid < 0 || paid > amount) {
    redirect("/billing?error=invalid");
  }

  try {
    await db.invoice.create({ data: { patientId, title, amount, paid } });
  } catch {
    redirect("/billing?error=invalid");
  }

  revalidatePath("/billing");
  revalidatePath("/");
  revalidatePath("/stats");
  revalidatePath(`/patients/${patientId}`);
  redirect("/billing");
}

export async function addPayment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const amount = Math.round(Number(formData.get("amount")));
  const invoice = await db.invoice.findUnique({ where: { id } });

  if (!invoice || !(amount > 0)) redirect("/billing?error=payment");

  await db.invoice.update({
    where: { id },
    data: { paid: Math.min(invoice.amount, invoice.paid + amount) },
  });

  revalidatePath("/billing");
  revalidatePath("/");
  revalidatePath("/stats");
  revalidatePath(`/patients/${invoice.patientId}`);
}
