import { useState } from "react";
import { fmtDate } from "@/lib/dates";
import { agendarNoCalendario, ALERT_OPTIONS, PETS_CALENDAR_NAME } from "@/services/calendar";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/ui/Field";
import { SheetHeader } from "@/components/ui/OverlayHost";

export function CalendarSheet({
  petName,
  title,
  dateISO,
  notes,
}: {
  petName: string;
  title: string;
  dateISO: string;
  notes: string;
}) {
  const { closeSheet } = useUiStore();
  const [alertMinutes, setAlertMinutes] = useState(1440);

  return (
    <div>
      <SheetHeader title="📅 Agendar no Calendário" />
      <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Evento</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>
          {title} — {petName}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          📆 {fmtDate(dateISO)}
        </div>
      </div>
      <div
        className="card"
        style={{
          marginBottom: 16,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 22 }}>📅</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Calendário: {PETS_CALENDAR_NAME}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Arquivo .ics gerado e aberto no iPhone
          </div>
        </div>
      </div>
      <Field label="Lembrete">
        <select
          value={alertMinutes}
          onChange={(e) => setAlertMinutes(parseInt(e.target.value, 10))}
        >
          {ALERT_OPTIONS.map((a) => (
            <option key={a.minutes} value={a.minutes}>
              {a.label}
            </option>
          ))}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Button variant="secondary" block onClick={closeSheet}>
          Cancelar
        </Button>
        <Button
          block
          onClick={() => {
            agendarNoCalendario(petName, title, dateISO, notes, alertMinutes);
            closeSheet();
          }}
        >
          <Icon name="check" /> Agendar
        </Button>
      </div>
    </div>
  );
}
