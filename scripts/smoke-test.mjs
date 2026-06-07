// One-off setup verifier. Run: node scripts/smoke-test.mjs
// Reads .env manually (no dotenv) and checks Supabase + Resend via plain fetch.
import { readFileSync } from "node:fs"

function loadEnv() {
  const env = {}
  for (const f of [".env.local", ".env"]) {
    let raw = ""
    try {
      raw = readFileSync(new URL(`../${f}`, import.meta.url), "utf8")
    } catch {
      continue
    }
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  }
  return env
}

const env = loadEnv()
const ok = (m) => console.log(`  ✅ ${m}`)
const bad = (m) => console.log(`  ❌ ${m}`)

const base = (env.SUPABASE_URL ?? "").replace(/\/+$/, "")
const key = env.SUPABASE_SERVICE_ROLE_KEY ?? ""
const sbHeaders = { apikey: key, authorization: `Bearer ${key}` }

console.log("\n1. SUPABASE_URL format")
if (!base) bad("SUPABASE_URL is missing")
else if (/\/rest\/v1/.test(base)) bad(`has a REST path — use the bare URL: ${base}`)
else ok(base)

console.log("\n2. users table")
if (base && key) {
  const r = await fetch(`${base}/rest/v1/users?select=id&limit=1`, { headers: sbHeaders })
  if (r.ok) ok("table exists and is queryable")
  else bad(`query failed (${r.status}) — ${await r.text()}`)
} else bad("Supabase creds missing")

console.log("\n3. palm-images bucket")
if (base && key) {
  const r = await fetch(`${base}/storage/v1/bucket/palm-images`, { headers: sbHeaders })
  if (r.ok) {
    const b = await r.json()
    ok(`exists (public: ${b.public})${b.public ? "" : "  ← should be PUBLIC"}`)
  } else bad(`not found (${r.status}) — ${await r.text()}`)
}

console.log("\n4. Resend API key")
if (!env.RESEND_API_KEY) bad("RESEND_API_KEY missing")
else {
  const r = await fetch("https://api.resend.com/domains", {
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}` },
  })
  if (r.ok) ok("key is valid")
  else bad(`key rejected (${r.status}) — ${await r.text()}`)
}

console.log("\n5. OpenAI API key (palm reading)")
if (!env.OPENAI_API_KEY) bad("OPENAI_API_KEY missing")
else {
  const r = await fetch("https://api.openai.com/v1/models", {
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` },
  })
  if (r.ok) ok(`key is valid (model: ${env.OPENAI_MODEL || "gpt-4o"})`)
  else bad(`key rejected (${r.status}) — ${await r.text()}`)
}
console.log("")
