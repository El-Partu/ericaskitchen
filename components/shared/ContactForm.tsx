// 📁 components/shared/ContactForm.tsx

"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

const inputCls =
  "w-full rounded-[12px] border border-black/[0.10] bg-[#f5f0eb] px-4 py-3 " +
  "font-body text-[14px] text-foreground placeholder:text-foreground/35 " +
  "transition-all duration-200 focus:border-primary/40 focus:bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

const labelCls =
  "mb-1.5 block font-body text-[12px] font-semibold uppercase tracking-widest text-foreground/50";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((p) => ({ ...p, [key]: e.target.value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent!", {
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  }

  return (
    <div>
      {/* ── Heading ── */}
      <div className="flex items-center gap-4">
        <span className="h-0.5 w-12 bg-primary" />
        <span className="font-heading text-[13px] font-bold uppercase tracking-[0.2em] text-foreground/50">
          Send a message
        </span>
      </div>
      <h2 className="mt-3 font-heading text-[32px] font-bold leading-tight">
        Your Details
      </h2>
      <p className="mt-2 font-body text-[15px] text-foreground/60">
        Let us know how to get back to you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Name + Email */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={set("name")}
              placeholder="Your name"
              required
              disabled={isSubmitting}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email address</label>
            <input
              type="email"
              value={formData.email}
              onChange={set("email")}
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
              className={inputCls}
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className={labelCls}>Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={set("subject")}
            placeholder="What's this about?"
            required
            disabled={isSubmitting}
            className={inputCls}
          />
        </div>

        {/* Message */}
        <div>
          <label className={labelCls}>Message</label>
          <textarea
            value={formData.message}
            onChange={set("message")}
            rows={7}
            placeholder="Type your message here…"
            required
            disabled={isSubmitting}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary px-8 py-3 font-body text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)] transition-all hover:opacity-90 hover:shadow-[0_4px_16px_rgba(235,108,108,0.40)] active:scale-[0.98] disabled:opacity-60 disabled:shadow-none"
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
