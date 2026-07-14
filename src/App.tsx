import { useEffect, useState, type ReactNode } from "react";
import { petBadgeStatus } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useTutorStore } from "@/store/tutor";
import { useUiStore } from "@/store/ui";
import { navigate, useHashRoute, type Route } from "@/router";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/Button";
import { OverlayHost } from "@/components/ui/OverlayHost";
import { HomeView } from "@/features/home/HomeView";
import { AllPetsView } from "@/features/pets/AllPetsView";
import { PetDetailView } from "@/features/pet-detail/PetDetailView";
import { RemindersView } from "@/features/reminders/RemindersView";
import { SettingsView } from "@/features/settings/SettingsView";
import { PetFormSheet } from "@/features/forms/PetFormSheet";
import { recordFormSheetFor } from "@/features/forms/recordFormFor";

function TopBar({ route }: { route: Route }) {
  const { pets, records } = useDataStore();
  const tutor = useTutorStore((s) => s.tutor);
  const { openSheet } = useUiStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cls = "topbar" + (scrolled ? " scrolled" : "");

  if (route.view === "pet") {
    const pet = pets.find((p) => p.id === route.petId);
    return (
      <div className={cls}>
        <div className="topbar-actions">
          <IconButton aria-label="Voltar" onClick={() => navigate("#/")}>
            <Icon name="chevronLeft" />
          </IconButton>
        </div>
        <h1>{pet ? pet.name : "Pet"}</h1>
        <div className="topbar-actions">
          <IconButton
            aria-label="Editar pet"
            onClick={() => pet && openSheet(<PetFormSheet existing={pet} />)}
          >
            <Icon name="edit" />
          </IconButton>
        </div>
      </div>
    );
  }

  if (route.view === "pets") {
    return (
      <div className={cls}>
        <div className="topbar-actions">
          <IconButton aria-label="Voltar" onClick={() => navigate("#/")}>
            <Icon name="chevronLeft" />
          </IconButton>
        </div>
        <h1>Meus pets</h1>
        <div className="topbar-actions" />
      </div>
    );
  }

  if (route.view === "home") {
    const hasOverdue = pets.some((p) => {
      const b = petBadgeStatus(records, pets, p.id);
      return b && b.status === "overdue";
    });
    return (
      <div className={cls}>
        <div className="brand">
          <span className="logo-dot">
            <img src="icons/favicon-192.png" alt="PataCare" />
          </span>
          <h1>Meus Pets</h1>
        </div>
        <div className="topbar-actions">
          <IconButton aria-label="Lembretes" onClick={() => navigate("#/lembretes")}>
            <Icon name="bell" />
            {hasOverdue && <span className="bell-dot" />}
          </IconButton>
          <IconButton
            className="avatar-btn"
            aria-label="Meu perfil"
            onClick={() => navigate("#/ajustes")}
          >
            {tutor?.photo ? <img src={tutor.photo} alt="Foto do tutor" /> : <Icon name="user" />}
          </IconButton>
        </div>
      </div>
    );
  }

  const titles: Record<string, string> = { reminders: "Lembretes", settings: "Ajustes" };
  return (
    <div className={cls}>
      <div className="brand">
        <span className="logo-dot">
          <img src="icons/favicon-192.png" alt="PataCare" />
        </span>
        <h1>{titles[route.view] || "PataCare"}</h1>
      </div>
      <div className="topbar-actions" />
    </div>
  );
}

function BottomBar({ route }: { route: Route }) {
  const { pets, records } = useDataStore();
  const overdueCount = pets.reduce((acc, p) => {
    const b = petBadgeStatus(records, pets, p.id);
    return acc + (b && b.status === "overdue" ? 1 : 0);
  }, 0);
  const items: { id: string; label: string; icon: IconName; hash: string; badge?: number }[] = [
    { id: "home", label: "Pets", icon: "home", hash: "#/" },
    { id: "reminders", label: "Lembretes", icon: "bell", hash: "#/lembretes", badge: overdueCount },
    { id: "settings", label: "Ajustes", icon: "settings", hash: "#/ajustes" },
  ];
  return (
    <div className="bottombar">
      {items.map((it) => {
        const active = route.view === it.id || (it.id === "home" && route.view === "pets");
        return (
          <button
            key={it.id}
            className={"nav-item" + (active ? " active" : "")}
            onClick={() => navigate(it.hash)}
          >
            <Icon name={it.icon} />
            <span>
              {it.label}
              {it.badge ? ` (${it.badge})` : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Fab({ route }: { route: Route }) {
  const { pets } = useDataStore();
  const { openSheet } = useUiStore();

  let action: (() => void) | null = null;
  if (route.view === "home" || route.view === "pets") {
    action = () => openSheet(<PetFormSheet existing={null} />);
  } else if (route.view === "pet") {
    const tab = route.tab || "overview";
    const pet = pets.find((p) => p.id === route.petId);
    if (pet) {
      const formTabs = [
        "vaccine",
        "medication",
        "exam",
        "surgery",
        "consultation",
        "antiparasitic",
        "dewormer",
        "weight",
      ];
      if (formTabs.includes(tab)) {
        action = () => openSheet(recordFormSheetFor(tab, pet, null));
      } else if (tab === "heat" && !pet.neutered) {
        action = () => openSheet(recordFormSheetFor("heat", pet, null));
      }
    }
  }

  if (!action) return null;
  return (
    <button className="fab" aria-label="Adicionar" onClick={action}>
      <Icon name="plus" />
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 12 }}>
      <div className="skeleton" style={{ height: 92, borderRadius: "var(--radius-lg)" }} />
      <div style={{ display: "flex", gap: 12 }}>
        <div
          className="skeleton"
          style={{ height: 190, flex: "0 0 152px", borderRadius: "var(--radius-lg)" }}
        />
        <div
          className="skeleton"
          style={{ height: 190, flex: "0 0 152px", borderRadius: "var(--radius-lg)" }}
        />
        <div
          className="skeleton"
          style={{ height: 190, flex: 1, borderRadius: "var(--radius-lg)" }}
        />
      </div>
      <div className="skeleton" style={{ height: 150, borderRadius: "var(--radius-lg)" }} />
      <div className="skeleton" style={{ height: 76, borderRadius: "var(--radius-lg)" }} />
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  const loaded = useDataStore((s) => s.loaded);

  const routeKey = route.view + (route.view === "pet" ? ":" + route.petId : "");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  let view: ReactNode;
  if (!loaded) view = <LoadingSkeleton />;
  else if (route.view === "home") view = <HomeView />;
  else if (route.view === "pet") view = <PetDetailView petId={route.petId} tab={route.tab} />;
  else if (route.view === "pets") view = <AllPetsView />;
  else if (route.view === "reminders") view = <RemindersView />;
  else view = <SettingsView />;

  return (
    <>
      <TopBar route={route} />
      <main className="view">{view}</main>
      <BottomBar route={route} />
      <Fab route={route} />
      <OverlayHost />
    </>
  );
}
