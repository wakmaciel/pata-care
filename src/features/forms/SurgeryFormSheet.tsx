import { useMemo, useState } from "react";
import { uid, normalizeText } from "@/lib/utils";
import { todayISO } from "@/lib/dates";
import { distinctValues } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, FieldRow, SwitchRow } from "@/components/ui/Field";
import { AttachmentsField } from "@/components/ui/AttachmentsField";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { Attachment, Pet, SurgeryRecord } from "@/types";

const SURGERY_TYPE_SUGGESTIONS = [
  "Castração (Orquiectomia)",
  "Castração (Ovário-histerectomia)",
  "Remoção de nódulo/tumor",
  "Cirurgia ortopédica",
  "Cirurgia odontológica",
  "Cesariana",
  "Correção de hérnia",
  "Limpeza de tártaro com anestesia",
  "Outra",
];

function isNeuterSurgeryType(s: string): boolean {
  const t = normalizeText(s);
  return /castr|orquiectomia|ovario.?histerectomia|ovariohisterectomia/.test(t);
}

export function SurgeryFormSheet({ pet, existing }: { pet: Pet; existing: SurgeryRecord | null }) {
  const isEdit = !!existing;
  const { records, putRecord, putPet, deleteRecord } = useDataStore();
  const { closeSheet, toast, confirm } = useUiStore();
  const petAlreadyNeutered = !!pet.neutered;

  const [surgeryType, setSurgeryType] = useState(existing?.surgeryType ?? "");
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [vet, setVet] = useState(existing?.vet ?? "");
  const [crm, setCrm] = useState(existing?.crm ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>(existing?.attachments ?? []);
  const [markNeutered, setMarkNeutered] = useState(
    petAlreadyNeutered || (existing ? !!existing.markedNeutered : false)
  );

  const surgerySuggestions = useMemo(
    () => [
      ...new Set([
        ...SURGERY_TYPE_SUGGESTIONS,
        ...distinctValues(records, "surgery", "surgeryType"),
      ]),
    ],
    [records]
  );
  const vetSuggestions = useMemo(() => distinctValues(records, "surgery", "vet"), [records]);
  const crmSuggestions = useMemo(() => distinctValues(records, "surgery", "crm"), [records]);

  const onSave = async () => {
    if (!surgeryType.trim()) {
      toast("Informe o tipo de cirurgia");
      return;
    }
    if (!date) {
      toast("Informe a data da cirurgia");
      return;
    }
    const rec: SurgeryRecord = {
      ...(existing ?? {
        id: uid(),
        petId: pet.id,
        category: "surgery" as const,
        createdAt: Date.now(),
      }),
      surgeryType: surgeryType.trim(),
      date,
      vet: vet.trim(),
      crm: crm.trim(),
      notes: notes.trim(),
      markedNeutered: markNeutered,
      attachments,
    };
    await putRecord(rec);
    if (markNeutered && !pet.neutered) {
      await putPet({ ...pet, neutered: true });
    }
    closeSheet();
    toast(isEdit ? "Cirurgia atualizada!" : "Cirurgia registrada!");
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
      <SheetHeader title={isEdit ? "Editar cirurgia" : "Nova cirurgia"} />
      <Field label="Tipo de cirurgia">
        <input
          type="text"
          list="dl-surgery-type"
          autoComplete="off"
          placeholder="Ex: Castração, remoção de nódulo..."
          value={surgeryType}
          onChange={(e) => {
            setSurgeryType(e.target.value);
            // Sugere marcar automaticamente como castrado(a) quando o tipo digitado indica isso
            if (!petAlreadyNeutered && isNeuterSurgeryType(e.target.value)) setMarkNeutered(true);
          }}
        />
        <datalist id="dl-surgery-type">
          {surgerySuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>
      <Field label="Data da cirurgia">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Veterinário(a)/Clínica (opcional)">
          <input
            type="text"
            list="dl-surgery-vet"
            autoComplete="off"
            placeholder="Ex: Dr. Carlos Melo / Clínica VetBem"
            value={vet}
            onChange={(e) => setVet(e.target.value)}
          />
          <datalist id="dl-surgery-vet">
            {vetSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="CRMV (opcional)" className="max-w-[130px]">
          <input
            type="text"
            list="dl-surgery-crm"
            autoComplete="off"
            placeholder="Ex: SP-12345"
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
          />
          <datalist id="dl-surgery-crm">
            {crmSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
      </FieldRow>
      <Field label="Observações / Cuidados pós-operatórios">
        <textarea
          placeholder="Recomendações, medicação pós-cirúrgica, retirada de pontos..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <Field label="Fotos / Anexos (laudo, PDF...)">
        <AttachmentsField
          value={attachments}
          onChange={setAttachments}
          addLabel="Adicionar foto ou PDF"
        />
      </Field>
      <SwitchRow
        label="Marcar pet como castrado(a)"
        sub={
          petAlreadyNeutered
            ? "Este pet já está marcado como castrado(a)"
            : "Atualiza o cadastro do pet automaticamente"
        }
        checked={markNeutered}
        onChange={setMarkNeutered}
        disabled={petAlreadyNeutered}
        dim={petAlreadyNeutered}
      />
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
