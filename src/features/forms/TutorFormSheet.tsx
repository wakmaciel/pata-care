import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTutorStore } from "@/store/tutor";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/ui/Field";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { SheetHeader } from "@/components/ui/OverlayHost";

const schema = z.object({
  name: z.string().trim().min(1, "Digite seu nome 🙂"),
  email: z.string().trim(),
  phone: z.string().trim(),
  city: z.string().trim(),
});
type FormValues = z.infer<typeof schema>;

export function TutorFormSheet() {
  const { tutor, save } = useTutorStore();
  const { closeSheet, toast } = useUiStore();
  const existing = tutor;
  const [photo, setPhoto] = useState<string | null>(existing?.photo ?? null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existing?.name ?? "",
      email: existing?.email ?? "",
      phone: existing?.phone ?? "",
      city: existing?.city ?? "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    save({ ...values, photo: photo || null, updatedAt: Date.now() });
    closeSheet();
    toast(existing ? "Perfil atualizado!" : "Perfil criado!");
  });

  return (
    <form onSubmit={onSubmit}>
      <SheetHeader title={existing ? "Editar perfil" : "Criar meu perfil"} />
      <Field label="Foto (opcional)">
        <PhotoUpload value={photo} onChange={setPhoto} maxDim={400} quality={0.8} />
      </Field>
      <Field label="Nome" error={errors.name?.message}>
        <input
          type="text"
          autoComplete="name"
          placeholder="Como você quer ser chamado(a)?"
          {...register("name")}
        />
      </Field>
      <Field label="E-mail (opcional)">
        <input
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@email.com"
          {...register("email")}
        />
      </Field>
      <Field label="Telefone (opcional)">
        <input
          type="text"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 99999-9999"
          {...register("phone")}
        />
      </Field>
      <Field label="Cidade (opcional)">
        <input type="text" placeholder="Ex: São Paulo" {...register("city")} />
      </Field>
      <Button type="submit" block>
        <Icon name="check" /> Salvar
      </Button>
    </form>
  );
}
