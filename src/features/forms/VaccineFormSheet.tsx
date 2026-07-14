import { useMemo, useState } from "react";
import { uid } from "@/lib/utils";
import { todayISO } from "@/lib/dates";
import { computeVaccineSchedule, VACCINE_PROTOCOLS } from "@/domain/vaccines";
import { distinctValues } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/ui/Field";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { Pet, VaccineRecord } from "@/types";

export function VaccineFormSheet({ pet, existing }: { pet: Pet; existing: VaccineRecord | null }) {
  const isEdit = !!existing;
  const { records, putRecord, deleteRecord } = useDataStore();
  const { closeSheet, toast, confirm } = useUiStore();

  const typeOptions = useMemo(
    () =>
      Object.keys(VACCINE_PROTOCOLS).filter((k) => {
        const p = VACCINE_PROTOCOLS[k]!;
        return (
          k === "outra" ||
          p.species === "any" ||
          p.species === pet.species ||
          pet.species === "other"
        );
      }),
    [pet.species]
  );

  const [type, setType] = useState(existing ? existing.vaccineType || "outra" : typeOptions[0]!);
  const [name, setName] = useState(existing?.name ?? "");
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [photo, setPhoto] = useState<string | null>(existing?.photo ?? null);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  // true depois que o usuário edita a próxima dose manualmente
  const [nextDateDirty, setNextDateDirty] = useState(isEdit && !!existing?.nextDate);
  const [manualNext, setManualNext] = useState(existing?.nextDate ?? "");

  const sched = useMemo(() => {
    if (type === "outra" || !date) return null;
    return computeVaccineSchedule(records, pet.id, type, date, existing ? existing.id : null);
  }, [records, pet.id, type, date, existing]);

  const nextValue = nextDateDirty ? manualNext : (sched?.nextDate ?? "");

  let hint: string;
  if (type === "outra" || !date) {
    hint = "Defina a próxima dose manualmente, se quiser.";
  } else if (sched?.isBooster) {
    hint =
      "Reforço anual — calculado automaticamente conforme protocolo veterinário usual no Brasil. Confirme com seu médico-veterinário.";
  } else if (sched?.protocol?.initialDoses === 1) {
    hint =
      "Dose única — o reforço anual já foi calculado automaticamente. Confirme com seu médico-veterinário.";
  } else if (sched?.protocol) {
    hint = `Dose ${sched.doseNumber} de ${sched.protocol.initialDoses} do esquema inicial — calculado automaticamente (intervalo de ${sched.protocol.intervalDays} dias). Confirme com seu médico-veterinário.`;
  } else {
    hint = "";
  }

  const nameSuggestions = useMemo(() => distinctValues(records, "vaccine", "name"), [records]);

  const onSave = async () => {
    if (!date) {
      toast("Informe a data aplicada");
      return;
    }
    if (type === "outra" && !name.trim()) {
      toast("Dê um nome para essa vacina");
      return;
    }
    const schedFinal =
      type !== "outra"
        ? computeVaccineSchedule(records, pet.id, type, date, existing ? existing.id : null)
        : { doseNumber: null, isBooster: false };
    const rec: VaccineRecord = {
      ...(existing ?? {
        id: uid(),
        petId: pet.id,
        category: "vaccine" as const,
        createdAt: Date.now(),
      }),
      vaccineType: type,
      name: type === "outra" ? name.trim() : "",
      date,
      nextDate: nextValue || null,
      photo,
      notes: notes.trim(),
      doseNumber: schedFinal.doseNumber,
      isBooster: schedFinal.isBooster,
    };
    await putRecord(rec);
    closeSheet();
    toast(isEdit ? "Vacina atualizada!" : "Vacina registrada!");
  };

  const onDelete = async () => {
    if (!existing) return;
    const ok = await confirm({
      title: "Excluir registro?",
      message: "Essa ação não pode ser desfeita.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    await deleteRecord(existing.id);
    closeSheet();
    toast("Registro excluído");
  };

  return (
    <div>
      <SheetHeader title={isEdit ? "Editar vacina" : "Nova vacina"} />
      <Field label="Tipo de vacina">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setNextDateDirty(false);
          }}
        >
          {typeOptions.map((k) => (
            <option key={k} value={k}>
              {VACCINE_PROTOCOLS[k]!.label}
            </option>
          ))}
        </select>
      </Field>
      {type === "outra" && (
        <Field label="Nome da vacina">
          <input
            type="text"
            list="dl-vf-name"
            autoComplete="off"
            placeholder="Ex: Leptospirose extra, Polivalente felina..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <datalist id="dl-vf-name">
            {nameSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
      )}
      <Field label="Data aplicada">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Foto da etiqueta">
        <PhotoUpload value={photo} onChange={setPhoto} maxDim={800} quality={0.72} />
      </Field>
      <Field
        label="Próxima dose"
        hint={
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.4 }}>
            {hint}
          </div>
        }
      >
        <input
          type="date"
          value={nextValue}
          onChange={(e) => {
            setNextDateDirty(true);
            setManualNext(e.target.value);
          }}
        />
      </Field>
      <Field label="Observações">
        <textarea
          placeholder="Lote, clínica, reações..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <Button block onClick={onSave}>
        <Icon name="check" /> Salvar
      </Button>
      {isEdit && (
        <Button variant="danger" block style={{ marginTop: 10 }} onClick={onDelete}>
          <Icon name="trash" /> Excluir registro
        </Button>
      )}
    </div>
  );
}
