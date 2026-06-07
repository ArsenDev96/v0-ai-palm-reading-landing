import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { ReadingSection } from "@/components/reading-section"
import { ContactSection } from "@/components/contact-section"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Hero />
      <HowItWorks />
      <ReadingSection />
      <ContactSection />
      <SiteFooter />
    </main>
  )
}
