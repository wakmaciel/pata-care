import { useMemo, useState } from "react";
import { doseStatus, MED_FORM_UNITS } from "@/domain/medications";
import { agendarDosesNoCalendario } from "@/services/calendar";
import {
  buildDoseReminders,
  buildRemindersPayload,
  copyRemindersText,
  getRemindersSettings,
  isAppleDevice,
  LEAD_OPTIONS,
  MAX_REMINDERS_PER_RUN,
  runRemindersShortcut,
  saveRemindersSettings,
} from "@/services/reminders";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, SwitchRow } from "@/components/ui/Field";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { MedicationRecord, Pet } from "@/types";

export function MedicationRemindersSheet({ med, pet }: { med: MedicationRecord; pet: Pet }) {
  const { closeSheet, toast } = useUiStore();
  const saved = getRemindersSettings();

  const [listName, setListName] = useState(saved.listName);
  const [shortcutName, setShortcutName] = useState(saved.shortcutName);
  const [leadMinutes, setLeadMinutes] = useState(saved.leadMinutes);
  const [onlyPending, setOnlyPending] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const items = useMemo(
    () => buildDoseReminders(pet, med, { onlyPending, leadMinutes }),
    [pet, med, onlyPending, leadMinutes]
  );
  const totalCandidates = onlyPending
    ? med.doses.filter((d) => doseStatus(d) === "pending" && new Date(d.scheduledAt) >= new Date())
        .length
    : med.doses.length;
  const truncated = totalCandidates > items.length;
  const unit = med.doseUnit || MED_FORM_UNITS[med.form] || "dose(s)";
  const apple = isAppleDevice();

  const persist = () => saveRemindersSettings({ listName, shortcutName, leadMinutes });

  const onSend = () => {
    if (items.length === 0) return toast("Nenhuma dose para lembrar");
    persist();
    runRemindersShortcut(shortcutName, buildRemindersPayload(listName, items));
    closeSheet();
  };

  const onCalendar = () => {
    if (items.length === 0) return toast("Nenhuma dose para agendar");
    persist();
    const scheduled = med.doses
      .filter(
        (d) =>
          !onlyPending || (doseStatus(d) === "pending" && new Date(d.scheduledAt) >= new Date())
      )
      .slice(0, MAX_REMINDERS_PER_RUN)
      .map((d) => d.scheduledAt);
    agendarDosesNoCalendario(
      pet.name,
      med.name,
      scheduled,
      `${med.doseAmount} ${unit} a cada ${med.frequencyHours}h` +
        (med.notes ? ` — ${med.notes}` : ""),
      leadMinutes
    );
    closeSheet();
  };

  const onCopy = async () => {
    if (items.length === 0) return toast("Nenhuma dose para copiar");
    const ok = await copyRemindersText(buildRemindersPayload(listName, items));
    toast(ok ? "Lista copiada!" : "Não foi possível copiar aqui");
  };

  return (
    <div>
      <SheetHeader title="🔔 Lembretes no iPhone" />

      <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Medicamento</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>
          {med.name} — {pet.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          {med.doseAmount} {unit} · a cada {med.frequencyHours}h ·{" "}
          {items.length === 0
            ? "nenhuma dose a lembrar"
            : `${items.length} lembrete${items.length === 1 ? "" : "s"}`}
        </div>
        {truncated && (
          <div style={{ fontSize: 12.5, color: "var(--peach)", marginTop: 6 }}>
            Só as primeiras {MAX_REMINDERS_PER_RUN} doses vão de uma vez — repita depois para o
            restante.
          </div>
        )}
      </div>

      <SwitchRow
        label="Somente doses pendentes"
        sub="Ignora as já aplicadas e as que já passaram"
        checked={onlyPending}
        onChange={setOnlyPending}
      />

      <Field label="Lista dos Lembretes">
        <input
          type="text"
          placeholder="Ex: Pet"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          onBlur={persist}
        />
      </Field>

      <Field label="Alerta">
        <select value={leadMinutes} onChange={(e) => setLeadMinutes(parseInt(e.target.value, 10))}>
          {LEAD_OPTIONS.map((o) => (
            <option key={o.minutes} value={o.minutes}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Nome do atalho (app Atalhos)">
        <input
          type="text"
          placeholder="Ex: PataCare Lembretes"
          value={shortcutName}
          onChange={(e) => setShortcutName(e.target.value)}
          onBlur={persist}
        />
      </Field>

      {!apple && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--text-muted)",
            lineHeight: 1.5,
            margin: "0 0 12px",
          }}
        >
          O envio para os Lembretes usa o app Atalhos, que só existe no iPhone, iPad e Mac. Neste
          aparelho, use o arquivo de calendário ou copie a lista.
        </p>
      )}

      <Button block onClick={onSend} disabled={items.length === 0}>
        <Icon name="bell" /> Enviar para o app Atalhos
      </Button>
      <Button
        variant="secondary"
        block
        style={{ marginTop: 10 }}
        onClick={onCalendar}
        disabled={items.length === 0}
      >
        <Icon name="calendar" /> Adicionar ao calendário (.ics)
      </Button>
      <Button variant="secondary" block style={{ marginTop: 10 }} onClick={onCopy}>
        <Icon name="clipboard" /> Copiar lista das doses
      </Button>

      <button
        type="button"
        className="attach-add-btn"
        style={{ marginTop: 14 }}
        onClick={() => setShowHelp((v) => !v)}
      >
        <Icon name="info" /> Como criar o atalho (uma vez só)
      </button>

      {showHelp && <RemindersHowTo listName={listName} shortcutName={shortcutName} />}
    </div>
  );
}

/** Passo a passo do atalho — usado aqui e nos Ajustes. */
export function RemindersHowTo({
  listName,
  shortcutName,
}: {
  listName: string;
  shortcutName: string;
}) {
  const steps = [
    `Abra o app Atalhos no iPhone e crie um novo atalho chamado "${shortcutName || "PataCare Lembretes"}".`,
    'Nas informações do atalho (ícone ⓘ), ative "Mostrar na Tela de Compartilhamento" e aceite receber Texto.',
    'Adicione a ação "Obter dicionário da entrada".',
    'Adicione "Obter valor do dicionário" com a chave "reminders".',
    'Adicione "Repetir com cada" usando esse valor.',
    'Dentro do repetir, adicione "Obter valor do dicionário" para "title", "notes" e "dueAt" do Item de Repetição.',
    `Ainda dentro do repetir, adicione "Adicionar novo lembrete": título = title, lista = ${listName || "Pet"}, notas = notes e alerta na data = dueAt.`,
    "Salve o atalho. Pronto: toque em Enviar para o app Atalhos sempre que cadastrar um remédio.",
  ];
  return (
    <div className="card" style={{ marginTop: 12, padding: "14px 16px" }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        Atalho "{shortcutName || "PataCare Lembretes"}"
      </div>
      <ol
        style={{
          margin: 0,
          paddingLeft: 18,
          fontSize: 12.5,
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        {steps.map((s) => (
          <li key={s} style={{ marginBottom: 6 }}>
            {s}
          </li>
        ))}
      </ol>
      <p style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.5, margin: "10px 0 0" }}>
        O PataCare manda um JSON com a lista, o título, as notas e o horário de cada dose — o atalho
        só distribui isso nos Lembretes.
      </p>
    </div>
  );
}
