/* ── PataCare Push — Cloudflare Worker ──────────────────────────────────────
   Acorda o iPhone na hora da dose, com o app fechado.

   Princípio de projeto: o Worker NÃO sabe nada sobre os pets. Ele guarda só a
   inscrição de push do aparelho e uma lista de instantes ("me cutuque às
   18:50"). O push é enviado SEM PAYLOAD — quem monta o texto da notificação é
   o service worker no aparelho, lendo o IndexedDB local. Como não há corpo,
   também não é preciso implementar a criptografia aes128gcm: basta assinar o
   cabeçalho VAPID.

   Segredos (via `wrangler secret put`):
     VAPID_PUBLIC_KEY   chave pública, base64url (a mesma que vai no app)
     VAPID_PRIVATE_KEY  chave privada, base64url
     VAPID_SUBJECT      "mailto:voce@exemplo.com"
     ALLOWED_ORIGIN     origem do app, ex. "https://wakmaciel.github.io" */

/** Só aceitamos endpoints dos serviços de push reais — evita encher o KV. */
const PUSH_HOSTS = [
  "web.push.apple.com",
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
];

/** Teto de agendamentos por aparelho (uns 3 meses de doses de 8 em 8 horas). */
const MAX_SCHEDULE = 500;

/** Janela de disparo: doses vencidas há menos disso ainda geram push. */
const FIRE_WINDOW_MS = 10 * 60000;

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    try {
      if (request.method === "POST" && url.pathname === "/sync") {
        return json(await handleSync(request, env), 200, cors);
      }
      if (request.method === "POST" && url.pathname === "/unsync") {
        return json(await handleUnsync(request, env), 200, cors);
      }
    } catch (err) {
      return json({ error: String(err && err.message ? err.message : err) }, 400, cors);
    }
    return json({ error: "not found" }, 404, cors);
  },

  /** Cron `* * * * *` — varre as inscrições e dispara o que venceu.
      Precisa ser aguardado: com `waitUntil` sem await o handler volta antes
      de os pushes saírem. */
  async scheduled(_event, env) {
    await fireDue(env);
  },
};

/* ── Endpoints ───────────────────────────────────────────────────────────── */

async function handleSync(request, env) {
  const body = await request.json();
  const sub = body && body.subscription;
  if (!sub || !sub.endpoint) throw new Error("subscription ausente");

  const host = new URL(sub.endpoint).hostname;
  if (!PUSH_HOSTS.some((h) => host === h || host.endsWith("." + h))) {
    throw new Error("endpoint de push desconhecido");
  }

  const now = Date.now();
  const schedule = (Array.isArray(body.schedule) ? body.schedule : [])
    .filter((ts) => typeof ts === "number" && Number.isFinite(ts) && ts > now)
    .sort((a, b) => a - b)
    .slice(0, MAX_SCHEDULE);

  const key = "sub:" + (await hashEndpoint(sub.endpoint));
  await env.PUSH.put(
    key,
    JSON.stringify({ endpoint: sub.endpoint, schedule, updatedAt: now })
    // sem expirationTtl: a inscrição só some se o push service disser que morreu
  );
  return { ok: true, scheduled: schedule.length };
}

async function handleUnsync(request, env) {
  const body = await request.json();
  if (!body || !body.endpoint) throw new Error("endpoint ausente");
  await env.PUSH.delete("sub:" + (await hashEndpoint(body.endpoint)));
  return { ok: true };
}

/* ── Cron ────────────────────────────────────────────────────────────────── */

async function fireDue(env) {
  const now = Date.now();
  const listed = await env.PUSH.list({ prefix: "sub:" });

  for (const entry of listed.keys) {
    const rec = await env.PUSH.get(entry.name, "json");
    if (!rec || !Array.isArray(rec.schedule)) continue;

    const due = rec.schedule.filter((ts) => ts <= now && ts > now - FIRE_WINDOW_MS);
    // Tudo que já passou sai da agenda: o que acabou de disparar (senão o push
    // se repetiria a cada minuto) e também o que ficou velho demais — o
    // aparelho pode ter passado horas offline, e não faz sentido avisar da
    // dose de ontem.
    const remaining = rec.schedule.filter((ts) => ts > now);

    if (due.length > 0) {
      const alive = await sendPush(rec.endpoint, env);
      if (!alive) {
        await env.PUSH.delete(entry.name);
        continue;
      }
    }
    if (remaining.length !== rec.schedule.length) {
      await env.PUSH.put(entry.name, JSON.stringify({ ...rec, schedule: remaining }));
    }
  }
}

/**
 * Push sem corpo: só os cabeçalhos VAPID.
 * @returns false quando o push service diz que a inscrição morreu (404/410).
 */
async function sendPush(endpoint, env) {
  const jwt = await vapidJwt(new URL(endpoint).origin, env);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      TTL: "1800",
      Urgency: "high",
      Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
    },
  });
  return res.status !== 404 && res.status !== 410;
}

/* ── VAPID (ES256 via WebCrypto) ─────────────────────────────────────────── */

let cachedKey = null;

async function signingKey(env) {
  if (cachedKey) return cachedKey;
  const priv = b64urlToBytes(env.VAPID_PRIVATE_KEY);
  const pub = b64urlToBytes(env.VAPID_PUBLIC_KEY);
  if (pub.length !== 65 || pub[0] !== 0x04) throw new Error("VAPID_PUBLIC_KEY inválida");
  cachedKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      d: bytesToB64url(priv),
      x: bytesToB64url(pub.slice(1, 33)),
      y: bytesToB64url(pub.slice(33, 65)),
      ext: true,
    },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  return cachedKey;
}

async function vapidJwt(audience, env) {
  const header = bytesToB64url(utf8(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = bytesToB64url(
    utf8(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 3600,
        sub: env.VAPID_SUBJECT,
      })
    )
  );
  const signingInput = `${header}.${payload}`;
  // ECDSA no WebCrypto já devolve r||s cru (64 bytes) — exatamente o que o JWS ES256 quer.
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    await signingKey(env),
    utf8(signingInput)
  );
  return `${signingInput}.${bytesToB64url(new Uint8Array(sig))}`;
}

/* ── Utilidades ──────────────────────────────────────────────────────────── */

function utf8(s) {
  return new TextEncoder().encode(s);
}

function bytesToB64url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Chave do KV derivada do endpoint — o aparelho não precisa gerenciar id. */
async function hashEndpoint(endpoint) {
  const digest = await crypto.subtle.digest("SHA-256", utf8(endpoint));
  return bytesToB64url(new Uint8Array(digest)).slice(0, 32);
}

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
