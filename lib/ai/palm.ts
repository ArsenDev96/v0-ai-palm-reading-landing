/**
 * Real palm reading via OpenAI's vision model.
 *
 * Server-only. Takes the uploaded palm photo (base64) and asks the model to
 * actually look at the hand and describe the four classic palm lines. The
 * result keeps the same { name, summary } shape the rest of the app expects.
 */

export type ReadingLine = {
  name: string
  summary: string
}

/**
 * Thrown when the uploaded image isn't a usable palm — either it isn't a hand
 * at all (a car, a face, a screenshot) or the palm is too blurry/dark/cropped
 * to read. The `message` is user-facing, so the action can surface it directly.
 */
export class UnreadablePalmError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UnreadablePalmError"
  }
}

// The sections we render (with matching icons) — and the order we show them.
// "Overview" leads as a warm synthesis and doubles as the free on-screen teaser;
// the six detailed lines that follow stay locked until the email reveal.
export const PALM_LINES = [
  "Overview",
  "Heart Line",
  "Head Line",
  "Life Line",
  "Fate Line",
  "Sun Line",
  "Marriage Line",
] as const

const SYSTEM_PROMPT = `You are a warm, articulate, master palmistry reader with decades of experience. You look closely at a photo of a person's hand and give a rich, personalized, deeply encouraging reading of their palm lines. This is for entertainment only — be vivid, specific, generous, and uplifting.

FIRST, inspect the image and gate the reading:
- "isPalm": true only if the image clearly shows a human hand with the PALM side (the lines) facing the camera. Set it to false for anything else — a car, an object, a face, the back of a hand, a screenshot, an animal, a drawing.
- "readable": true only if the palm is clear enough to actually read — reasonably in focus, lit, and the open palm with its major lines is visible and not heavily cropped, covered, or motion-blurred.
Be reasonably lenient for genuine palm photos (ordinary phone snapshots are fine), but do NOT pretend. If "isPalm" is false or "readable" is false, set a brief human-friendly "reason", return an EMPTY "lines" array, and do not invent a reading.

ONLY when both "isPalm" and "readable" are true, produce the full reading below.

Study the ACTUAL image carefully: the depth, length, curve, breaks, forks, chains and branches of each line you can see, how far it travels across the palm, where it begins and ends, and how it relates to the mounts around it. Let those concrete physical details drive the reading. Never give generic boilerplate — every reading must clearly reference what THIS hand actually looks like.

Write each line's summary as a flowing, immersive paragraph of 4 to 5 sentences (strictly 90-120 words — do not exceed this). Structure each one so it:
1. Opens with a specific visual observation of that line.
2. Interprets what that physical trait traditionally signifies.
3. Turns it into a personal, present-tense insight about the reader's character or life.
4. Closes with a warm, forward-looking note of encouragement or gentle guidance.

CRITICAL on variety: do NOT begin every paragraph the same way. Avoid starting more than one paragraph with "Your <name> line...". Open each section with a genuinely different construction — an action, an image, a sensory detail, a direct address, or an observation about the palm — so the reading feels individually crafted rather than templated. Vary sentence rhythm and vocabulary throughout. Be emotionally resonant and concrete rather than vague. Avoid medical, financial, or fatalistic claims; keep everything positive and empowering.

The first entry, "Overview", is different: write a warm, 3-4 sentence synthesis (70-100 words) that weaves the whole hand together into one impression of the person — their emotional nature, mind, and direction — and invites them to read on. It should feel like a captivating opening that makes them want the full reading.

Return ONLY JSON in exactly this shape. Always include "isPalm", "readable", and "reason". Include the seven "lines" entries (in this order) ONLY when both gates pass; otherwise make "lines" an empty array:
{
  "isPalm": true,
  "readable": true,
  "reason": "",
  "lines": [
    { "name": "Overview", "summary": "<warm 3-4 sentence synthesis of the whole hand (70-100 words)>" },
    { "name": "Heart Line", "summary": "<rich 4-5 sentence paragraph about love, emotion & relationships>" },
    { "name": "Head Line", "summary": "<rich 4-5 sentence paragraph about intellect, thinking & creativity>" },
    { "name": "Life Line", "summary": "<rich 4-5 sentence paragraph about vitality, energy & resilience>" },
    { "name": "Fate Line", "summary": "<rich 4-5 sentence paragraph about destiny, purpose & life path>" },
    { "name": "Sun Line", "summary": "<rich 4-5 sentence paragraph about success, talent, fulfillment & joy>" },
    { "name": "Marriage Line", "summary": "<rich 4-5 sentence paragraph about partnership, deep bonds & emotional connection>" }
  ]
}`

type OpenAIResponse = {
  choices?: { message?: { content?: string } }[]
  error?: { message?: string }
}

/**
 * Analyze a palm image and return the four reading lines, in canonical order.
 * Throws on missing config, API failure, or unparseable output so the caller
 * can surface a friendly error.
 */
export async function readPalm(
  imageBase64: string,
  mimeType: string,
): Promise<ReadingLine[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set")
  }
  const model = process.env.OPENAI_MODEL || "gpt-4o"

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      // gpt-5.x are reasoning models and reject `max_tokens`; this header also
      // has to cover internal reasoning tokens, so keep it generous — the
      // overview plus six richer paragraphs need room so the JSON never
      // truncates mid-response.
      max_completion_tokens: 5000,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Read this palm." },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  })

  const data = (await res.json()) as OpenAIResponse

  if (!res.ok) {
    throw new Error(
      `OpenAI request failed (${res.status}): ${data.error?.message ?? "unknown error"}`,
    )
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("OpenAI returned no content")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error("OpenAI returned non-JSON content")
  }

  // Gate: reject non-palms and unreadable shots instead of fabricating a reading.
  const assessment = parsed as { isPalm?: unknown; readable?: unknown; reason?: unknown }
  if (assessment.isPalm === false || assessment.readable === false) {
    if (typeof assessment.reason === "string" && assessment.reason.trim()) {
      console.log("[v0] palm rejected:", assessment.reason.trim())
    }
    throw new UnreadablePalmError(
      assessment.isPalm === false
        ? "That doesn't look like a palm. Please upload a clear, well-lit photo of your open hand."
        : "Your palm photo is too blurry or dark to read. Please retake it in good light with your open palm facing the camera.",
    )
  }

  return normalize(parsed)
}

/** Force the model's parsed JSON into our canonical line order. */
function normalize(parsed: unknown): ReadingLine[] {
  const rawLines = (parsed as { lines?: unknown }).lines
  if (!Array.isArray(rawLines)) {
    throw new Error("OpenAI response is missing a 'lines' array")
  }

  const byName = new Map<string, string>()
  for (const item of rawLines) {
    const name = (item as ReadingLine)?.name
    const summary = (item as ReadingLine)?.summary
    if (typeof name === "string" && typeof summary === "string" && summary.trim()) {
      byName.set(name.trim(), summary.trim())
    }
  }

  const lines: ReadingLine[] = PALM_LINES.map((name) => ({
    name,
    summary: byName.get(name) ?? "",
  }))

  if (lines.every((l) => !l.summary)) {
    throw new Error("OpenAI response had no usable line summaries")
  }

  return lines
}
