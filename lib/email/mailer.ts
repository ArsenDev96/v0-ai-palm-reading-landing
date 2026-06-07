/**
 * SMTP email client (Nodemailer).
 *
 * Server-only — only imported by the "use server" palm-reading action.
 * Configured for Zoho Mail by default, but works with any SMTP provider.
 *
 * Env:
 *   SMTP_HOST       e.g. smtp.zoho.com   (smtp.zoho.eu for EU accounts)
 *   SMTP_PORT       465 (SSL) or 587 (STARTTLS) — defaults to 465
 *   SMTP_USER       full mailbox address, e.g. yourfate4@zohomail.com
 *   SMTP_PASS       mailbox password or app-specific password
 *   MAIL_FROM_EMAIL from address (defaults to SMTP_USER; Zoho requires it to
 *                   match an address you own)
 *   MAIL_FROM_NAME  display name (defaults to "Palm Reading")
 */
import nodemailer, { type Transporter } from "nodemailer"

type SendEmailArgs = {
  to: string
  subject: string
  html: string
  // Optional Reply-To, e.g. so a contact form lands replies in the user's inbox.
  replyTo?: string
}

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT ?? 465)

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured — set SMTP_HOST, SMTP_USER, and SMTP_PASS.",
    )
  }

  // Reuse a single pooled transporter across invocations (the module is cached
  // per server runtime).
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      // Port 465 uses implicit TLS; 587 upgrades via STARTTLS.
      secure: port === 465,
      auth: { user, pass },
    })
  }

  return transporter
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailArgs) {
  const fromEmail = process.env.MAIL_FROM_EMAIL ?? process.env.SMTP_USER
  const fromName = process.env.MAIL_FROM_NAME ?? "Palm Reading"

  await getTransporter().sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    replyTo,
    subject,
    html,
  })
}
