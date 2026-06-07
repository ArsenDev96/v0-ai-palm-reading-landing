"use server"

import { sendEmail } from "@/lib/email/mailer"

const MAX_MESSAGE_LENGTH = 4000

type ContactResult = { ok: true } | { ok: false; error: string }

/** Escape user input before dropping it into the notification email's HTML. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Send a visitor's "contact us" message to the support inbox. Replies go
 * straight to the visitor via Reply-To. Configure the destination with
 * CONTACT_RECIPIENT (falls back to the sending mailbox).
 */
export async function submitContact(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()

  if (!name) {
    return { ok: false, error: "Please tell us your name." }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." }
  }
  if (message.length < 10) {
    return { ok: false, error: "Please add a few more details so we can help." }
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "That message is a little too long. Please shorten it." }
  }

  const to =
    process.env.CONTACT_RECIPIENT ||
    process.env.MAIL_FROM_EMAIL ||
    process.env.SMTP_USER

  if (!to) {
    console.log("[v0] contact not configured — no recipient address")
    return { ok: false, error: "Contact isn't available right now. Please try later." }
  }

  try {
    await sendEmail({
      to,
      replyTo: email,
      subject: `New contact message from ${name}`,
      html: buildContactEmail({ name, email, message }),
    })
  } catch (e) {
    console.log("[v0] contact send error:", (e as Error).message)
    return { ok: false, error: "We couldn't send your message. Please try again." }
  }

  return { ok: true }
}

function buildContactEmail({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>")

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf7f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
            <tr>
              <td style="padding:28px 32px 8px;">
                <p style="margin:0;text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#a06a8c;font-weight:600;">Contact form</p>
                <h1 style="margin:8px 0 0;font-size:22px;color:#1a1a1a;">New message from ${escapeHtml(name)}</h1>
                <p style="margin:10px 0 0;color:#666;font-size:14px;">From: <a href="mailto:${escapeHtml(email)}" style="color:#a06a8c;">${escapeHtml(email)}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 28px;">
                <div style="padding:16px;background:#faf7f5;border-radius:12px;color:#333;font-size:14px;line-height:1.7;">${safeMessage}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
