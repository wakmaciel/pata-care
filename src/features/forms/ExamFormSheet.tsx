import { useMemo, useState } from "react";
import { uid } from "@/lib/utils";
import { todayISO } from "@/lib/dates";
import { distinctValues } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, FieldRow } from "@/components/ui/Field";
import { AttachmentsField } from "@/components/ui/AttachmentsField";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { Attachment, ExamRecord } from "@/types";

const EXAM_TYPE_SUGGESTIONS = [
  "Raio-X",
  "Ultrassom",
  "Hemograma completo",
  "Exame de sangue (bioquímico)",
  "Urinálise",
  "Ecocardiograma",
  "Eletrocardiograma",
  "Tomografia",
  "Ressonância magnética",
  "Endoscopia",
  "Citologia",
  "Parasitológico de fezes",
];

export function ExamFormSheet({ petId, existing }: { petId: string; existing: ExamRecord | null }) {
  const isEdit = !!existing;
  const { records, putRecord, deleteRecord } = useDataStore();
  const { closeSheet, toast, confirm } = useUiStore();

  const [examType, setExamType] = useState(existing?.examType ?? "");
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [vet, setVet] = useState(existing?.vet ?? "");
  const [crm, setCrm] = useState(existing?.crm ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>(existing?.attachments ?? []);

  const examSuggestions = useMemo(
    () => [...new Set([...EXAM_TYPE_SUGGESTIONS, ...distinctValues(records, "exam", "examType")])],
    [records]
  );
  const vetSuggestions = useMemo(() => distinctValues(records, "exam", "vet"), [records]);
  const crmSuggestions = useMemo(() => distinctValues(records, "exam", "crm"), [records]);

  const onSave = async () => {
    if (!examType.trim()) {
      toast("Informe o tipo de exame");
      return;
    }
    if (!date) {
      toast("Informe a data do exame");
      return;
    }
    const rec: ExamRecord = {
      ...(existing ?? { id: uid(), petId, category: "exam" as const, createdAt: Date.now() }),
      examType: examType.trim(),
      date,
      vet: vet.trim(),
      crm: crm.trim(),
      notes: notes.trim(),
      attachments,
    };
    await putRecord(rec);
    closeSheet();
    toast(isEdit ? "Exame atualizado!" : "Exame registrado!");
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
      <SheetHeader title={isEdit ? "Editar exame" : "Novo exame"} />
      <Field label="Tipo de exame">
        <input
          type="text"
          list="dl-exam-type"
          autoComplete="off"
          placeholder="Ex: Raio-X, Ultrassom, Hemograma..."
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
        />
        <datalist id="dl-exam-type">
          {examSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>
      <Field label="Data do exame">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Veterinário(a)/Clínica (opcional)">
          <input
            type="text"
            list="dl-exam-vet"
            autoComplete="off"
            placeholder="Ex: Dra. Ana Souza / Clínica PetVida"
            value={vet}
            onChange={(e) => setVet(e.target.value)}
          />
          <datalist id="dl-exam-vet">
            {vetSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="CRMV (opcional)" className="max-w-[130px]">
          <input
            type="text"
            list="dl-exam-crm"
            autoComplete="off"
            placeholder="Ex: SP-12345"
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
          />
          <datalist id="dl-exam-crm">
            {crmSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
      </FieldRow>
      <Field label="Resultado / Observações">
        <textarea
          placeholder="Resultado do exame, observações do veterinário..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <Field label="Anexos (imagens, PDF...)">
        <AttachmentsField value={attachments} onChange={setAttachments} />
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
