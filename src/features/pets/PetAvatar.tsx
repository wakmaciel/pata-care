import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import type { CSSProperties } from "react";
import type { Pet } from "@/types";

/** Foto do pet ou placeholder com o ícone da espécie. */
export function PetAvatar({
  pet,
  className = "pet-avatar",
  style,
}: {
  pet: Pet;
  className?: string;
  style?: CSSProperties;
}) {
  if (pet.photo) {
    return <img className={className} style={style} src={pet.photo} alt={`Foto de ${pet.name}`} />;
  }
  return (
    <div className={cn(className, "placeholder")} style={style}>
      <Icon name={pet.species === "cat" ? "cat" : "dog"} />
    </div>
  );
}

export function speciesLabel(pet: Pet): string {
  return pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Outro";
}

export function breedLabel(pet: Pet): string {
  return pet.breed || (pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Pet");
}

export function sexLabel(pet: Pet): string {
  return pet.sex === "F" ? "Fêmea" : "Macho";
}
