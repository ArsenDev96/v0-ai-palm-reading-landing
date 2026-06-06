"use server"

import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET = "palm-images"

export type ReadingLine = {
  name: string
  summary: string
}

// Deterministic "analysis" so each reading is stored as real text.
const LINE_POOL: Record<string, string[]> = {
  "Heart Line": [
    "Deep and unbroken — you love wholeheartedly and form lasting, loyal bonds.",
    "Curving toward the fingers — you lead with empathy and wear your heart openly.",
    "Faint but steady — you guard your feelings, but those you trust have your devotion.",
  ],
  "Head Line": [
    "Long and clear — a sharp, analytical mind that thrives on curiosity and ideas.",
    "Gently sloping — an imaginative thinker who trusts intuition over rigid logic.",
    "Strong and straight — decisive, focused, and grounded in practical reasoning.",
  ],
  "Life Line": [
    "Strong and curved — vitality, resilience, and a zest for new adventures.",
    "Wide-arcing — boundless energy and a warm, outgoing spirit.",
    "Close to the thumb — measured and deliberate, you conserve your strength wisely.",
  ],
  "Fate Line": [
    "Well-defined — your path is purposeful, with a turning point on the horizon.",
    "Branching upward — multiple opportunities are converging in your favor.",
    "Subtle — your destiny is self-made, shaped more by choice than circumstance.",
  ],
}

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateReading(): ReadingLine[] {
  return Object.entries(LINE_POOL).map(([name, options]) => ({
    name,
    summary: pick(options),
  }))
}

type Result =
  | { ok: true; lines: ReadingLine[] }
  | { ok: false; error: string }

export async function submitPalmReading(formData: FormData): Promise<Result> {
  const email = String(formData.get("email") ?? "").trim()
  const image = formData.get("image")

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!validEmail) {
    return { ok: false, error: "Please enter a valid email address." }
  }
  if (!(image instanceof File) || image.size === 0) {
    return { ok: false, error: "Your palm image is missing. Please re-upload." }
  }

  const supabase = createAdminClient()

  // 1. Upload the palm image to the storage bucket.
  const ext = image.name.split(".").pop() || "png"
  const path = `readings/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, image, {
      contentType: image.type || "image/png",
      upsert: false,
    })

  if (uploadError) {
    console.log("[v0] storage upload error:", uploadError.message)
    return { ok: false, error: "We couldn't upload your image. Please try again." }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path)

  // 2. Generate the reading and persist the lead to the users table.
  const lines = generateReading()
  const analysis = lines.map((l) => `${l.name}: ${l.summary}`).join("\n")

  const { error: dbError } = await supabase
    .from("users")
    .upsert(
      { email, image_url: publicUrl, analysis },
      { onConflict: "email" },
    )

  if (dbError) {
    console.log("[v0] db insert error:", dbError.message)
    return { ok: false, error: "We couldn't save your reading. Please try again." }
  }

  return { ok: true, lines }
}
