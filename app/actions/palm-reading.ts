"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email/mailer"
import { readPalm, UnreadablePalmError } from "@/lib/ai/palm"
import type { ReadingLine } from "@/lib/ai/palm"

const BUCKET = "palm-images"
// Readings/leads live in the `users` table.
const TABLE = "users"
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
}

// How many lines are shown on-screen as a teaser before the email gate.
const TEASER_COUNT = 1

function serializeReading(lines: ReadingLine[]) {
  return lines.map((l) => `${l.name}: ${l.summary}`).join("\n")
}

function parseReading(analysis: string): ReadingLine[] {
  return analysis
    .split("\n")
    .filter(Boolean)
    .map((row) => {
      const idx = row.indexOf(": ")
      if (idx === -1) return { name: row, summary: "" }
      return { name: row.slice(0, idx), summary: row.slice(idx + 2) }
    })
}

type AnalyzeResult =
  | { ok: true; id: string; teaser: ReadingLine[]; locked: string[] }
  | { ok: false; error: string }

/**
 * Step 1: validate + store the palm image, generate the full reading, and
 * persist it WITHOUT an email yet. Returns a teaser to hook the visitor; the
 * full reading stays server-side until they reveal it with their email.
 */
export async function analyzePalm(formData: FormData): Promise<AnalyzeResult> {
  const image = formData.get("image")

  if (!(image instanceof File) || image.size === 0) {
    return { ok: false, error: "Your palm image is missing. Please re-upload." }
  }
  if (!IMAGE_EXTENSIONS[image.type]) {
    return { ok: false, error: "Please upload a JPG or PNG image." }
  }
  if (image.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "Please upload an image smaller than 10MB." }
  }

  // Read the palm FIRST, straight from the in-memory upload. Rejecting a
  // non-palm or unreadable photo here means we never touch storage for junk.
  let lines: ReadingLine[]
  try {
    const base64 = Buffer.from(await image.arrayBuffer()).toString("base64")
    lines = await readPalm(base64, image.type)
  } catch (e) {
    console.log("[v0] palm reading error:", (e as Error).message)
    return {
      ok: false,
      // A rejected palm (not a hand / too blurry) carries a user-facing message;
      // anything else gets the generic fallback.
      error:
        e instanceof UnreadablePalmError
          ? e.message
          : "Our reader couldn't interpret your palm. Please try a clearer photo.",
    }
  }

  const supabase = createAdminClient()

  // Upload the (now-validated) palm image to the storage bucket.
  const ext = IMAGE_EXTENSIONS[image.type]
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

  // Persist the full reading (email attached later on reveal).
  const analysis = serializeReading(lines)

  const { data, error: dbError } = await supabase
    .from(TABLE)
    .insert({ image_url: publicUrl, analysis })
    .select("id")
    .single()

  if (dbError || !data) {
    console.log("[v0] db insert error:", dbError?.message)
    // Don't leave an orphaned image when the row fails to save.
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET)
      .remove([path])
    if (cleanupError) {
      console.log("[v0] storage cleanup error:", cleanupError.message)
    }
    return { ok: false, error: "We couldn't prepare your reading. Please try again." }
  }

  return {
    ok: true,
    id: data.id as string,
    teaser: lines.slice(0, TEASER_COUNT),
    locked: lines.slice(TEASER_COUNT).map((l) => l.name),
  }
}

type RevealResult = { ok: true } | { ok: false; error: string }

/**
 * Step 2: attach the visitor's email to the stored reading and email them the
 * full result.
 */
export async function revealReading(
  id: string,
  rawEmail: string,
): Promise<RevealResult> {
  const email = rawEmail.trim()
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!validEmail) {
    return { ok: false, error: "Please enter a valid email address." }
  }
  if (!id) {
    return { ok: false, error: "Your reading expired. Please upload again." }
  }

  const supabase = createAdminClient()

  const { data, error: lookupError } = await supabase
    .from(TABLE)
    .select("analysis")
    .eq("id", id)
    .single()

  if (lookupError || !data) {
    console.log("[v0] reading lookup error:", lookupError?.message)
    return { ok: false, error: "We couldn't find your reading. Please upload again." }
  }

  const lines = parseReading(data.analysis as string)

  try {
    await sendEmail({
      to: email,
      subject: "Your full palm reading ✨",
      html: buildReadingEmail(lines),
    })
  } catch (e) {
    console.log("[v0] email send error:", (e as Error).message)
    return {
      ok: false,
      error: "We couldn't email your reading. Please try again.",
    }
  }

  // Record the lead. Don't fail the user if this update hiccups — they already
  // got their email; just log it.
  const { error: updateError } = await supabase
    .from(TABLE)
    .update({ email })
    .eq("id", id)

  if (updateError) {
    console.log("[v0] reading update error:", updateError.message)
  }

  return { ok: true }
}

function buildReadingEmail(lines: ReadingLine[]) {
  const rows = lines
    .map(
      (l) => `
      <tr>
        <td style="padding:18px 0;border-bottom:1px solid #ececec;">
          <p style="margin:0 0 6px;font-weight:600;color:#1a1a1a;font-size:16px;">${l.name}</p>
          <p style="margin:0;color:#555;font-size:14px;line-height:1.65;">${l.summary}</p>
        </td>
      </tr>`,
    )
    .join("")

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf7f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
            <tr>
              <td style="padding:32px 32px 8px;">
                <p style="margin:0;text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#a06a8c;font-weight:600;">Your reading</p>
                <h1 style="margin:8px 0 0;font-size:26px;color:#1a1a1a;">The lines have spoken ✨</h1>
                <p style="margin:12px 0 0;color:#666;font-size:14px;line-height:1.6;">Here is your complete personalized palm reading — covering love, intellect, vitality, destiny, success, and partnership.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">You received this because you requested a palm reading. For entertainment purposes only.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
