# Notificações com o app fechado — estudo

Objetivo: o PataCare avisar a hora do remédio **mesmo com o app em segundo plano ou
totalmente fechado**, no iPhone.

Resumo da conclusão: **não existe jeito de fazer isso só com o app.** Ou o alarme é
agendado por outro app do iPhone (Calendário), ou é preciso um servidorzinho mandando Web
Push. Não há terceira opção. Os dois caminhos estão implementados; este documento explica
por que não há um terceiro.

---

## 1. Por que o que temos hoje não basta

`src/services/notifications.ts` roda um `setTimeout` de 15 em 15 minutos dentro da página
(`scheduleNotificationCheck`). Isso funciona **enquanto a aba/PWA está viva na frente**.

- **App em segundo plano no iOS:** o WebKit congela o JavaScript da página poucos segundos
  depois de você sair do app. O `setTimeout` não dispara — ele fica pendurado e só volta a
  correr quando você reabre o app.
- **App fechado:** a página nem existe mais.
- **Service worker:** não ajuda. Ele não é um processo que fica de pé; o sistema acorda o SW
  só para atender a um evento (`fetch`, `push`, `notificationclick`) e o mata em ~30 s de
  ociosidade. SW não tem timer próprio.

Ou seja: hoje o app só consegue avisar **na hora em que você abre**, com o efeito de
"notificação atrasada" que você já deve ter visto.

## 2. APIs que parecem resolver e não resolvem

| API | Situação | Serve? |
|---|---|---|
| `showTrigger` / `TimestampTrigger` (Notification Triggers) | Experimento do Chrome; o Google **encerrou o desenvolvimento**. Nunca existiu no Safari. | ❌ |
| Periodic Background Sync | Só Chromium, com heurística de engajamento. Não existe no iOS. | ❌ |
| Background Sync (`sync`) | Dispara ao voltar a conexão, não em horário marcado. | ❌ |
| Alarms / Background Fetch | Não existem no Safari. | ❌ |
| **Web Push (Push API)** | **Funciona no iOS 16.4+**, para web app **adicionado à Tela de Início**. | ✅ (exige servidor) |

Detalhes importantes do Web Push no iOS:

- Só funciona no **web app instalado na Tela de Início** — em aba do Safari, `PushManager`
  nem existe. (No iOS 26 todo site adicionado à Tela de Início já abre como web app por
  padrão, o que ajuda.)
- A permissão precisa ser pedida **dentro de um toque do usuário** (um botão), não no load.
- É entregue pela APNs da Apple: chega com o app fechado, celular bloqueado, etc.
- **Todo push precisa virar uma notificação visível.** Se o service worker receber pushes e
  não mostrar nada várias vezes, o Safari pode cancelar a inscrição.
- O Safari 18.4 trouxe também o *Declarative Web Push* (notificação montada a partir do JSON,
  sem service worker) — mais simples, mas **continua precisando de alguém para enviar**.

O nó é sempre o mesmo: push é *empurrado por um servidor*. O GitHub Pages é hospedagem
estática — ele serve arquivos, não roda código em horário marcado. Alguém precisa acordar às
02:50 da manhã e chamar a APNs.

## 3. As opções reais

### Opção A — Calendário (.ics) — é o que está no app agora

Cada dose vira um evento com `VALARM`. Quem agenda e dispara o alarme é o **iPhone**, não o
PataCare. Por isso toca com o app fechado, sem internet, sem servidor, sem conta.

- ✅ Zero infra, zero custo, zero dado saindo do aparelho, já funciona.
- ⚠️ O tutor precisa abrir o `.ics` uma vez por medicamento; se remarcar as doses, precisa
  gerar de novo (os eventos antigos ficam).

**Esta é a melhor relação custo/benefício e continua sendo a base.**

### Opção B — Web Push com um Worker na Cloudflare  ← **implementada**

> Está em [`worker/`](../worker/README.md). Falta só publicar e preencher as duas constantes
> no topo de [`src/services/push.ts`](../src/services/push.ts) — o passo a passo está no
> README do Worker.


Um Worker (gratuito) guarda a inscrição de push e uma lista de horários, e um Cron Trigger
roda **de minuto em minuto** disparando os pushes devidos.

Truque de privacidade que vale a pena: mandar **push sem payload**. O protocolo permite um
push de corpo vazio — aí não é preciso nem implementar a criptografia `aes128gcm`, só assinar
o cabeçalho VAPID. O servidor não sabe o nome do pet nem do remédio: ele só sabe *"cutuque
este aparelho às 18:50"*. Quem monta o texto da notificação é o service worker, lendo o
IndexedDB local.

