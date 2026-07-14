import { useMemo, useState } from "react";
import { uid } from "@/lib/utils";
import { pad, todayISO } from "@/lib/dates";
import { buildMedicationDoses, isDosePending, MED_FORM_UNITS } from "@/domain/medications";
import { distinctValues } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, FieldRow } from "@/components/ui/Field";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { MedicationForm, MedicationRecord } from "@/types";

export function MedicationFormSheet({
  petId,
  existing,
}: {
  petId: string;
  existing: MedicationRecord | null;
}) {
  const isEdit = !!existing;
  const { records, putRecord, deleteRecord } = useDataStore();
  const { closeSheet, toast, confirm } = useUiStore();

  const now = new Date();
  const defaultStart = todayISO() + "T" + pad(now.getHours()) + ":" + pad(now.getMinutes());

  const [name, setName] = useState(existing?.name ?? "");
  const [form, setForm] = useState<MedicationForm>(existing?.form ?? "comprimido");
  const [amount, setAmount] = useState(existing ? String(existing.doseAmount) : "1");
  const [freq, setFreq] = useState(existing ? String(existing.frequencyHours) : "8");
  const [start, setStart] = useState(existing ? existing.startDateTime.slice(0, 16) : defaultStart);
  const [duration, setDuration] = useState(existing ? String(existing.durationDays ?? "") : "7");
  const [totalDirty, setTotalDirty] = useState(isEdit);
  const [totalManual, setTotalManual] = useState(existing ? String(existing.totalDoses) : "");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const nameSuggestions = useMemo(() => distinctValues(records, "medication", "name"), [records]);

  const totalAuto = useMemo(() => {
    const f = parseFloat(freq);
    const d = parseFloat(duration);
    if (f > 0 && d > 0) return String(Math.max(1, Math.round((d * 24) / f)));
    return "";
  }, [freq, duration]);
  const total = totalDirty ? totalManual : totalAuto;

  // Preenche forma/dose/frequência com base no último uso do mesmo medicamento
  const onNameCommit = (typed: string) => {
    if (isEdit) return;
    const prev = records
      .filter((r): r is MedicationRecord => r.category === "medication" && r.name === typed.trim())
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
    if (!prev) return;
    setForm(prev.form);
    setAmount(String(prev.doseAmount));
    setFreq(String(prev.frequencyHours));
    toast("Preenchido com base no último uso de " + typed.trim());
  };

  const onSave = async () => {
    const doseAmount = parseFloat(amount);
    const frequencyHours = parseFloat(freq);
    const durationDays = parseFloat(duration) || null;
    const totalDoses = parseInt(total, 10);

    if (!name.trim()) return toast("Dê um nome para o medicamento");
    if (!doseAmount || doseAmount <= 0) return toast("Informe a quantidade por dose");
    if (!frequencyHours || frequencyHours <= 0) return toast("Informe de quantas em quantas horas");
    if (!start) return toast("Informe a data e hora de início");
    if (!totalDoses || totalDoses <= 0) return toast("Informe o total de doses");

    const startDateTime = new Date(start).toISOString();
    let doses;
    if (existing) {
      // preserva doses já resolvidas (aplicadas ou não aplicadas); recalcula só as pendentes
      const resolvedOnes = existing.doses.filter((d) => !isDosePending(d));
      if (resolvedOnes.length >= totalDoses) {
        doses = resolvedOnes.slice(0, totalDoses);
      } else {
        const newSchedule = buildMedicationDoses(startDateTime, frequencyHours, totalDoses);
        doses = resolvedOnes.concat(newSchedule.slice(resolvedOnes.length));
      }
    } else {
      doses = buildMedicationDoses(startDateTime, frequencyHours, totalDoses);
    }

    const rec: MedicationRecord = {
      ...(existing ?? { id: uid(), petId, category: "medication" as const, createdAt: Date.now() }),
      name: name.trim(),
      form,
      doseAmount,
      doseUnit: MED_FORM_UNITS[form],
      frequencyHours,
      startDateTime,
      durationDays,
      totalDoses,
      doses,
      notes: notes.trim(),
    };
    await putRecord(rec);
    closeSheet();
    toast(isEdit ? "Medicamento atualizado!" : "Medicamento adicionado!");
  };

  const onDelete = async () => {
    if (!existing) return;
    const ok = await confirm({
      title: "Excluir medicamento?",
      message: "Todo o histórico de doses desse medicamento será excluído.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    await deleteRecord(existing.id);
    closeSheet();
    toast("Medicamento excluído");
  };

  return (
    <div>
      <SheetHeader title={isEdit ? "Editar medicamento" : "Novo medicamento"} />
      <Field label="Nome do medicamento">
        <input
          type="text"
          list="dl-mf-name"
          autoComplete="off"
          placeholder="Ex: Amoxicilina, Meloxicam..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => onNameCommit(e.target.value)}
        />
        <datalist id="dl-mf-name">
          {nameSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>
      <Field label="Forma de administração">
        <select value={form} onChange={(e) => setForm(e.target.value as MedicationForm)}>
          <option value="comprimido">Comprimido</option>
          <option value="gota">Gota</option>
          <option value="liquido">Líquido (ml)</option>
          <option value="injecao">Injeção</option>
          <option value="outro">Outra</option>
        </select>
      </Field>
      <FieldRow>
        <Field label="Qtd. por dose">
          <input
            type="number"
            step="0.5"
            placeholder="Ex: 1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label="A cada (horas)">
          <input
            type="number"
            step="1"
            placeholder="Ex: 8"
            value={freq}
            onChange={(e) => setFreq(e.target.value)}
          />
        </Field>
      </FieldRow>
      <Field label="Início — data e hora da 1ª dose">
        <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Duração (dias)">
          <input
            type="number"
            step="1"
            placeholder="Ex: 7"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </Field>
        <Field label="Total de doses">
          <input
            type="number"
            step="1"
            value={total}
            onChange={(e) => {
              setTotalDirty(true);
              setTotalManual(e.target.value);
            }}
          />
        </Field>
      </FieldRow>
      <Field label="Observações">
        <textarea
          placeholder="Motivo, orientação do veterinário..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <Button block onClick={onSave}>
        <Icon name="check" /> Salvar
      </Button>
      {isEdit && (
        <Button variant="danger" block style={{ marginTop: 10 }} onClick={onDelete}>
          <Icon name="trash" /> Excluir medicamento
        </Button>
      )}
    </div>
  );
}
