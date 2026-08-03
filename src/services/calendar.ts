/* ── Integração com o calendário "Pets" ─────────────────────────────────────
   Gera um arquivo .ics compatível com iOS (abre direto no app Calendário). */
import { pad } from "@/lib/dates";
import { uid } from "@/lib/utils";
import { doseStatus, MED_FORM_UNITS } from "@/domain/medications";
import { toast } from "@/store/ui";
import type { MedicationRecord, Pet } from "@/types";

// Nome exato do calendário no iPhone (sem emoji se não tiver)
export const PETS_CALENDAR_NAME = "Pets";

export const ALERT_OPTIONS = [
  { label: "No momento", minutes: 0 },
  { label: "1 hora antes", minutes: 60 },
  { label: "1 dia antes", minutes: 1440 },
  { label: "2 dias antes", minutes: 2880 },
] as const;

export function agendarNoCalendario(
  petName: string,
  title: string,
  dateISO: string,
  notes: string,
  alertMinutes = 1440
) {
  const startStr = dateISO.replace(/-/g, "") + "T090000";
  const endStr = dateISO.replace(/-/g, "") + "T093000";

  // Tenta via postMessage para o Claude (quando rodando dentro do Claude.ai)
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: "CLAUDE_CALENDAR_CREATE",
        payload: {
          calendarName: PETS_CALENDAR_NAME,
          title: title + " — " + petName,
          startTime: dateISO + "T09:00:00",
          endTime: dateISO + "T09:30:00",
          eventDescription: notes || title + " para " + petName,
          nudges: alertMinutes > 0 ? [{ minutesBefore: alertMinutes }] : [],
        },
      },
      "*"
    );
  }

  // Fallback: o iOS abre diretamente ao clicar num link .ics
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PataCare//PT",
    "BEGIN:VEVENT",
    "DTSTART:" + startStr,
    "DTEND:" + endStr,
    "SUMMARY:" + (title + " — " + petName).replace(/,/g, "\\,"),
    "DESCRIPTION:" + (notes || title + " para " + petName).replace(/,/g, "\\,"),
    alertMinutes > 0
      ? "BEGIN:VALARM\nTRIGGER:-PT" +
        alertMinutes +
        "M\nACTION:DISPLAY\nDESCRIPTION:Lembrete\nEND:VALARM"
      : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  downloadIcs(icsContent, title + "-" + petName);
  toast("Arquivo .ics gerado — abra para adicionar ao calendário Pets!");
}

function downloadIcs(icsContent: string, fileName: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.replace(/[^a-zA-Z0-9]/g, "_") + ".ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Data/hora local no formato do .ics (sem fuso — o iOS assume o do aparelho). */
function icsLocalStamp(d: Date): string {
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    "00"
  );
}

/* ── Doses de medicamento no calendário ─────────────────────────────────────
   Cada dose vira um evento com alarme. O alarme é agendado pelo próprio iPhone,
   então ele toca mesmo com o PataCare fechado — sem depender de servidor. */

const DOSE_ALERT_SETTINGS_KEY = "patacare-reminders-settings";

export const DOSE_ALERT_OPTIONS = [
  { label: "Na hora da dose", minutes: 0 },
  { label: "5 minutos antes", minutes: 5 },
  { label: "15 minutos antes", minutes: 15 },
  { label: "30 minutos antes", minutes: 30 },
  { label: "1 hora antes", minutes: 60 },
] as const;

export interface DoseAlertSettings {
  /** antecedência do alarme de cada dose, em minutos */
  leadMinutes: number;
}

export const DEFAULT_DOSE_ALERT_SETTINGS: DoseAlertSettings = { leadMinutes: 0 };

export function getDoseAlertSettings(): DoseAlertSettings {
  try {
    const saved = JSON.parse(
      localStorage.getItem(DOSE_ALERT_SETTINGS_KEY) || "null"
    ) as Partial<DoseAlertSettings> | null;
    return { ...DEFAULT_DOSE_ALERT_SETTINGS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_DOSE_ALERT_SETTINGS };
  }
}

export function saveDoseAlertSettings(settings: DoseAlertSettings) {
  localStorage.setItem(DOSE_ALERT_SETTINGS_KEY, JSON.stringify(settings));
}

export interface DoseReminder {
  title: string;
  notes: string;
  scheduledAt: Date;
  /** mesma data em texto legível, usada na prévia e na cópia manual */
  whenText: string;
}

function doseWhenText(d: Date): string {
  return (
    pad(d.getDate()) +
    "/" +
    pad(d.getMonth() + 1) +
    "/" +
    d.getFullYear() +
    " às " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

/** Um item por dose — vira evento no .ics e linha na lista copiada. */
export function buildDoseReminders(
  pet: Pet,
  med: MedicationRecord,
  opts: { onlyPending: boolean }
): DoseReminder[] {
  const unit = med.doseUnit || MED_FORM_UNITS[med.form] || "dose(s)";
  const total = med.doses.length;
  const now = Date.now();
  const items: DoseReminder[] = [];

  med.doses.forEach((dose, i) => {
    if (opts.onlyPending && doseStatus(dose) !== "pending") return;
    const scheduled = new Date(dose.scheduledAt);
    if (opts.onlyPending && scheduled.getTime() < now) return;
    const notes = [
      `Dose ${i + 1} de ${total} · ${med.doseAmount} ${unit}`,
      `A cada ${med.frequencyHours}h · início ${doseWhenText(new Date(med.startDateTime))}`,
      med.notes || "",
      "Criado pelo PataCare 🐾",
    ]
      .filter(Boolean)
      .join("\n");
    items.push({
      title: `💊 ${med.name} — ${pet.name}`,
      notes,
      scheduledAt: scheduled,
      whenText: doseWhenText(scheduled),
    });
  });

  return items;
}

/** Um evento (com alarme) para cada dose de um medicamento. */
export function agendarDosesNoCalendario(
  items: DoseReminder[],
  fileLabel: string,
  alertMinutes = 0
) {
  if (items.length === 0) {
    toast("Nenhuma dose para agendar");
    return;
  }

  const events = items.flatMap((item) => {
    const end = new Date(item.scheduledAt.getTime() + 15 * 60000);
    return [
      "BEGIN:VEVENT",
      "UID:" + uid() + "@patacare",
      "DTSTART:" + icsLocalStamp(item.scheduledAt),
      "DTEND:" + icsLocalStamp(end),
      "SUMMARY:" + icsEscape(item.title),
      "DESCRIPTION:" + icsEscape(item.notes),
      "BEGIN:VALARM",
      "TRIGGER:" + (alertMinutes > 0 ? "-PT" + alertMinutes + "M" : "PT0M"),
      "ACTION:DISPLAY",
      "DESCRIPTION:Hora do remédio",
      "END:VALARM",
      "END:VEVENT",
    ];
  });

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PataCare//PT",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  downloadIcs(icsContent, fileLabel + "-doses");
  toast(items.length + " dose(s) no arquivo .ics — abra para adicionar ao seu calendário!");
}

/** Texto simples para colar onde o tutor quiser (WhatsApp, Notas, Lembretes...). */
export function dosesAsText(items: DoseReminder[]): string {
  return items.map((i) => `• ${i.title} — ${i.whenText}`).join("\n");
}

export async function copyDosesText(items: DoseReminder[]): Promise<boolean> {
  const text = dosesAsText(items);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Safari antigo/contexto sem permissão: cai no textarea temporário
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
