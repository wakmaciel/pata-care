import { useState } from "react";
import { uid } from "@/lib/utils";
import { todayISO } from "@/lib/dates";
import { distinctValues } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/ui/Field";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { AnyRecord } from "@/types";

type GenericCategory = "antiparasitic" | "dewormer" | "weight" | "heat";

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "textarea";
  required?: boolean;
  placeholder?: string;
  step?: string;
  suggest?: boolean;
}

const RECORD_FORMS: Record<GenericCategory, { title: string; fields: FieldDef[] }> = {
  antiparasitic: {
    title: "antipulgas/carrapatos",
    fields: [
      {
        key: "product",
        label: "Produto aplicado",
        type: "text",
        required: true,
        placeholder: "Ex: Bravecto, Simparic, NexGard...",
        suggest: true,
      },
      { key: "date", label: "Data aplicada", type: "date", required: true },
      { key: "nextDate", label: "Próxima aplicação (opcional)", type: "date" },
      { key: "notes", label: "Observações", type: "textarea" },
    ],
  },
  dewormer: {
    title: "vermífugo",
    fields: [
      {
        key: "product",
        label: "Vermífugo aplicado",
        type: "text",
        required: true,
        placeholder: "Ex: Drontal, Vermivet...",
        suggest: true,
      },
      { key: "date", label: "Data aplicada", type: "date", required: true },
      { key: "nextDate", label: "Próxima aplicação (opcional)", type: "date" },
      { key: "notes", label: "Observações", type: "textarea" },
    ],
  },
  weight: {
    title: "peso",
    fields: [
      { key: "date", label: "Data", type: "date", required: true },
      {
        key: "weight",
        label: "Peso (kg)",
        type: "number",
        step: "0.1",
        required: true,
        placeholder: "Ex: 8.4",
      },
      { key: "notes", label: "Observações", type: "textarea" },
    ],
  },
  heat: {
    title: "cio",
    fields: [
      { key: "startDate", label: "Início do cio", type: "date", required: true },
      { key: "endDate", label: "Fim do cio (opcional)", type: "date" },
      { key: "notes", label: "Observações", type: "textarea" },
    ],
  },
};

export function GenericRecordFormSheet({
  category,
  petId,
  existing,
}: {
  category: GenericCategory;
  petId: string;
  existing: AnyRecord | null;
}) {
  const cfg = RECORD_FORMS[category];
  const isEdit = !!existing;
  const { records, putRecord, deleteRecord } = useDataStore();
  const { closeSheet, toast, confirm } = useUiStore();
  const today = todayISO();
  const defaults: Record<string, string> = { date: today, startDate: today };

  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    cfg.fields.forEach((f) => {
      const cur = existing
        ? (existing as unknown as Record<string, unknown>)[f.key]
        : defaults[f.key];
      v[f.key] = cur == null ? "" : String(cur);
    });
    return v;
  });

  const setField = (key: string, val: string) => setValues((s) => ({ ...s, [key]: val }));

  const onSave = async () => {
    const out: Record<string, unknown> = {};
    for (const f of cfg.fields) {
      let v: unknown = values[f.key] ?? "";
      if (f.type === "number") v = v === "" ? null : parseFloat(String(v));
      if (f.type === "text" || f.type === "textarea") v = String(v).trim();
      if (f.required && (v === "" || v === null || v === undefined)) {
        toast(`Preencha: ${f.label}`);
        return;
      }
      out[f.key] = v;
    }
    const rec = {
      ...(existing ?? { id: uid(), petId, category, createdAt: Date.now() }),
      ...out,
    } as AnyRecord;
    await putRecord(rec);
    closeSheet();
    toast(isEdit ? "Registro atualizado!" : "Registro salvo!");
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
      <SheetHeader title={(isEdit ? "Editar " : "Nova ") + cfg.title} />
      {cfg.fields.map((f) => {
        const suggestions = f.suggest ? distinctValues(records, category, f.key) : [];
        const listId = "dl-" + f.key;
        return (
          <Field key={f.key} label={f.label}>
            {f.type === "textarea" ? (
              <textarea
                placeholder={f.placeholder || ""}
                value={values[f.key] ?? ""}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            ) : (
              <>
                <input
                  type={f.type}
                  step={f.step}
                  list={suggestions.length ? listId : undefined}
                  autoComplete={suggestions.length ? "off" : undefined}
                  placeholder={f.placeholder || ""}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
                {suggestions.length > 0 && (
                  <datalist id={listId}>
                    {suggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                )}
              </>
            )}
          </Field>
        );
      })}
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
