"use server";

import { revalidatePath } from "next/cache";
import { seedDemoData, clearAllData } from "@/lib/seed";

export async function loadDemo() {
  await seedDemoData();
  revalidatePath("/", "layout");
}

export async function clearData() {
  await clearAllData();
  revalidatePath("/", "layout");
}
