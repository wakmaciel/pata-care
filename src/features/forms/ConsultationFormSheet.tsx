import { useMemo, useState } from "react";
import { uid } from "@/lib/utils";
import { todayISO } from "@/lib/dates";
import { distinctValues } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, FieldRow, SwitchRow } from "@/components/ui/Field";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { ConsultationRecord } from "@/types";

export function ConsultationFormSheet({
  petId,
  existing,
}: {
  petId: string;
  existing: ConsultationRecord | null;
}) {
  const isEdit = !!existing;
  const { records, putRecord, deleteRecord } = useDataStore();
  const { closeSheet, toast, confirm } = useUiStore();

  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [vet, setVet] = useState(existing?.vet ?? "");
  const [crm, setCrm] = useState(existing?.crm ?? "");
  const [reason, setReason] = useState(existing?.reason ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [hasReturn, setHasReturn] = useState(!!existing?.nextDate);
  const [returnDate, setReturnDate] = useState(existing?.nextDate ?? "");

  const vetSuggestions = useMemo(() => distinctValues(records, "consultation", "vet"), [records]);
  const crmSuggestions = useMemo(() => distinctValues(records, "consultation", "crm"), [records]);

  const onSave = async () => {
    if (!date) {
      toast("Informe a data da consulta");
      return;
    }
    if (!vet.trim()) {
      toast("Informe o veterinário(a)/Dr(a).");
      return;
    }
    if (hasReturn && !returnDate) {
      toast("Informe a data de retorno ou desative a opção");
      return;
    }
    const rec: ConsultationRecord = {
      ...(existing ?? {
        id: uid(),
        petId,
        category: "consultation" as const,
        createdAt: Date.now(),
      }),
      date,
      vet: vet.trim(),
      crm: crm.trim(),
      reason: reason.trim(),
      notes: notes.trim(),
      hasReturn,
      nextDate: hasReturn ? returnDate : null,
    };
    await putRecord(rec);
    closeSheet();
    toast(isEdit ? "Consulta atualizada!" : "Consulta registrada!");
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
      <SheetHeader title={isEdit ? "Editar consulta" : "Nova consulta"} />
      <Field label="Data da consulta">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Veterinário(a)/Dr(a).">
          <input
            type="text"
            list="dl-co-vet"
            autoComplete="off"
            placeholder="Ex: Dr. João Lima"
            value={vet}
            onChange={(e) => setVet(e.target.value)}
          />
          <datalist id="dl-co-vet">
            {vetSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="CRMV (opcional)" className="max-w-[130px]">
          <input
            type="text"
            list="dl-co-crm"
            autoComplete="off"
            placeholder="Ex: SP-12345"
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
          />
          <datalist id="dl-co-crm">
            {crmSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
      </FieldRow>
      <Field label="Motivo da consulta (opcional)">
        <input
          type="text"
          placeholder="Ex: Check-up, vômito, coceira..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Field>
      <Field label="Observações / Diagnóstico">
        <textarea
          placeholder="Diagnóstico, orientações, receita..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <SwitchRow
        label="Agendar retorno?"
        sub="Habilite para definir uma data de retorno"
        checked={hasReturn}
        onChange={setHasReturn}
      />
      {hasReturn && (
        <Field label="Data de retorno">
          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
        </Field>
      )}
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
