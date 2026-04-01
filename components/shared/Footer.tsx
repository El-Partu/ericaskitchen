// 📁 components/shared/Footer.tsx

"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Linkedin, Twitter } from "lucide-react";
import NewsletterForm from "@/components/shared/NewsletterForm";
import AnimatedLogo from "@/components/shared/AnimatedLogo";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/Animations";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Services", href: "/services" },
  { label: "Contact Us", href: "/contact" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "X (Twitter)" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="bg-primary-footer text-white">
      {/*
        Vertical padding: tighter on mobile (py-10 = 40px), original on desktop (py-14 = 56px)
        Horizontal padding: tighter on mobile (px-5), original on desktop (lg:px-12)
      */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-12 lg:py-14">
        {/*
          ── Main grid ──────────────────────────────────────────────────────────
          Mobile  : 2-column grid so Quick Links + Contact sit side-by-side,
                    while Brand and Newsletter span full width (col-span-2).
          Desktop : unchanged 4-column fractional layout.

          NOTE: StaggerItem needs to forward the `className` prop to its
          motion wrapper for the col-span classes to apply. If it doesn't,
          wrap each <StaggerItem> in a <div className="col-span-…"> instead.
        */}
        <StaggerContainer className="grid grid-cols-2 gap-x-6 gap-y-8 lg:gap-10 lg:grid-cols-[2.0fr_1fr_1.2fr_1.3fr]">
          {/* ── Brand — full width on mobile, first col on desktop ─────── */}
          <StaggerItem className="col-span-2 lg:col-span-1">
            <div className="text-white [&_a]:text-white [&_a]:text-[32px]">
              <AnimatedLogo />
            </div>

            <p className="mt-3 font-heading text-[14px] font-semibold leading-relaxed text-white/75 lg:mt-4 lg:text-[15px]">
              Bringing the heart of Ghanaian flavor to your table,{" "}
              <span className="text-white">one plate at a time.</span>
            </p>

            <div className="my-4 h-0.5 w-10 rounded-full bg-white/30 lg:my-5" />

            <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Follow Us
            </p>

            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all duration-200 hover:bg-white/25 hover:-translate-y-0.5"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </StaggerItem>

          {/* ── Quick Links — left col on mobile, second col on desktop ── */}
          <StaggerItem className="col-span-1">
            <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Explore
            </p>
            <h3 className="mt-1.5 font-heading text-[17px] font-bold lg:text-[20px]">
              Quick Links
            </h3>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-white/30" />

            <nav className="mt-4 flex flex-col gap-0.5 lg:mt-5 lg:gap-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-2 py-1.5 font-body text-[14px] text-white/75 transition-all duration-200 hover:text-white"
                >
                  <span className="h-px w-2.5 shrink-0 rounded-full bg-white/40 transition-all duration-200 group-hover:w-4 group-hover:bg-white" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </StaggerItem>

          {/* ── Contact — right col on mobile (condensed), third col on desktop ── */}
          <StaggerItem className="col-span-1">
            <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Find Us
            </p>
            {/*
              Mobile: shorter heading ("Contact") saves space in the narrow column.
              Desktop: restores full "Contact & Location" heading.
            */}
            <h3 className="mt-1.5 font-heading text-[17px] font-bold lg:text-[20px]">
              <span className="lg:hidden">Contact</span>
              <span className="hidden lg:inline">Contact &amp; Location</span>
            </h3>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-white/30" />

            <div className="mt-4 flex flex-col gap-3 lg:mt-5 lg:gap-4">
              {/* Address — always visible */}
              <div>
                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-white/50">
                  Address
                </p>
                {/*
                  Force a line-break after the comma on mobile so the text
                  doesn't overflow the narrow column.
                */}
                <p className="mt-0.5 font-body text-[13px] leading-snug text-white/80 lg:text-[14px]">
                  University of Ghana, <br className="sm:hidden" />
                  Legon Pent Hall
                </p>
              </div>

              {/* Phone — always visible */}
              <div>
                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-white/50">
                  Phone
                </p>
                <a
                  href="tel:+233000000000"
                  className="mt-0.5 block font-body text-[13px] text-white/80 transition-colors duration-200 hover:text-white lg:text-[14px]"
                >
                  +233 [Phone Number]
                </a>
              </div>

              {/* Email — hidden on mobile (saves space), visible sm+ */}
              <div className="hidden sm:block">
                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-white/50">
                  Email
                </p>
                <a
                  href="mailto:hello@ericaskitchen.com"
                  className="mt-0.5 block font-body text-[14px] text-white/80 transition-colors duration-200 hover:text-white"
                >
                  hello@ericaskitchen.com
                </a>
              </div>

              {/* Hours card — hidden on mobile (too tall for narrow col), visible sm+ */}
              <div className="hidden sm:block mt-1 rounded-[14px] bg-white/10 px-4 py-3">
                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-white/50">
                  Hours
                </p>
                <p className="mt-1.5 font-body text-[13px] text-white/80">
                  Mon–Thu: 11 AM – 10 PM
                </p>
                <p className="font-body text-[13px] text-white/80">
                  Fri–Sun: 11 AM – 11 PM
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* ── Newsletter — full width on mobile, fourth col on desktop ── */}
          <StaggerItem className="col-span-2 lg:col-span-1">
            <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Newsletter
            </p>
            <h3 className="mt-1.5 font-heading text-[17px] font-bold lg:text-[20px]">
              Stay in the Loop
            </h3>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-white/30" />

            <p className="mt-3 font-body text-[13px] leading-relaxed text-white/70 lg:mt-4 lg:text-[14px]">
              Join our list for secret menu items and weekend specials.
            </p>

            {/*
              Mobile  : no card wrapper — form sits flush on the dark background.
                        Cleaner and avoids a box-inside-a-box feel on small screens.
              sm+     : restore the frosted card wrapper (matches desktop intent).
            */}
            <div className="mt-4 sm:mt-5 sm:rounded-[14px] sm:bg-white/10 sm:px-4 sm:py-4">
              <NewsletterForm />
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <FadeIn>
          <div className="mt-8 h-px w-full bg-white/20 lg:mt-12" />

          {/*
            ── Bottom bar ───────────────────────────────────────────────────
            Mobile  : stacked, centered — prevents the legal links from
                      wrapping into ragged 2-row misalignment.
            sm+     : back to the original side-by-side layout.
          */}
          <div className="mt-5 flex flex-col items-center gap-2 text-center font-body text-[13px] text-white/50 sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
            <span>© 2026 Erica&apos;s Kitchen. All rights reserved.</span>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-end sm:gap-x-5 sm:gap-y-2">
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Disclaimer", href: "/disclaimer" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors duration-200 hover:text-white"
                >
                  {/* Short label on mobile to fit in one row, full label on sm+ */}
                  <span className="sm:hidden">{item.label}</span>
                  <span className="hidden sm:inline">
                    {item.label === "Privacy"
                      ? "Privacy Policy"
                      : item.label === "Terms"
                        ? "Terms of Service"
                        : item.label}
                  </span>
                </Link>
              ))}

              <span className="hidden text-white/20 sm:inline">|</span>

              <span className="font-body text-[12px] uppercase tracking-wider text-white/35">
                Designed by TradelioTech
              </span>
            </div>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
