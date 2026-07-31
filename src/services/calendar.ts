/* ── Integração com o calendário "Pets" ─────────────────────────────────────
   Gera um arquivo .ics compatível com iOS (abre direto no app Calendário). */
import { pad } from "@/lib/dates";
import { uid } from "@/lib/utils";
import { toast } from "@/store/ui";

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

/** Um evento (com alarme) para cada dose de um medicamento. */
export function agendarDosesNoCalendario(
  petName: string,
  medName: string,
  scheduledAtList: string[],
  description: string,
  alertMinutes = 0
) {
  if (scheduledAtList.length === 0) {
    toast("Nenhuma dose para agendar");
    return;
  }
  const summary = icsEscape("💊 " + medName + " — " + petName);
  const desc = icsEscape(description);

  const events = scheduledAtList.flatMap((iso) => {
    const start = new Date(iso);
    const end = new Date(start.getTime() + 15 * 60000);
    return [
      "BEGIN:VEVENT",
      "UID:" + uid() + "@patacare",
      "DTSTART:" + icsLocalStamp(start),
      "DTEND:" + icsLocalStamp(end),
      "SUMMARY:" + summary,
      "DESCRIPTION:" + desc,
      ...(alertMinutes > 0
        ? [
            "BEGIN:VALARM",
            "TRIGGER:-PT" + alertMinutes + "M",
            "ACTION:DISPLAY",
            "DESCRIPTION:Hora do remédio",
            "END:VALARM",
          ]
        : [
            "BEGIN:VALARM",
            "TRIGGER:PT0M",
            "ACTION:DISPLAY",
            "DESCRIPTION:Hora do remédio",
            "END:VALARM",
          ]),
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

  downloadIcs(icsContent, medName + "-" + petName + "-doses");
  toast(
    scheduledAtList.length + " dose(s) no arquivo .ics — abra para adicionar ao seu calendário!"
  );
}
