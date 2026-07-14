import { useState } from "react";
import { motion } from "framer-motion";
import { calcAge, daysBetween, fmtDayMonth, todayISO } from "@/lib/dates";
import { careRecordsFor, petBadgeStatus, petsSorted } from "@/domain/care";
import { isDosePending } from "@/domain/medications";
import { DAILY_TIPS } from "@/domain/tips";
import { useDataStore } from "@/store/data";
import { useTutorStore } from "@/store/tutor";
import { useUiStore } from "@/store/ui";
import { navigate } from "@/router";
import { Icon } from "@/components/ui/Icon";
import { PetFormSheet } from "@/features/forms/PetFormSheet";
import { PetAvatar, breedLabel, sexLabel } from "@/features/pets/PetAvatar";
import type { MedicationRecord, Pet } from "@/types";

function HomePetCard({ pet }: { pet: Pet }) {
  const { pets, records } = useDataStore();
  const badge = petBadgeStatus(records, pets, pet.id);

  let dot: React.ReactNode = null;
  let chip: React.ReactNode = null;
  if (badge) {
    if (badge.status === "overdue") {
      dot = (
        <span className="hpet-dot overdue">
          <Icon name="alert" />
        </span>
      );
      chip = (
        <span className="chip alert">
          {badge.count && badge.count > 1 ? badge.count + " atrasados" : "Atrasado"}
        </span>
      );
    } else if (badge.status === "soon") {
      dot = (
        <span className="hpet-dot soon">
          <Icon name="calendar" />
        </span>
      );
      chip = <span className="chip soon">Em breve</span>;
    } else {
      dot = (
        <span className="hpet-dot ok">
          <Icon name="check" />
        </span>
      );
      chip = (
        <span className="chip ok">
          <Icon name="check" /> Tudo certo
        </span>
      );
    }
  }

  return (
    <div className="hpet-card" onClick={() => navigate(`#/pet/${pet.id}/overview`)}>
      <div className="hpet-photo-wrap">
        <PetAvatar pet={pet} className="hpet-photo" />
        {dot}
      </div>
      <h3>{pet.name}</h3>
      <div className="meta">
        {breedLabel(pet)} · {sexLabel(pet)}
        {pet.birthDate && (
          <>
            <br />
            {calcAge(pet.birthDate)}
          </>
        )}
      </div>
      {chip}
    </div>
  );
}

