import Image from "next/image"
import { Star } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-32 md:grid-cols-2 md:pb-28 md:pt-40">
        <div className="relative z-10 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Star className="size-3.5 fill-primary text-primary" aria-hidden="true" />
            Trusted by 120,000+ curious minds
          </span>
          <h1 className="mt-6 text-balance font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            What Does Your Palm Reveal About You?
          </h1>
          <p className="mx-auto mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground md:mx-0">
            Upload a photo of your hand and let our AI read your heart, head,
            life, and fate lines — for a personalized reading of love, success,
            and destiny, delivered to your inbox.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:items-start md:justify-start">
            <a
              href="#reading"
              className="w-full rounded-full bg-primary px-7 py-3 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
            >
              Reveal my reading
            </a>
            <a
              href="#how"
              className="w-full rounded-full border border-border px-7 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-card sm:w-auto"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-sm md:max-w-none">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <Image
              src="/hero-palm.png"
              alt="A glowing palm with constellation lines tracing across it"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-5">
              <p className="font-serif text-lg text-foreground">
                {'"Your heart line runs deep and unbroken..."'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
