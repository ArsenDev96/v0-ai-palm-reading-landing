import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, Section, Bullets } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy — Palmist",
  description:
    "How Palmist collects, uses, and protects the palm photos, email addresses, and messages you share with us.",
}

const SUPPORT_EMAIL = "yourfate4@zohomail.com"

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="June 7, 2026">
      <p>
        This Privacy Policy explains what information Palmist (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects when you use our AI palm reading website, how
        we use it, and the choices you have. Palmist is provided for
        entertainment purposes only.
      </p>

      <Section title="Information we collect">
        <Bullets
          items={[
            <>
              <strong className="text-foreground">Palm photos</strong> you
              upload so our AI can generate a reading.
            </>,
            <>
              <strong className="text-foreground">Your email address</strong>,
              which you provide to receive your full reading.
            </>,
            <>
              <strong className="text-foreground">Contact messages</strong> —
              the name, email, and message you send through our contact form.
            </>,
            <>
              <strong className="text-foreground">Basic usage data</strong> such
              as anonymized analytics about how the site is used.
            </>,
          ]}
        />
      </Section>

      <Section title="How we use your information">
        <Bullets
          items={[
            "To analyze your uploaded photo and create your personalized palm reading.",
            "To email your full reading to the address you provide.",
            "To respond to questions or support requests you send us.",
            "To operate, maintain, and improve the service.",
          ]}
        />
      </Section>

      <Section title="Service providers we share data with">
        <p>
          We use a small number of trusted third parties to run the service.
          They process data only to provide their service to us:
        </p>
        <Bullets
          items={[
            <>
              OpenAI — your uploaded
              photo is sent to OpenAI&apos;s vision model to generate the
              reading.
            </>,
            <>
              Supabase — stores your
              uploaded image, reading, and email.
            </>,
            <>
              Zoho Mail — delivers
              your reading and our replies by email.
            </>,
            <>
              Vercel — hosts the
              website and provides anonymized analytics.
            </>,
          ]}
        />
        <p>
          We do not sell your personal information or use your photos for
          advertising.
        </p>
      </Section>

      <Section title="Data retention">
        <p>
          We keep your uploaded photo, reading, and email for as long as needed
          to provide the service and for our legitimate business purposes. You
          can ask us to delete your data at any time (see &ldquo;Your
          rights&rdquo; below) and we will remove it unless we are required to
          keep it.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can request access to, correction of, or deletion of your personal
          data. To make a request, contact us using the details below and we
          will respond within a reasonable time.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We take reasonable measures to protect your information. However, no
          method of transmission or storage is completely secure, so we cannot
          guarantee absolute security. Please only upload photos you are
          comfortable sharing.
        </p>
      </Section>

      <Section title="Children's privacy">
        <p>
          Palmist is not directed to children under 16, and we do not knowingly
          collect personal information from them. If you believe a child has
          provided us data, please contact us so we can remove it.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. When we do, we
          will revise the &ldquo;Last updated&rdquo; date above. Continued use of
          the service after changes means you accept the updated policy.
        </p>
      </Section>

      <Section title="Contact us">
        <p>
          Questions about your privacy? Reach us through our{" "}
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
