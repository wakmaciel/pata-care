import { useSyncExternalStore } from "react";

export type Route =
  | { view: "home" }
  | { view: "pets" }
  | { view: "reminders" }
  | { view: "settings" }
  | { view: "pet"; petId: string; tab: string };

export function parseHash(): Route {
  const h = (location.hash || "#/").replace(/^#\/?/, "");
  const parts = h.split("/").filter(Boolean);
  if (parts.length === 0) return { view: "home" };
  if (parts[0] === "pet" && parts[1])
    return { view: "pet", petId: parts[1], tab: parts[2] || "overview" };
  if (parts[0] === "pets") return { view: "pets" };
  if (parts[0] === "lembretes") return { view: "reminders" };
  if (parts[0] === "ajustes") return { view: "settings" };
  return { view: "home" };
}

export function navigate(hash: string) {
  if (location.hash !== hash) location.hash = hash;
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export function useHashRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash);
  void hash;
  return parseHash();
}
