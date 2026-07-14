import { motion } from "framer-motion";
import { calcAge } from "@/lib/dates";
import { petBadgeStatus, petsSorted } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { navigate } from "@/router";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PetFormSheet } from "@/features/forms/PetFormSheet";
import { PetAvatar, breedLabel, sexLabel } from "@/features/pets/PetAvatar";
import type { Pet } from "@/types";

function PetListCard({ pet }: { pet: Pet }) {
  const { pets, records } = useDataStore();
  const badge = petBadgeStatus(records, pets, pet.id);
  let chip: React.ReactNode = null;
  if (badge) {
    if (badge.status === "overdue")
      chip = (
        <span className="chip alert">
          <Icon name="alert" />{" "}
          {badge.count && badge.count > 1 ? badge.count + " atrasados" : "Atrasado"}
        </span>
      );
    else if (badge.status === "soon")
      chip = (
        <span className="chip soon">
          <Icon name="calendar" /> Em breve
        </span>
      );
    else
      chip = (
        <span className="chip ok">
          <Icon name="check" /> Tudo certo
        </span>
      );
  }
  return (
    <div className="pet-card" onClick={() => navigate(`#/pet/${pet.id}/overview`)}>
      <PetAvatar pet={pet} />
      <div className="pet-card-info">
        <h3>{pet.name}</h3>
        <div className="meta">
          {breedLabel(pet)} · {sexLabel(pet)}
          {pet.birthDate ? " · " + calcAge(pet.birthDate) : ""}
        </div>
        <div className="pet-card-badges">{chip}</div>
      </div>
      <span className="chevron">
        <Icon name="chevronRight" />
      </span>
    </div>
  );
}

export function AllPetsView() {
  const { pets } = useDataStore();
  const { openSheet } = useUiStore();
  const sorted = petsSorted(pets);

  if (sorted.length === 0) {
    return (
      <div className="empty-state">
        <div className="paw-stack">
          <img
            src="icons/favicon-192.png"
            alt=""
            style={{
              width: 64,
              height: 64,
              opacity: 0.9,
              boxShadow: "var(--shadow-sm)",
              borderRadius: "50%",
            }}
          />
        </div>
        <h3>Nenhum pet por aqui ainda</h3>
        <p>
          Cadastre seu primeiro companheiro para começar a registrar vacinas, antipulgas, vermífugos
          e muito mais.
        </p>
        <Button onClick={() => openSheet(<PetFormSheet existing={null} />)}>
          <Icon name="plus" /> Adicionar pet
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {sorted.map((pet) => (
        <PetListCard key={pet.id} pet={pet} />
      ))}
    </motion.div>
  );
}