function WeekSummary() {
  const { pets, records } = useDataStore();
  const today = todayISO();
  let apptToday = 0,
    apptTomorrow = 0,
    apptWeek = 0,
    overdueCount = 0;
  let nextVacDate: string | null = null,
    vacSoon = 0;
  pets.forEach((pet) => {
    careRecordsFor(records, pets, pet.id).forEach((rec) => {
      if (!rec.nextDate) return;
      const d = daysBetween(today, rec.nextDate);
      if (d < 0) {
        overdueCount++;
        return;
      }
      if (d <= 7) {
        apptWeek++;
        if (d === 0) apptToday++;
        else if (d === 1) apptTomorrow++;
      }
      if (rec.category === "vaccine") {
        if (!nextVacDate || rec.nextDate < nextVacDate) nextVacDate = rec.nextDate;
        if (d <= 30) vacSoon++;
      }
    });
  });
  let dosesPending = 0;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  records
    .filter((r): r is MedicationRecord => r.category === "medication")
    .forEach((med) => {
      (med.doses || []).forEach((dose) => {
        if (isDosePending(dose) && new Date(dose.scheduledAt) <= endOfToday) dosesPending++;
      });
    });

  const apptParts: string[] = [];
  if (apptToday) apptParts.push(apptToday + " hoje");
  if (apptTomorrow) apptParts.push(apptTomorrow + " amanhã");
  const apptSub =
    overdueCount > 0 ? (
      <span style={{ color: "var(--red)", fontWeight: 700 }}>
        {overdueCount} atrasado{overdueCount > 1 ? "s" : ""}
      </span>
    ) : apptParts.length ? (
      apptParts.join(" · ")
    ) : (
      "Nenhum esta semana"
    );

  const vacSub = nextVacDate ? "Próxima: " + fmtDayMonth(nextVacDate) : "Nenhuma prevista";
  const medSub =
    dosesPending === 0 ? "Tudo em dia! ✅" : "Pendente" + (dosesPending > 1 ? "s" : "") + " hoje";

  return (
    <div className="week-card">
      <div className="week-head">
        <h3>Resumo da semana</h3>
        <span className="week-pill">Próximos 7 dias</span>
      </div>
      <div className="week-grid">
        <div className="wstat">
          <div className="ic">
            <Icon name="calendar" />
          </div>
          <div className="num">{apptWeek}</div>
          <div className="lbl">Compromisso{apptWeek === 1 ? "" : "s"}</div>
          <div className="sub">{apptSub}</div>
        </div>
        <div className="wstat">
          <div className="ic">
            <Icon name="syringe" />
          </div>
          <div className="num">{vacSoon}</div>
          <div className="lbl">Vacina{vacSoon === 1 ? "" : "s"}</div>
          <div className="sub">{vacSub}</div>
        </div>
        <div className="wstat">
          <div className="ic">
            <Icon name="medkit" />
          </div>
          <div className="num">{dosesPending}</div>
          <div className="lbl">Medicamento{dosesPending === 1 ? "" : "s"}</div>
          <div className="sub">{medSub}</div>
        </div>
      </div>
    </div>
  );
}

function DailyTip() {
  const [offset, setOffset] = useState(0);
  const dayIndex = Math.floor(Date.now() / 86400000);
  const tip = DAILY_TIPS[(dayIndex + offset) % DAILY_TIPS.length];
  return (
    <div
      className="tip-card"
      role="button"
      aria-label="Dica do dia — toque para ver outra dica"
      onClick={() => setOffset((o) => o + 1)}
    >
      <div className="ic">
        <Icon name="bulb" />
      </div>
      <div className="tx">
        <div className="t">Dica do dia</div>
        <div className="s">{tip}</div>
      </div>
      <span className="chev">
        <Icon name="chevronRight" />
      </span>
    </div>
  );
}

export function HomeView() {
  const { pets } = useDataStore();
  const tutor = useTutorStore((s) => s.tutor);
  const { openSheet } = useUiStore();
  const sorted = petsSorted(pets);
  const firstName = tutor?.name ? tutor.name.trim().split(/\s+/)[0] : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="home-hero">
        <div className="hero-txt">
          <div className="hello">Olá{firstName ? ", " + firstName : ""}! 👋</div>
          <h2>Que bom te ver aqui!</h2>
          <p className="sub">
            Acompanhe a saúde, a rotina e o bem-estar dos seus pets em um só lugar.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hh">
            <Icon name="heart" />
          </span>
          <span className="hp">
            <Icon name="paw" />
          </span>
        </div>
      </div>

      <div className="sec-head">
        <h3>Meus pets</h3>
        {sorted.length > 0 && (
          <button className="sec-link" onClick={() => navigate("#/pets")}>
            Ver todos <Icon name="chevronRight" />
          </button>
        )}
      </div>

      <div className="hpet-strip">
        {sorted.map((pet) => (
          <HomePetCard key={pet.id} pet={pet} />
        ))}
        <div
          className="hpet-card hpet-add"
          role="button"
          onClick={() => openSheet(<PetFormSheet existing={null} />)}
        >
          <div className="plus-circ">
            <Icon name="plus" />
          </div>
          <div className="lbl">
            Adicionar
            <br />
            pet
          </div>
        </div>
      </div>

      {sorted.length > 0 && <WeekSummary />}
      <DailyTip />
    </motion.div>
  );
}
