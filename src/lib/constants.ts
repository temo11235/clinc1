export const SERVICE_PRICES: Record<string, number> = {
  "كشف": 200,
  "تنظيف جير": 350,
  "حشو": 600,
  "حشو عصب": 1200,
  "خلع": 500,
  "علاج عصب": 2500,
  "تبييض": 2000,
  "تركيبات": 4000,
  "تقويم": 15000,
};

export const SERVICES = Object.keys(SERVICE_PRICES);

export const DOCTORS = ["د. أحمد علي", "د. منى سعيد"];

export const STATUSES = ["SCHEDULED", "COMPLETED", "NO_SHOW", "CANCELLED"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_META: Record<Status, { label: string; cls: string }> = {
  SCHEDULED: { label: "مجدول", cls: "bg-sky-100 text-sky-700" },
  COMPLETED: { label: "تم", cls: "bg-emerald-100 text-emerald-700" },
  NO_SHOW: { label: "لم يحضر", cls: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "ملغي", cls: "bg-rose-100 text-rose-700" },
};

export const money = (n: number) => `${n.toLocaleString("ar-EG")} ج.م`;
