import type { DueStatusInfo } from "@/types";

export const MONTHS_ABBR = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
] as const;

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function todayISO(): string {
  const d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y ?? 1970, (m || 1) - 1, d || 1);
}

export function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = parseISODate(s);
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
}

export function fmtDayMonth(s: string): string {
  const d = parseISODate(s);
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1);
}

export function daysBetween(aISO: string, bISO: string): number {
  const a = parseISODate(aISO);
  const b = parseISODate(bISO);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function addDaysISO(dateISO: string, days: number): string {
  const d = parseISODate(dateISO);
  d.setDate(d.getDate() + days);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    pad(d.getDate()) +
    "/" +
    pad(d.getMonth() + 1) +
    " às " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

export function ageMonths(birthISO: string | null | undefined): number | null {
  if (!birthISO) return null;
  const b = parseISODate(birthISO);
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months--;
  return months < 0 ? null : months;
}

export function calcAge(birthISO: string | null | undefined): string {
  if (!birthISO) return "";
  const b = parseISODate(birthISO);
  const now = new Date();
  const months = ageMonths(birthISO);
  if (months === null) return "";
  if (months < 1) {
    const days = Math.max(0, Math.round((now.getTime() - b.getTime()) / 86400000));
    return days <= 1 ? "Recém-nascido" : days + " dias";
  }
  if (months < 24) {
    return months + (months === 1 ? " mês" : " meses");
  }
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return (
    years +
    (years === 1 ? " ano" : " anos") +
    (rem > 0 ? " e " + rem + (rem === 1 ? " mês" : " meses") : "")
  );
}

export function dueStatus(nextISO: string | null | undefined): DueStatusInfo {
  if (!nextISO) return { status: "none", days: null };
  const d = daysBetween(todayISO(), nextISO);
  if (d < 0) return { status: "overdue", days: -d };
  if (d <= 7) return { status: "soon", days: d };
  return { status: "ok", days: d };
}

export function plural(n: number, singular: string, pluralForm?: string): string {
  return n === 1 ? singular : (pluralForm ?? singular + "s");
}
