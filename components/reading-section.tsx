"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import {
  Upload,
  Loader2,
  Lock,
  Heart,
  Brain,
  Activity,
  Sparkles,
  RefreshCw,
  Check,
} from "lucide-react"
import { Input } from "@/components/ui/input"

type Stage = "idle" | "analyzing" | "gated" | "revealed"

const lines = [
  {
    icon: Heart,
    name: "Heart Line",
    summary:
      "Deep and unbroken — you love wholeheartedly and form lasting, loyal bonds.",
  },
  {
    icon: Brain,
    name: "Head Line",
    summary:
      "Long and clear — a sharp, analytical mind that thrives on curiosity and ideas.",
  },
  {
    icon: Activity,
    name: "Life Line",
    summary:
      "Strong and curved — vitality, resilience, and a zest for new adventures.",
  },
  {
    icon: Sparkles,
    name: "Fate Line",
    summary:
      "Well-defined — your path is purposeful, with a turning point on the horizon.",
  },
]

export function ReadingSection() {
  const [stage, setStage] = useState<Stage>("idle")
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setStage("analyzing")
    // Simulate AI analysis
    setTimeout(() => setStage("gated"), 2600)
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

  const onSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!valid) {
      setEmailError("Please enter a valid email address.")
      return
    }
    setEmailError("")
    setStage("revealed")
  }

  const reset = () => {
    setPreview(null)
    setEmail("")
    setEmailError("")
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
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
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
                ref={inputRef}
                type="file"
                accept="image/*"
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
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Lock className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-serif text-3xl font-semibold text-foreground">
                Your reading is ready
              </h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                Enter your email to unlock your full personalized palm reading —
                covering love, intellect, vitality, and destiny.
              </p>
              <form onSubmit={onSubmitEmail} className="mt-6 space-y-3">
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background"
                  aria-label="Email address"
                  aria-invalid={!!emailError}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Unlock my full reading
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </div>
          )}

          {stage === "revealed" && (
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Check className="size-5" aria-hidden="true" />
                <span className="text-sm font-medium uppercase tracking-widest">
                  Reading unlocked
                </span>
              </div>
              <h3 className="mt-3 font-serif text-3xl font-semibold text-foreground">
                The lines have spoken
              </h3>
              <ul className="mt-6 space-y-4">
                {lines.map((line) => (
                  <li key={line.name} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <line.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{line.name}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {line.summary}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={reset}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-background"
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
