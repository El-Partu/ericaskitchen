// 📁 components/shared/ContactInfo.tsx

import { MapPin, Phone, Mail, Clock } from "lucide-react";

const DETAILS = [
  {
    icon: MapPin,
    label: "Address",
    lines: ["University of Ghana, Legon Pent Hall"],
  },
  {
    icon: Phone,
    label: "Phone",
    lines: ["+233 123 456 789", "+233 123 456 789"],
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["hello@ericaskitchen.com"],
  },
  {
    icon: Clock,
    label: "Hours",
    lines: ["Mon–Thu: 11 AM – 10 PM", "Fri–Sun: 11 AM – 11 PM"],
  },
];

export default function ContactInfo() {
  return (
    <div>
      {/* ── Eyebrow ── */}
      <div className="flex items-center gap-4">
        <span className="h-0.5 w-12 bg-primary" />
        <span className="font-heading text-[13px] font-bold uppercase tracking-[0.2em] text-foreground/50">
          Keep Close
        </span>
      </div>

      {/* ── Heading ── */}
      <h2 className="mt-3 font-heading text-[32px] font-bold leading-tight">
        Get In Touch
      </h2>

      {/* ── Description ── */}
      <p className="mt-4 max-w-md font-body text-[15px] leading-relaxed text-foreground/60">
        Have a question about our ingredients, hosting a large group, or just
        want to say hi? We&apos;d love to hear from you — we&apos;ll get back to
        you faster than a fresh batch of Jollof.
      </p>

      {/* ── Contact detail cards ── */}
      <div className="mt-10 grid grid-cols-2 gap-4">
        {DETAILS.map(({ icon: Icon, label, lines }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-[16px] bg-[#f5f0eb] px-4 py-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                {label}
              </p>
              {lines.map((line, i) => (
                <p
                  key={i}
                  className="mt-0.5 font-body text-[14px] text-foreground/75"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
