import { useForm } from "react-hook-form";
import { todayISO } from "@/lib/dates";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, FieldRow } from "@/components/ui/Field";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { Pet } from "@/types";

interface FormValues {
  neck: string;
  chest: string;
  length: string;
  notes: string;
}

export function MeasurementsFormSheet({ pet }: { pet: Pet }) {
  const m = pet.measurements ?? { neck: null, chest: null, length: null, notes: "" };
  const { putPet } = useDataStore();
  const { closeSheet, toast, confirm } = useUiStore();
  const hasAny = !!(m.neck || m.chest || m.length || m.notes);

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      neck: m.neck ? String(m.neck) : "",
      chest: m.chest ? String(m.chest) : "",
      length: m.length ? String(m.length) : "",
      notes: m.notes || "",
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const neck = v.neck.trim();
    const chest = v.chest.trim();
    const length = v.length.trim();
    const notes = v.notes.trim();
    if (!neck && !chest && !length && !notes) {
      toast("Informe pelo menos uma medida");
      return;
    }
    const updated: Pet = {
      ...pet,
      measurements: {
        neck: neck ? Number(neck) : null,
        chest: chest ? Number(chest) : null,
        length: length ? Number(length) : null,
        notes,
        updatedAt: todayISO(),
      },
    };
    await putPet(updated);
    closeSheet();
    toast("Medidas salvas!");
  });

  const onClear = async () => {
    const ok = await confirm({
      title: "Limpar medidas?",
      message: "As medidas registradas para este pet serão removidas.",
      confirmLabel: "Limpar",
      danger: true,
    });
    if (!ok) return;
    const updated = { ...pet };
    delete updated.measurements;
    await putPet(updated);
    closeSheet();
    toast("Medidas removidas");
  };

  return (
    <form onSubmit={onSubmit}>
      <SheetHeader title={`Medidas de ${pet.name}`} />
      <p
        style={{
          fontSize: 12.5,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          margin: "-4px 0 14px",
        }}
      >
        Úteis na hora de comprar roupas, coleiras e peitorais. Meça com uma fita métrica, com o pet
        em pé.
      </p>
      <FieldRow>
        <Field label="Pescoço (cm)">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            placeholder="Ex: 32"
            {...register("neck")}
          />
        </Field>
        <Field label="Peito/Tórax (cm)">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            placeholder="Ex: 45"
            {...register("chest")}
          />
        </Field>
      </FieldRow>
      <Field
        label="Comprimento do dorso (cm)"
        hint={
          <p style={{ fontSize: 11.5, color: "var(--text-faint)", lineHeight: 1.4, marginTop: 6 }}>
            Do ponto mais alto da base do pescoço até a base do rabo.
          </p>
        }
      >
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          placeholder="Ex: 38"
          {...register("length")}
        />
      </Field>
      <Field label="Observações">
        <textarea
          placeholder="Ex: veste roupa tamanho P, coleira ajustada no 3º furo..."
          {...register("notes")}
        />
      </Field>
      <Button type="submit" block>
        <Icon name="check" /> Salvar
      </Button>
      {hasAny && (
        <Button variant="danger" block style={{ marginTop: 10 }} onClick={onClear}>
          <Icon name="trash" /> Limpar medidas
        </Button>
      )}
    </form>
  );
}
