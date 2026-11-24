// Crea un token di sessione per l'avatar realistico (HeyGen LiveAvatar). La API key resta solo qui.
const API = "https://api.liveavatar.com";
const ALLOWED = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
const AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID || "cc65bf90-dbe6-4ad3-8a4b-e936c9b34401"; // Claire (figura intera)
const CTX = { it: process.env.LIVEAVATAR_CONTEXT_IT, en: process.env.LIVEAVATAR_CONTEXT_EN };
const MAX_SECONDS = Number(process.env.LIVEAVATAR_MAX_SECONDS || 120); // limita il costo di ogni conversazione
const MAX_PER_HOUR = Number(process.env.LIVEAVATAR_MAX_PER_HOUR_IP || 4);
const hits = new Map();
const rateOk = (ip) => {
  const now = Date.now(), arr = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length <= MAX_PER_HOUR;
};

export default async (req) => {
  const origin = req.headers.get("origin") || "";
  const okOrigin = ALLOWED.length === 0 || ALLOWED.includes(origin);
  const cors = {
    "Access-Control-Allow-Origin": okOrigin && origin ? origin : ALLOWED[0] || "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "content-type": "application/json" } });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!okOrigin) return json({ error: "origin" }, 403);
  const key = process.env.LIVEAVATAR_API_KEY;
  if (!key) return json({ error: "not_configured" }, 503);
  const ip = (req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "?").split(",")[0].trim();
  if (!rateOk(ip)) return json({ error: "rate" }, 429);

  let body = {};
  try { body = await req.json(); } catch {}
  const lang = body.lang === "en" ? "en" : "it";
  const persona = { language: lang };
  if (CTX[lang]) persona.context_id = CTX[lang];
  try {
    const r = await fetch(`${API}/v1/sessions/token`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-API-KEY": key },
      body: JSON.stringify({ mode: "FULL", avatar_id: AVATAR_ID, max_session_duration: MAX_SECONDS, avatar_persona: persona }),
      signal: AbortSignal.timeout(15000),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.data?.session_token) return json({ error: "upstream" }, 502);
    return json({ sessionToken: d.data.session_token, maxSeconds: MAX_SECONDS });
  } catch {
    return json({ error: "failed" }, 502);
  }
};

export const config = { path: "/api/avatar-token" };
