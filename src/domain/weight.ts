/* ----------------------- Faixa de peso ideal por raça (referência geral) ------------------------
   Faixas aproximadas de peso adulto, baseadas em padrões usuais de raça. Servem só como
   referência — avaliação de peso real depende de exame físico (escore de condição corporal)
   feito por um médico-veterinário. Não se aplica a filhotes nem a SRD/vira-lata (porte variável). */
import { normalizeText } from "@/lib/utils";
import type { Pet } from "@/types";

export interface BreedWeightRange {
  min: number;
  max: number;
  isGenericCat?: boolean;
}

interface BreedWeightEntry extends BreedWeightRange {
  keys: string[];
  species?: "cat" | "dog";
}

const BREED_WEIGHT_TABLE: BreedWeightEntry[] = [
  { keys: ["chihuahua"], min: 1.5, max: 3 },
  { keys: ["yorkshire"], min: 2, max: 3.5 },
  { keys: ["maltes", "maltês"], min: 2, max: 4 },
  { keys: ["pomerania", "lulu da pomerania", "spitz alemao", "spitz alemão"], min: 1.5, max: 3.5 },
  { keys: ["pinscher mini", "pinscher miniatura"], min: 3, max: 6 },
  { keys: ["pinscher"], min: 3, max: 6 },
  { keys: ["poodle toy", "poodle micro"], min: 2, max: 4 },
  { keys: ["poodle mini", "poodle miniatura"], min: 5, max: 8 },
  { keys: ["poodle standard", "poodle grande", "poodle gigante"], min: 20, max: 31 },
  { keys: ["poodle"], min: 5, max: 8 },
  { keys: ["shih tzu"], min: 4, max: 8 },
  { keys: ["lhasa apso"], min: 5, max: 8 },
  { keys: ["bichon"], min: 3, max: 6 },
  { keys: ["jack russell"], min: 5, max: 8 },
  { keys: ["cavalier"], min: 5, max: 8 },
  { keys: ["dachshund mini", "salsicha mini", "teckel mini"], min: 3, max: 5 },
  { keys: ["dachshund", "salsicha", "teckel"], min: 7, max: 12 },
  { keys: ["schnauzer mini", "schnauzer miniatura"], min: 4, max: 8 },
  { keys: ["schnauzer gigante"], min: 25, max: 35 },
  { keys: ["schnauzer"], min: 13, max: 20 },
  { keys: ["bulldog frances", "bulldog francês"], min: 8, max: 14 },
  { keys: ["pug"], min: 6, max: 10 },
  { keys: ["beagle"], min: 9, max: 15 },
  { keys: ["cocker"], min: 11, max: 16 },
  { keys: ["border collie"], min: 12, max: 20 },
  { keys: ["whippet"], min: 7, max: 14 },
  { keys: ["basset"], min: 18, max: 29 },
  { keys: ["shar pei"], min: 18, max: 30 },
  { keys: ["spitz japones", "spitz japonês"], min: 5, max: 10 },
  { keys: ["bulldog ingles", "bulldog inglês"], min: 18, max: 29 },
  { keys: ["labrador"], min: 25, max: 36 },
  { keys: ["golden"], min: 25, max: 34 },
  { keys: ["husky"], min: 16, max: 27 },
  { keys: ["pastor alemao", "pastor alemão"], min: 22, max: 40 },
  { keys: ["rottweiler"], min: 35, max: 60 },
  { keys: ["doberman"], min: 27, max: 45 },
  { keys: ["boxer"], min: 24, max: 32 },
  { keys: ["collie"], min: 18, max: 34 },
  { keys: ["setter"], min: 20, max: 32 },
  { keys: ["pointer"], min: 20, max: 34 },
  { keys: ["dalmata", "dálmata"], min: 16, max: 32 },
  { keys: ["akita"], min: 30, max: 45 },
  { keys: ["chow chow"], min: 20, max: 32 },
  { keys: ["weimaraner"], min: 25, max: 40 },
  { keys: ["pit bull"], min: 14, max: 27 },
  { keys: ["bernese"], min: 35, max: 55 },
  { keys: ["fila brasileiro", "fila"], min: 40, max: 55 },
  { keys: ["mastim", "dogue alemao", "dogue alemão", "great dane"], min: 45, max: 90 },
  { keys: ["sao bernardo", "são bernardo"], min: 55, max: 90 },
  { keys: ["maine coon"], min: 5, max: 11, species: "cat" },
  { keys: ["ragdoll"], min: 4.5, max: 9, species: "cat" },
  { keys: ["persa"], min: 3, max: 5.5, species: "cat" },
  { keys: ["siames", "siamês"], min: 3, max: 5, species: "cat" },
  { keys: ["sphynx"], min: 3, max: 5.5, species: "cat" },
  { keys: ["british shorthair", "british"], min: 4, max: 8, species: "cat" },
  { keys: ["bengal"], min: 4, max: 7, species: "cat" },
  { keys: ["noruegues", "norueguês", "norwegian"], min: 4.5, max: 9, species: "cat" },
  { keys: ["angora"], min: 2.5, max: 5, species: "cat" },
];

export function findBreedWeightRange(pet: Pet): BreedWeightRange | null {
  const text = normalizeText(pet.breed);
  if (!text || /srd|sem raca|vira ?lata|mestic|indefinid/.test(text)) {
    if (pet.species === "cat") return { min: 3, max: 5.5, isGenericCat: true };
    return null;
  }
  for (const entry of BREED_WEIGHT_TABLE) {
    if (entry.species && entry.species !== pet.species) continue;
    if (!entry.species && pet.species === "cat") continue; // entradas de cão não valem para gato
    if (entry.keys.some((k) => text.includes(k))) return entry;
  }
  if (pet.species === "cat") return { min: 3, max: 5.5, isGenericCat: true };
  return null;
}

// Considera-se "adulto" para fins de comparação de peso a partir desta idade (meses);
// raças pequenas maturam mais rápido, mas usamos um corte conservador único.
export const ADULT_MIN_MONTHS = 12;
