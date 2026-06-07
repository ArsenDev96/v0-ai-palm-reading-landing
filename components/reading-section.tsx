"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
  Upload,
  Loader2,
  Lock,
  Heart,
  Brain,
  Activity,
  Sparkles,
  Sun,
  HeartHandshake,
  Hand,
  RefreshCw,
  MailCheck,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { analyzePalm, revealReading } from "@/app/actions/palm-reading"
import type { ReadingLine } from "@/lib/ai/palm"

type Stage = "idle" | "analyzing" | "gated" | "sent"

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"])
// Keep the "analyzing" animation on screen for at least this long so it feels
// like real work even when the upload finishes quickly.
const MIN_ANALYZE_MS = 2200

const lineIcons: Record<string, typeof Heart> = {
  Overview: Hand,
  "Heart Line": Heart,
  "Head Line": Brain,
  "Life Line": Activity,
  "Fate Line": Sparkles,
  "Sun Line": Sun,
  "Marriage Line": HeartHandshake,
}

export function ReadingSection() {
  const [stage, setStage] = useState<Stage>("idle")
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [readingId, setReadingId] = useState<string | null>(null)
  const [teaser, setTeaser] = useState<ReadingLine[]>([])
  const [locked, setLocked] = useState<string[]>([])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError("Please upload a JPG or PNG image.")
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Please upload an image smaller than 10MB.")
      return
    }

    setError("")
    const url = URL.createObjectURL(file)
    setPreview(url)
    setStage("analyzing")

    const formData = new FormData()
    formData.append("image", file)

    try {
      const [res] = await Promise.all([
        analyzePalm(formData),
        new Promise((resolve) => setTimeout(resolve, MIN_ANALYZE_MS)),
      ])

      if (!res.ok) {
        setError(res.error)
        setPreview(null)
        setStage("idle")
        return
      }

      setReadingId(res.id)
      setTeaser(res.teaser)
      setLocked(res.locked)
      setStage("gated")
    } catch {
      setError("Something went wrong. Please try again.")
      setPreview(null)
      setStage("idle")
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const onSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!valid) {
      setError("Please enter a valid email address.")
      return
    }
    if (!readingId) {
      setError("Your reading expired. Please re-upload.")
      return
    }
    setError("")
    setSubmitting(true)

    try {
      const res = await revealReading(readingId, email)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setStage("sent")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setEmail("")
    setError("")
    setReadingId(null)
    setTeaser([])
    setLocked([])
    setStage("idle")
  }

  return (
    <section id="reading" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Your reading
        </p>
        <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Upload your hand to begin
        </h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
        {/* Left: uploader */}
        <div className="rounded-3xl border border-border bg-card p-6">
          {!preview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById("palm-input")?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  document.getElementById("palm-input")?.click()
              }}
              className={`flex aspect-[4/5] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background/40 hover:border-primary/60"
              }`}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Upload className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-5 text-lg font-semibold text-foreground">
                Drag &amp; drop your palm photo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse — JPG or PNG, up to 10MB
              </p>
              <span className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                Upload hand image
              </span>
              <input
                id="palm-input"
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          ) : (
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Your uploaded palm"
                fill
                className="object-cover"
              />
              {stage === "analyzing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                  <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
                  <p className="font-serif text-xl text-foreground">
                    Reading your lines...
                  </p>
                </div>
              )}
              <button
                onClick={reset}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur transition-colors hover:bg-background"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Start over
              </button>
            </div>
          )}
        </div>

        {/* Right: results / gate */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          {stage === "idle" && (
            <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <Sparkles className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-4 max-w-xs text-pretty text-muted-foreground">
                Your personalized palm analysis will appear here once you upload
                an image.
              </p>
              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            </div>
          )}

          {stage === "analyzing" && (
            <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
              <p className="mt-4 font-serif text-2xl text-foreground">
                Consulting the lines
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Our AI is mapping your palm...
              </p>
            </div>
          )}

          {stage === "gated" && (
            <div className="flex h-full flex-col justify-center">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="size-5" aria-hidden="true" />
                <span className="text-sm font-medium uppercase tracking-widest">
                  Your reading is ready
                </span>
              </div>
              <h3 className="mt-3 font-serif text-3xl font-semibold text-foreground">
                Here&apos;s a glimpse
              </h3>

              {/* Teaser line(s) — the hook */}
              <ul className="mt-5 space-y-4">
                {teaser.map((line) => {
                  const Icon = lineIcons[line.name] ?? Sparkles
                  return (
                    <li key={line.name} className="flex gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{line.name}</p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {line.summary}
                        </p>
                      </div>
                    </li>
                  )
                })}

                {/* Locked lines — blurred to entice */}
                {locked.map((name) => {
                  const Icon = lineIcons[name] ?? Sparkles
                  return (
                    <li key={name} className="flex gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 font-semibold text-foreground">
                          {name}
                          <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        </p>
                        <p className="select-none text-sm leading-relaxed text-muted-foreground blur-sm">
                          Your full {name.toLowerCase()} insight is ready and
                          waiting in your inbox.
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <form onSubmit={onSubmitEmail} className="mt-6 space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Enter your email to get your full reading
                </p>
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background"
                  aria-label="Email address"
                  aria-invalid={!!error}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
                >
                  {submitting && (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  )}
                  {submitting ? "Sending your reading..." : "Email my full reading"}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </div>
          )}

          {stage === "sent" && (
            <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MailCheck className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-serif text-3xl font-semibold text-foreground">
                Your full reading is on its way
              </h3>
              <p className="mt-3 max-w-sm text-pretty leading-relaxed text-muted-foreground">
                We&apos;ve sent your complete palm reading to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Check your inbox ✨
              </p>
              <button
                onClick={reset}
                className="mt-7 flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Read another palm
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
