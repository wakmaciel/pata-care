import { vaccineTitle, vaccineTypeLabel, VACCINE_PROTOCOLS } from "@/domain/vaccines";
import type { AnyRecord } from "@/types";
import type { IconName } from "@/components/ui/Icon";

export interface CategoryConfig {
  label: string;
  title: string;
  icon: IconName;
  hasPhoto: boolean;
  primaryKey?: string;
  primaryLabel?: string;
  placeholder?: string;
  emptyTitle: string;
  emptyText: string;
  getTitle?: (rec: AnyRecord) => string;
  getBadge?: (rec: AnyRecord) => string | null;
}

const CFG: Partial<Record<string, CategoryConfig>> = {
  vaccine: {
    label: "vacina",
    title: "Vacina",
    icon: "syringe",
    hasPhoto: true,
    emptyTitle: "Nenhuma vacina registrada",
    emptyText: "Toque no + para registrar a primeira vacina, com data e foto da etiqueta.",
    getTitle: (rec) => (rec.category === "vaccine" ? vaccineTitle(rec) : "Vacina"),
    getBadge: (rec) => {
      if (rec.category !== "vaccine") return null;
      if (!rec.vaccineType || rec.vaccineType === "outra" || !rec.doseNumber) return null;
      if (rec.isBooster) return "Reforço anual";
      const protocol = VACCINE_PROTOCOLS[rec.vaccineType];
      if (!protocol) return null;
      return protocol.initialDoses === 1
        ? "Dose única"
        : `Dose ${rec.doseNumber} de ${protocol.initialDoses}`;
    },
  },
  antiparasitic: {
    label: "aplicação",
    title: "Antipulgas/Carrapatos",
    icon: "bug",
    primaryKey: "product",
    primaryLabel: "Produto aplicado",
    placeholder: "Ex: Bravecto, Simparic, NexGard...",
    hasPhoto: false,
    emptyTitle: "Nada registrado ainda",
    emptyText: "Registre aqui os antipulgas e carrapaticidas aplicados no seu pet.",
  },
  dewormer: {
    label: "aplicação",
    title: "Vermífugo",
    icon: "pill",
    primaryKey: "product",
    primaryLabel: "Vermífugo aplicado",
    placeholder: "Ex: Drontal, Vermivet...",
    hasPhoto: false,
    emptyTitle: "Nada registrado ainda",
    emptyText: "Registre aqui os vermífugos aplicados no seu pet.",
  },
  exam: {
    label: "exame",
    title: "Exame",
    icon: "clipboard",
    hasPhoto: false,
    emptyTitle: "Nenhum exame registrado",
    emptyText:
      "Toque no + para registrar um exame (raio-X, ultrassom, sangue...) e anexar os resultados (imagens ou PDF).",
    getTitle: (rec) => (rec.category === "exam" && rec.examType) || "Exame",
    getBadge: (rec) =>
      rec.category === "exam" && rec.vet
        ? rec.crm
          ? `${rec.vet} · CRMV ${rec.crm}`
          : rec.vet
        : null,
  },
  surgery: {
    label: "cirurgia",
    title: "Cirurgia",
    icon: "scissors",
    hasPhoto: false,
    emptyTitle: "Nenhuma cirurgia registrada",
    emptyText:
      "Toque no + para registrar uma cirurgia (castração, remoção de nódulo...) e anexar fotos ou laudos.",
    getTitle: (rec) => (rec.category === "surgery" && rec.surgeryType) || "Cirurgia",
    getBadge: (rec) =>
      rec.category === "surgery" && rec.vet
        ? rec.crm
          ? `${rec.vet} · CRMV ${rec.crm}`
          : rec.vet
        : null,
  },
  consultation: {
    label: "consulta",
    title: "Consulta",
    icon: "stethoscope",
    hasPhoto: false,
    emptyTitle: "Nenhuma consulta registrada",
    emptyText: "Toque no + para registrar uma consulta com o médico-veterinário.",
    getTitle: (rec) =>
      rec.category === "consultation" && rec.vet ? `Consulta — ${rec.vet}` : "Consulta",
    getBadge: (rec) => {
      if (rec.category !== "consultation") return null;
      const crmTxt = rec.crm ? `CRMV ${rec.crm}` : null;
      return [crmTxt, rec.reason].filter(Boolean).join(" · ") || null;
    },
  },
};

export function categoryConfig(category: string): CategoryConfig {
  const cfg = CFG[category];
  if (!cfg) throw new Error("Categoria sem configuração: " + category);
  return cfg;
}

export function recordDisplayTitle(rec: AnyRecord, cfg: CategoryConfig): string {
  if (cfg.getTitle) return cfg.getTitle(rec);
  const raw = cfg.primaryKey
    ? (rec as unknown as Record<string, unknown>)[cfg.primaryKey]
    : undefined;
  return (typeof raw === "string" && raw) || cfg.title;
}

export { vaccineTypeLabel };
