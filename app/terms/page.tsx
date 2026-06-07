import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, Section, Bullets } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service — Palmist",
  description:
    "The terms that govern your use of Palmist's AI palm reading service.",
}

const SUPPORT_EMAIL = "yourfate4@zohomail.com"

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="June 7, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
        Palmist website and AI palm reading service. By using the service, you
        agree to these Terms. If you do not agree, please do not use the service.
      </p>

      <Section title="For entertainment only">
        <p>
          Palmist provides AI-generated palm readings for entertainment purposes
          only. Readings are not facts and are not professional advice of any
          kind — including medical, psychological, legal, or financial advice.
          Do not rely on a reading to make important decisions.
        </p>
      </Section>

      <Section title="Eligibility">
        <p>
          You must be at least 16 years old (or the age of majority where you
          live) to use Palmist. By using the service you confirm that you meet
          this requirement.
        </p>
      </Section>

      <Section title="Your uploads">
        <Bullets
          items={[
            "You may only upload a photo of your own hand, or a hand you have permission to share.",
            "You confirm you have the rights to any image you upload.",
            "You grant us permission to process your image to generate and deliver your reading, as described in our Privacy Policy.",
          ]}
        />
      </Section>

      <Section title="Acceptable use">
        <p>You agree not to:</p>
        <Bullets
          items={[
            "Upload unlawful, harmful, or infringing content, or anything other than a hand photo.",
            "Attempt to disrupt, overload, reverse engineer, or gain unauthorized access to the service.",
            "Use the service in a way that violates any applicable law.",
          ]}
        />
      </Section>

      <Section title="Intellectual property">
        <p>
          The Palmist name, website, and content (other than the photos you
          upload) are owned by us or our licensors and are protected by
          applicable laws. You keep ownership of the photos you upload.
        </p>
      </Section>

      <Section title="Disclaimer of warranties">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; without warranties of any kind, whether express or
          implied. We do not warrant that the service will be uninterrupted,
          error-free, or that any reading is accurate.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, Palmist and its operators will
          not be liable for any indirect, incidental, or consequential damages,
          or any loss arising from your use of, or reliance on, the service or
          any reading.
        </p>
      </Section>

      <Section title="Changes to the service and Terms">
        <p>
          We may modify or discontinue the service, and we may update these
          Terms from time to time. When we update the Terms we will revise the
          &ldquo;Last updated&rdquo; date above. Continued use after changes
          means you accept the updated Terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These Terms are governed by the laws of the jurisdiction in which the
          service operator is established, without regard to conflict-of-law
          rules.
        </p>
      </Section>

      <Section title="Contact us">
        <p>
          Questions about these Terms? Reach us through our{" "}
          <Link href="/#contact" className="text-primary hover:underline">
            contact form
          </Link>{" "}
          or by email at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-primary hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  )
}
