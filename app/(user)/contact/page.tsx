"use client";

import Image from "next/image";
import ContactInfo from "@/components/shared/ContactInfo";
import ContactForm from "@/components/shared/ContactForm";
import { SlideIn, FadeIn } from "@/components/ui/Animations";

export default function ContactPage() {
  return (
    <>
      {/* ── Hero — image only ── */}
      <section className="relative h-[500px] w-full sm:h-[600px] lg:h-[750px]">
        <div className="absolute inset-0 overflow-hidden rounded-b-[50px]">
          <Image
            src="/images/hero-contact.jpg"
            alt="Contact Erica's Kitchen"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle bottom gradient so the section below reads cleanly */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
        </div>
      </section>

      {/* ── Info + Form ── */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2">
          <SlideIn direction="left">
            <ContactInfo />
          </SlideIn>
          <SlideIn direction="right" delay={0.15}>
            <ContactForm />
          </SlideIn>
        </div>
      </section>

      {/* ── Map ── */}
      <FadeIn>
        <section className="relative h-[350px] w-full sm:h-[420px] lg:h-[512px]">
          <Image
            src="/images/contact-map.jpg"
            alt="Erica's Kitchen location map"
            fill
            className="object-cover"
          />
        </section>
      </FadeIn>
    </>
  );
}
