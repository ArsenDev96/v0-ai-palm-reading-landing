import { Sparkles } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <a href="#" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </span>
          <span className="font-serif text-xl font-semibold text-foreground">
            Palmist
          </span>
        </a>
        <p className="text-sm text-muted-foreground">
          For entertainment purposes only. © {new Date().getFullYear()} Palmist.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Terms
          </a>
        </div>
      </div>
    </footer>
  )
}
