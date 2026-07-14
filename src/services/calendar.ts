/* ── Integração com o calendário "Pets" ─────────────────────────────────────
   Gera um arquivo .ics compatível com iOS (abre direto no app Calendário). */
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

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (title + "-" + petName).replace(/[^a-zA-Z0-9]/g, "_") + ".ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  toast("Arquivo .ics gerado — abra para adicionar ao calendário Pets!");
}
