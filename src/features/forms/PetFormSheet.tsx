import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { uid } from "@/lib/utils";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { navigate } from "@/router";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, FieldRow, Seg } from "@/components/ui/Field";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { Pet, Sex, Species } from "@/types";

const schema = z.object({
  name: z.string().trim().min(1, "Dá um nome pro seu pet 🐾"),
  breed: z.string().trim(),
  birthDate: z.string(),
  microchip: z.string().trim(),
  notes: z.string().trim(),
});
type FormValues = z.infer<typeof schema>;

export function PetFormSheet({ existing }: { existing: Pet | null }) {
  const isEdit = !!existing;
  const { putPet, deletePetCascade } = useDataStore();
  const { closeSheet, toast, confirm } = useUiStore();
  const [photo, setPhoto] = useState<string | null>(existing?.photo ?? null);
  const [species, setSpecies] = useState<Species>(existing?.species ?? "dog");
  const [sex, setSex] = useState<Sex>(existing?.sex ?? "M");
  const [neutered, setNeutered] = useState<"0" | "1">(existing?.neutered ? "1" : "0");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existing?.name ?? "",
      breed: existing?.breed ?? "",
      birthDate: existing?.birthDate ?? "",
      microchip: existing?.microchip ?? "",
      notes: existing?.notes ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const pet: Pet = {
      ...(existing ?? { id: uid(), createdAt: Date.now() }),
      ...values,
      species,
      sex,
      neutered: neutered === "1",
      photo,
    } as Pet;
    await putPet(pet);
    closeSheet();
    toast(isEdit ? "Pet atualizado!" : "Pet adicionado!");
    navigate(`#/pet/${pet.id}/overview`);
  });

  const onDelete = async () => {
    if (!existing) return;
    const ok = await confirm({
      title: `Excluir ${existing.name}?`,
      message:
        "Todos os registros desse pet (vacinas, pesos, etc.) também serão excluídos. Essa ação não pode ser desfeita.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    await deletePetCascade(existing.id);
    closeSheet();
    toast("Pet excluído");
    navigate("#/");
  };

  return (
    <form onSubmit={onSubmit}>
      <SheetHeader title={isEdit ? "Editar pet" : "Novo pet"} />
      <Field label="Foto">
        <PhotoUpload value={photo} onChange={setPhoto} maxDim={600} quality={0.75} />
      </Field>
      <Field label="Nome" error={errors.name?.message}>
        <input type="text" placeholder="Ex: Mel, Thor, Luna..." {...register("name")} />
      </Field>
      <Field label="Espécie">
        <Seg
          options={[
            { value: "dog", label: "Cão" },
            { value: "cat", label: "Gato" },
            { value: "other", label: "Outro" },
          ]}
          value={species}
          onChange={setSpecies}
        />
      </Field>
      <FieldRow>
        <Field label="Sexo">
          <Seg
            options={[
              { value: "M", label: "Macho" },
              { value: "F", label: "Fêmea" },
            ]}
            value={sex}
            onChange={setSex}
          />
        </Field>
        <Field label="Castrado(a)?">
          <Seg
            options={[
              { value: "0", label: "Não" },
              { value: "1", label: "Sim" },
            ]}
            value={neutered}
            onChange={setNeutered}
          />
        </Field>
      </FieldRow>
      <Field label="Raça">
        <input type="text" placeholder="Ex: SRD, Poodle..." {...register("breed")} />
      </Field>
      <Field label="Data de nascimento">
        <input type="date" {...register("birthDate")} />
      </Field>
      <Field label="Microchip (opcional)">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Nº do microchip para rastreio (15 dígitos)"
          {...register("microchip")}
        />
      </Field>
      <Field label="Observações">
        <textarea placeholder="Alergias, particularidades..." {...register("notes")} />
      </Field>
      <Button type="submit" block>
        <Icon name="check" /> Salvar
      </Button>
      {isEdit && (
        <Button variant="danger" block style={{ marginTop: 10 }} onClick={onDelete}>
          <Icon name="trash" /> Excluir pet
        </Button>
      )}
    </form>
  );
}
