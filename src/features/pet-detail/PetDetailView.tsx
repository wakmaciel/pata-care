import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { calcAge } from "@/lib/dates";
import { useDataStore } from "@/store/data";
import { navigate } from "@/router";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PetAvatar, sexLabel } from "@/features/pets/PetAvatar";
import { OverviewTab } from "@/features/pet-detail/OverviewTab";
import { CareListTab } from "@/features/pet-detail/CareListTab";
import { MedicationTab } from "@/features/pet-detail/MedicationTab";
import { WeightTab } from "@/features/pet-detail/WeightTab";
import { HeatTab } from "@/features/pet-detail/HeatTab";

export const PET_TABS: { id: string; label: string; icon?: IconName; femaleOnly?: boolean }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "vaccine", label: "Vacinas", icon: "syringe" },
  { id: "consultation", label: "Consultas", icon: "stethoscope" },
  { id: "exam", label: "Exames", icon: "clipboard" },
  { id: "surgery", label: "Cirurgias", icon: "scissors" },
  { id: "medication", label: "Medicamentos", icon: "medkit" },
  { id: "antiparasitic", label: "Antipulgas/Carrapatos", icon: "bug" },
  { id: "dewormer", label: "Vermífugos", icon: "pill" },
  { id: "weight", label: "Peso", icon: "scale" },
  { id: "heat", label: "Cio", icon: "heart", femaleOnly: true },
];

export function PetDetailView({ petId, tab }: { petId: string; tab: string }) {
  const { pets } = useDataStore();
  const pet = pets.find((p) => p.id === petId);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
  }, [tab]);

  if (!pet) {
    return (
      <div className="empty-state">
        <h3>Pet não encontrado</h3>
        <p>Esse pet pode ter sido removido.</p>
        <Button onClick={() => navigate("#/")}>Voltar</Button>
      </div>
    );
  }

  const visibleTabs = PET_TABS.filter((t) => !t.femaleOnly || pet.sex === "F");

  let content: React.ReactNode;
  if (
    tab === "vaccine" ||
    tab === "antiparasitic" ||
    tab === "dewormer" ||
    tab === "exam" ||
    tab === "surgery" ||
    tab === "consultation"
  ) {
    content = <CareListTab pet={pet} category={tab} />;
  } else if (tab === "medication") {
    content = <MedicationTab pet={pet} />;
  } else if (tab === "weight") {
    content = <WeightTab pet={pet} />;
  } else if (tab === "heat" && pet.sex === "F") {
    content = <HeatTab pet={pet} />;
  } else {
    content = <OverviewTab pet={pet} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="pet-header">
        <PetAvatar pet={pet} />
        <h2>{pet.name}</h2>
        <div className="meta">
          {pet.breed || "Raça não informada"} · {sexLabel(pet)}
        </div>
        {pet.birthDate && <span className="age-pill">{calcAge(pet.birthDate)}</span>}
      </div>

      <div className="tabs">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            ref={t.id === tab ? activeTabRef : undefined}
            className={"tab" + (t.id === tab ? " active" : "")}
            onClick={() => navigate(`#/pet/${petId}/${t.id}`)}
          >
            {t.icon && <Icon name={t.icon} />}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div key={tab}>{content}</div>
    </motion.div>
  );
}