```
  App (iPhone)                    Worker (Cloudflare)              APNs
  ────────────                    ───────────────────              ────
  1. subscribe()  ───────────────▶ guarda {endpoint, keys} no KV
  2. ao salvar remédio:
     manda só os timestamps ─────▶ guarda [1786...., 1786....]
                                   (nenhum nome, nenhum dado do pet)

  3.               cron * * * * *  ▶ vê quais venceram
                                     assina JWT VAPID (WebCrypto)
                                     POST endpoint, corpo vazio ──▶ ──▶ 📱
  4. SW recebe 'push' (sem dados)
     lê o IndexedDB, acha a dose
     showNotification("💊 ...")
```

O que precisa ser feito:

| Onde | O quê |
|---|---|
| `public/sw.js` | handler `push` → consulta IndexedDB → `showNotification` (com texto genérico de fallback, para nunca ficar sem mostrar nada) |
| `src/services/push.ts` (novo) | `subscribe()` com a chave VAPID pública, envio dos horários ao Worker quando os medicamentos mudam |
| `SettingsView` | botão "Ativar avisos com o app fechado" (precisa do toque do usuário) + aviso de que só funciona instalado na Tela de Início |
| `worker/` (novo) | ~120 linhas: `fetch` (registrar/atualizar) + `scheduled` (cron) + assinatura VAPID via WebCrypto; KV para guardar |

Custo: **R$ 0** no plano free da Cloudflare (100 mil requisições/dia, cron de 1 minuto,
KV incluso). Precisa de uma conta Cloudflare e de um par de chaves VAPID.

Limitações honestas:
- Só funciona se o app estiver **instalado na Tela de Início**. Em aba do Safari, não.
- Se o usuário desinstalar/reinstalar, a inscrição muda e precisa ser refeita.
- Passa a existir um componente que pode cair — e o app deixa de ser 100 % offline-first.

### Opção C — GitHub Actions como cron

Tentador (o repositório já está lá), mas **não serve para remédio**: o cron do Actions tem
granularidade mínima de 5 minutos e, na prática, atrasa de 5 a 20 minutos em horário de pico.
Além disso, guardar inscrições de push em arquivo no repositório é ruim. ❌

### Opção D — Firebase / Supabase / OneSignal

Funcionam, mas trazem SDK, conta, política de privacidade de terceiro e (no caso do Firebase
com Cloud Scheduler) plano pago. Para um app de um pet, é matar mosquito com canhão.

---

## 4. O que ficou no app

As duas coisas convivem, e é bom que convivam — uma não depende de rede, a outra é mais
precisa:

| Caminho | Onde | Depende de |
|---|---|---|
| Alarme do Calendário (.ics) | `src/services/calendar.ts` | nada |
| Web Push | `src/services/push.ts` + `worker/` | Worker publicado + app na Tela de Início |
| Aviso ao abrir o app | `src/services/notifications.ts` | app em primeiro plano |

## 5. Doses atrasadas que passavam batido

`runNotificationCheck` só avisava de uma dose na janela de `15 min antes` até `24 h depois`.
Se o app ficasse dois dias sem ser aberto, as doses daquele intervalo **nunca** geravam aviso
nenhum — nem ao reabrir.

Agora as doses que passaram dessa janela entram num resumo diário único:

> **Doses atrasadas** — 5 doses sem marcação: Amoxicilina (Mel), Dipirona (Mel).

Um por dia enquanto houver pendência, e ele some sozinho quando as doses forem marcadas como
aplicadas ou não aplicadas. O aviso pontual de cada dose continua igual.

---

### Fontes

- [Meet Declarative Web Push — WebKit](https://webkit.org/blog/16535/meet-declarative-web-push/)
- [WebKit Features in Safari 18.4](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/)
- [iOS special requirements for web push notifications — Pushpad](https://pushpad.xyz/blog/ios-special-requirements-for-web-push-notifications)
- [Notification Triggers API — Chrome for Developers](https://developer.chrome.com/docs/web-platform/notification-triggers)
- [Introducing Cron Triggers for Cloudflare Workers](https://blog.cloudflare.com/introducing-cron-triggers-for-cloudflare-workers/)
- [Cloudflare Workers Cron Triggers: limits and minimum interval](https://crontap.com/blog/cloudflare-workers-cron-minute-limit)
