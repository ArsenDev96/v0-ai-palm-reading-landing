import { Upload, ScanLine, Sparkles } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload your palm",
    desc: "Snap a clear photo of your dominant hand or drag and drop an existing image.",
  },
  {
    icon: ScanLine,
    title: "AI maps your lines",
    desc: "Our model traces your life, heart, head, and fate lines with precision.",
  },
  {
    icon: Sparkles,
    title: "Reveal your reading",
    desc: "Receive a personalized interpretation of your character, love, and destiny.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          How it works
        </p>
        <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Three steps to your reading
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="relative rounded-2xl border border-border bg-card p-7"
          >
            <span className="absolute right-6 top-6 font-serif text-4xl text-border">
              {`0${i + 1}`}
            </span>
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <step.icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
