import { Sparkles } from "lucide-react"

export function SiteNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Palmist
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#reading" className="transition-colors hover:text-foreground">
            Get a reading
          </a>
          <a href="#contact" className="transition-colors hover:text-foreground">
            Contact
          </a>
        </div>

        <a
          href="#reading"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Read my palm
        </a>
      </nav>
    </header>
  )
}
