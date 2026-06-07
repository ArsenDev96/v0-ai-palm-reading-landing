"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Mail, MessageCircle, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { submitContact } from "@/app/actions/contact"

export function ContactSection() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please tell us your name.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }
    if (message.trim().length < 10) {
      setError("Please add a few more details so we can help.")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("message", message)

      const res = await submitContact(formData)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Contact us
        </p>
        <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Something not working?
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          If your reading didn&apos;t arrive or anything went wrong, leave us a
          message and we&apos;ll get back to you by email.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-border bg-card p-6 sm:p-8">
        {sent ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-semibold text-foreground">
              Message sent
            </h3>
            <p className="mt-3 max-w-sm text-pretty leading-relaxed text-muted-foreground">
              Thanks for reaching out — we&apos;ll reply to{" "}
              <span className="font-medium text-foreground">{email}</span> as
              soon as we can.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-name"
                  className="text-sm font-medium text-foreground"
                >
                  Your name
                </label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="h-12 bg-background"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id="contact-email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 bg-background"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-message"
                className="text-sm font-medium text-foreground"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what happened — e.g. your reading didn't arrive, the upload failed, or the result looked wrong."
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <MessageCircle className="size-4" aria-hidden="true" />
              )}
              {submitting ? "Sending..." : "Send message"}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Mail className="size-3.5" aria-hidden="true" />
              We&apos;ll only use your email to reply to you.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
