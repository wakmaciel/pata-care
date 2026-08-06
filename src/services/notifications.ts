/* ── Notificação do sistema, o encanamento ──────────────────────────────────
   Só o essencial para pedir permissão e exibir um aviso agora. Quem decide o
   que avisar e quando é o Web Push (`services/push.ts` + `worker/`).

   Até a v2.1 existia aqui um segundo canal, que varria os registros de 15 em 15
   minutos e avisava ao abrir o app. Ele saiu: o iOS congela o app assim que
   você sai dele, então aquele canal só conseguia avisar de coisas que já tinham
   passado — e ainda repetia, dose por dose, o que o push já havia anunciado na
   hora certa. */

export function notificationsSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

export function showSystemNotification(
  title: string,
  options?: NotificationOptions & { data?: { url: string } }
): Promise<boolean> {
  if (notificationPermission() !== "granted") return Promise.resolve(false);
  const payload = Object.assign(
    {
      body: "Abra o PataCare para ver os lembretes.",
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      tag: "patacare-reminder",
      data: { url: "#/lembretes" },
    },
    options || {}
  );
  return navigator.serviceWorker.ready
    .then((registration) => {
      registration.showNotification(title, payload);
      return true;
    })
    .catch(() => {
      try {
        new Notification(title, payload);
        return true;
      } catch {
        return false;
      }
    });
}
