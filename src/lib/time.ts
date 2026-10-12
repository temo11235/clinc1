export const TZ = "Africa/Cairo";

type Parts = { y: number; m: number; d: number; h: number; mi: number; s: number };

function cairoParts(date: Date): Parts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const get = (type: string) =>
    Number(fmt.formatToParts(date).find((p) => p.type === type)?.value ?? 0);
  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
    h: get("hour"),
    mi: get("minute"),
    s: get("second"),
  };
}

function offsetMs(date: Date) {
  const c = cairoParts(date);
  const asUtc = Date.UTC(c.y, c.m - 1, c.d, c.h, c.mi, c.s);
  return Math.round((asUtc - date.getTime()) / 60000) * 60000;
}

// يحوّل "2026-10-12T15:30" (توقيت القاهرة) لتاريخ حقيقي
export function parseCairoLocal(value: string): Date {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const off1 = offsetMs(new Date(guess));
  let result = guess - off1;
  const off2 = offsetMs(new Date(result));
  if (off2 !== off1) result = guess - off2;
  return new Date(result);
}

export function cairoDateKey(date: Date) {
  const c = cairoParts(date);
  return `${c.y}-${String(c.m).padStart(2, "0")}-${String(c.d).padStart(2, "0")}`;
}

export function addDays(key: string, n: number) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function dayRange(key: string) {
  return {
    start: parseCairoLocal(`${key}T00:00`),
    end: parseCairoLocal(`${addDays(key, 1)}T00:00`),
  };
}

export const isValidDateKey = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
export const isValidLocalDateTime = (s: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("ar-EG", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const fmtTime = (d: Date) =>
  d.toLocaleTimeString("ar-EG", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

export const fmtShortDate = (d: Date) =>
  d.toLocaleDateString("ar-EG", { timeZone: TZ, day: "numeric", month: "short" });
