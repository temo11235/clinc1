import { STATUS_META, type Status } from "@/lib/constants";

export const INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

export const BTN =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-l from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-teal-600/20 transition hover:from-teal-600 hover:to-teal-700";

export const BTN_SOFT =
  "inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 ${className}`}>{children}</div>;
}

const TONES = {
  sky: "from-sky-500 to-blue-600",
  emerald: "from-emerald-500 to-teal-600",
  violet: "from-violet-500 to-purple-600",
  amber: "from-amber-400 to-orange-500",
  rose: "from-rose-500 to-pink-600",
} as const;

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg ${TONES[tone]}`}>
      <p className="text-sm opacity-90">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-80">{hint}</p>}
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/10" />
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as Status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta?.cls ?? "bg-slate-100"}`}>
      {meta?.label ?? status}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const NOTICE_TONES = {
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
} as const;

export function Notice({
  tone = "rose",
  children,
}: {
  tone?: keyof typeof NOTICE_TONES;
  children: React.ReactNode;
}) {
  return <div className={`rounded-xl px-4 py-3 text-sm ring-1 ${NOTICE_TONES[tone]}`}>{children}</div>;
}
