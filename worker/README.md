# PataCare Push — Worker da Cloudflare

Acorda o iPhone na hora da dose, **com o app fechado**. É a única coisa deste projeto que
roda fora do aparelho.

## O que ele sabe (e o que não sabe)

O Worker guarda **só** a inscrição de push do aparelho e uma lista de instantes:

```json
{ "endpoint": "https://web.push.apple.com/...", "schedule": [1786012200000, 1786041000000] }
```

Nome do pet, nome do remédio, dose, nada disso sai do aparelho. O push é enviado **sem
corpo** — o Worker só diz "acorde agora". Quem descobre de qual dose se trata e escreve o
texto da notificação é o service worker do app (`public/sw.js`), lendo o IndexedDB local.

Efeito colateral prático: como não há corpo, não é preciso implementar a criptografia
`aes128gcm` do Web Push. Basta assinar o cabeçalho VAPID, o que cabe em WebCrypto puro.

## Publicar pelo portal (sem instalar nada)

Dá para fazer tudo pelo dash da Cloudflare. Neste caminho o `wrangler.toml` **não é usado** —
o cron e o KV são configurados na interface —, então não é preciso o id do namespace.

**1. Gere as chaves VAPID.** Abra o console do navegador (F12 → Console) em qualquer página e
cole:

```js
const kp = await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"}, true, ["sign","verify"]);
const raw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
const b64 = b => btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
console.log("PUBLIC :", b64(raw));
console.log("PRIVATE:", jwk.d);
```

Guarde as duas. A **privada** só vai para a Cloudflare; a **pública** vai para os dois lados.

**2. Crie o namespace KV.** *Armazenamento e bancos de dados → Workers KV → Criar*. O nome é
livre (ex.: `pata-care`). Não adicione pares na aba "Pares de KV" — quem escreve lá é o Worker.

**3. Crie o Worker.** *Computação → Workers e Pages → Criar → Worker*, nome `patacare-push`, e
implante o "Hello World" que vem pronto. Depois entre em **Editar código**, apague tudo, cole o
conteúdo de [`src/index.js`](src/index.js) e implante de novo.

**4. Ligue o KV ao Worker.** No Worker, *Configurações → Vinculações (Bindings) → Adicionar →
Workers KV*. O **nome da variável precisa ser exatamente `PUSH`** (é o `env.PUSH` do código) e o
namespace é o do passo 2. O nome do namespace não importa; o do binding, sim.

**5. Adicione os segredos.** *Configurações → Variáveis e segredos → Adicionar*, tipo **Secret**,
um para cada: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:seu@email.com`) e
`ALLOWED_ORIGIN` (veja a observação sobre origem mais abaixo).

**6. Ligue o cron.** *Configurações → Gatilhos (Triggers) → Cron Triggers → Adicionar*, com a
expressão `* * * * *` (de minuto em minuto, o menor intervalo que a Cloudflare aceita).

**7. Pegue a URL.** Está na página do Worker: `https://patacare-push.SEU-SUBDOMINIO.workers.dev`.
É ela que vai em `PUSH_WORKER_URL`. Siga para o passo 5 da seção seguinte.

## Publicar pela linha de comando (uma vez)

```bash
cd worker
npm install
npx wrangler login
```

**1. Crie o namespace do KV** e cole o `id` devolvido em `wrangler.toml`:

```bash
npx wrangler kv namespace create PUSH
```

**2. Gere o par de chaves VAPID:**

```bash
npx web-push generate-vapid-keys
```

**3. Registre os segredos** (o `wrangler` pergunta o valor de cada um):

```bash
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put VAPID_SUBJECT
npx wrangler secret put ALLOWED_ORIGIN
```

- `VAPID_SUBJECT` → `mailto:seu@email.com`
- `ALLOWED_ORIGIN` → `https://wakmaciel.github.io`

  É a **origem** do app, não a URL completa: sem o `/pata-care/` e sem barra no fim. O
  navegador manda só o esquema + host no cabeçalho `Origin`, e é com ele que o Worker compara.

**4. Publique:**

```bash
npx wrangler deploy
```

O comando imprime a URL, algo como `https://patacare-push.SEU-SUBDOMINIO.workers.dev`.

**5. Ligue o app ao Worker** — em [`src/services/push.ts`](../src/services/push.ts), preencha
as duas constantes do topo com a URL do passo 4 e a chave **pública** do passo 2:

```ts
const PUSH_WORKER_URL = "https://patacare-push.SEU-SUBDOMINIO.workers.dev";
const VAPID_PUBLIC_KEY = "BI0U03kdkk6w...";
```

Enquanto elas estiverem vazias, `isPushConfigured()` devolve `false` e o app nem mostra a
opção nos Ajustes — mesmo padrão do Google Drive.

**6. No iPhone:** abra o app **instalado na Tela de Início** (em aba do Safari o iOS não
expõe a Push API) e ligue *Ajustes → Avisos com o app fechado*.

## Como funciona

```
  App (iPhone)                    Worker                          APNs
  ────────────                    ──────                          ────
  ao ligar a opção:
    pushManager.subscribe()
    POST /sync  ──────────────────▶ KV["sub:<hash>"] = {endpoint, schedule}
  a cada mudança nos remédios:
    POST /sync  ──────────────────▶ atualiza a agenda

                 cron * * * * *   ▶ quais horários venceram?
                                    assina JWT VAPID (ES256/WebCrypto)
                                    POST endpoint, corpo vazio ───▶ ──▶ 📱

  service worker recebe 'push'
    lê o IndexedDB, acha a dose
    showNotification("💊 ...")
```

Detalhes que importam:

- **Janela de disparo de 10 minutos.** Se o Worker ficar fora do ar (ou o cron atrasar), uma
  dose vencida há mais de 10 min é descartada em vez de gerar um aviso fora de hora.
- **A agenda se poda sozinha.** Todo horário `<= agora` sai do KV depois da varredura — sem
  isso o mesmo push sairia a cada minuto.
- **Inscrição morta.** Se o push service responder 404/410 (app desinstalado), o registro é
  apagado do KV.
- **Toda notificação é visível.** O iOS cancela a inscrição de quem recebe push e não mostra
  nada; por isso o `sw.js` sempre exibe algo, com um texto genérico se não achar a dose.

## Custo

Plano free da Cloudflare: 100 mil requisições/dia, Cron Triggers de 1 minuto e KV inclusos.
O cron consome 1.440 execuções/dia. Para uso pessoal, **R$ 0**.

## Manutenção

```bash
npx wrangler tail          # logs ao vivo
npx wrangler kv key list --binding PUSH
```
