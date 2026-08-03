import { useMemo, useState } from "react";
import { MED_FORM_UNITS } from "@/domain/medications";
import {
  agendarDosesNoCalendario,
  buildDoseReminders,
  copyDosesText,
  DOSE_ALERT_OPTIONS,
  getDoseAlertSettings,
  saveDoseAlertSettings,
} from "@/services/calendar";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, SwitchRow } from "@/components/ui/Field";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { MedicationRecord, Pet } from "@/types";

export function MedicationCalendarSheet({ med, pet }: { med: MedicationRecord; pet: Pet }) {
  const { closeSheet, toast } = useUiStore();

  const [leadMinutes, setLeadMinutes] = useState(getDoseAlertSettings().leadMinutes);
  const [onlyPending, setOnlyPending] = useState(true);

  const items = useMemo(
    () => buildDoseReminders(pet, med, { onlyPending }),
    [pet, med, onlyPending]
  );
  const unit = med.doseUnit || MED_FORM_UNITS[med.form] || "dose(s)";

  const onCalendar = () => {
    if (items.length === 0) return toast("Nenhuma dose para agendar");
    saveDoseAlertSettings({ leadMinutes });
    agendarDosesNoCalendario(items, med.name + "-" + pet.name, leadMinutes);
    closeSheet();
  };

  const onCopy = async () => {
    if (items.length === 0) return toast("Nenhuma dose para copiar");
    const ok = await copyDosesText(items);
    toast(ok ? "Lista copiada!" : "Não foi possível copiar aqui");
  };

  return (
    <div>
      <SheetHeader title="📅 Doses no calendário" />

      <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Medicamento</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>
          {med.name} — {pet.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          {med.doseAmount} {unit} · a cada {med.frequencyHours}h ·{" "}
          {items.length === 0
            ? "nenhuma dose a agendar"
            : `${items.length} evento${items.length === 1 ? "" : "s"}`}
        </div>
      </div>

      <SwitchRow
        label="Somente doses pendentes"
        sub="Ignora as já aplicadas e as que já passaram"
        checked={onlyPending}
        onChange={setOnlyPending}
      />

      <Field label="Alerta">
        <select value={leadMinutes} onChange={(e) => setLeadMinutes(parseInt(e.target.value, 10))}>
          {DOSE_ALERT_OPTIONS.map((o) => (
            <option key={o.minutes} value={o.minutes}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <p
        style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 12px" }}
      >
        O PataCare gera um arquivo <strong>.ics</strong> com um evento por dose. Ao abrir o arquivo,
        o iPhone adiciona tudo ao Calendário — e o alarme de cada dose toca mesmo com o app fechado.
      </p>

      <Button block onClick={onCalendar} disabled={items.length === 0}>
        <Icon name="calendar" /> Adicionar ao calendário (.ics)
      </Button>
      <Button variant="secondary" block style={{ marginTop: 10 }} onClick={onCopy}>
        <Icon name="clipboard" /> Copiar lista das doses
      </Button>
    </div>
  );
}
