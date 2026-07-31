/* ── Integração com o app Lembretes do iPhone ───────────────────────────────
   O Safari não escreve direto nos Lembretes. O caminho suportado pela Apple é
   o app Atalhos: o PataCare abre `shortcuts://run-shortcut` mandando um JSON
   como entrada, e um atalho criado uma única vez pelo tutor cria um lembrete
   por dose na lista escolhida (ex.: "Pet"). */
import { pad } from "@/lib/dates";
import { doseStatus, MED_FORM_UNITS } from "@/domain/medications";
import type { MedicationRecord, Pet } from "@/types";

const REMINDERS_SETTINGS_KEY = "patacare-reminders-settings";

/** Limite de segurança: URLs muito longas são recusadas pelo iOS. */
export const MAX_REMINDERS_PER_RUN = 60;

export interface RemindersSettings {
  /** nome exato do atalho criado no app Atalhos */
  shortcutName: string;
  /** lista do app Lembretes onde as doses entram */
  listName: string;
  /** antecedência do alerta, em minutos */
  leadMinutes: number;
}

export const DEFAULT_REMINDERS_SETTINGS: RemindersSettings = {
  shortcutName: "PataCare Lembretes",
  listName: "Pet",
  leadMinutes: 0,
};

export const LEAD_OPTIONS = [
  { label: "Na hora da dose", minutes: 0 },
  { label: "5 minutos antes", minutes: 5 },
  { label: "15 minutos antes", minutes: 15 },
  { label: "30 minutos antes", minutes: 30 },
  { label: "1 hora antes", minutes: 60 },
] as const;

export function getRemindersSettings(): RemindersSettings {
  try {
    const saved = JSON.parse(
      localStorage.getItem(REMINDERS_SETTINGS_KEY) || "null"
    ) as Partial<RemindersSettings> | null;
    return { ...DEFAULT_REMINDERS_SETTINGS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_REMINDERS_SETTINGS };
  }
}

export function saveRemindersSettings(settings: RemindersSettings) {
  localStorage.setItem(REMINDERS_SETTINGS_KEY, JSON.stringify(settings));
}

export interface ReminderItem {
  title: string;
  notes: string;
  /** ISO 8601 com fuso local — o Atalhos converte direto em data */
  dueAt: string;
  /** mesma data em texto legível, útil dentro do atalho e na cópia manual */
  dueAtText: string;
}

export interface RemindersPayload {
  app: "PataCare";
  version: 1;
  list: string;
  reminders: ReminderItem[];
}

/** iPhone/iPad/Mac — só nesses o esquema shortcuts:// existe. */
export function isAppleDevice(): boolean {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod|Macintosh/.test(ua);
}

/** "2026-07-31T08:00:00-03:00" — o Atalhos entende sem ambiguidade de fuso. */
function localISOWithOffset(d: Date): string {
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":00" +
    sign +
    pad(Math.floor(abs / 60)) +
    ":" +
    pad(abs % 60)
  );
}

function dueAtText(d: Date): string {
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

export interface BuildRemindersOptions {
  /** ignora doses já aplicadas/não aplicadas e as que já passaram */
  onlyPending: boolean;
  leadMinutes: number;
}

export function buildDoseReminders(
  pet: Pet,
  med: MedicationRecord,
  opts: BuildRemindersOptions
): ReminderItem[] {
  const unit = med.doseUnit || MED_FORM_UNITS[med.form] || "dose(s)";
  const total = med.doses.length;
  const now = Date.now();
  const items: ReminderItem[] = [];

  med.doses.forEach((dose, i) => {
    if (opts.onlyPending && doseStatus(dose) !== "pending") return;
    const scheduled = new Date(dose.scheduledAt);
    if (opts.onlyPending && scheduled.getTime() < now) return;
    const due = new Date(scheduled.getTime() - opts.leadMinutes * 60000);
    const notes = [
      `Dose ${i + 1} de ${total} · ${med.doseAmount} ${unit}`,
      `A cada ${med.frequencyHours}h · início ${dueAtText(new Date(med.startDateTime))}`,
      med.notes || "",
      "Criado pelo PataCare 🐾",
    ]
      .filter(Boolean)
      .join("\n");
    items.push({
      title: `💊 ${med.name} — ${pet.name}`,
      notes,
      dueAt: localISOWithOffset(due),
      dueAtText: dueAtText(due),
    });
  });

  return items.slice(0, MAX_REMINDERS_PER_RUN);
}

export function buildRemindersPayload(
  listName: string,
  reminders: ReminderItem[]
): RemindersPayload {
  return { app: "PataCare", version: 1, list: listName, reminders };
}

export function buildShortcutUrl(shortcutName: string, payload: RemindersPayload): string {
  return (
    "shortcuts://x-callback-url/run-shortcut?name=" +
    encodeURIComponent(shortcutName) +
    "&input=text&text=" +
    encodeURIComponent(JSON.stringify(payload))
  );
}

/** Abre o app Atalhos executando o atalho do tutor com o JSON das doses. */
export function runRemindersShortcut(shortcutName: string, payload: RemindersPayload) {
  window.location.href = buildShortcutUrl(shortcutName, payload);
}

/** Texto simples para colar à mão nos Lembretes quando o atalho não estiver pronto. */
export function remindersAsText(payload: RemindersPayload): string {
  return (
    `Lembretes para a lista "${payload.list}":\n\n` +
    payload.reminders.map((r) => `• ${r.title} — ${r.dueAtText}`).join("\n")
  );
}

export async function copyRemindersText(payload: RemindersPayload): Promise<boolean> {
  const text = remindersAsText(payload);
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
