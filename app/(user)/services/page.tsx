// 📁 app/(user)/services/page.tsx

"use client";

import HeroSection from "@/components/shared/HeroSection";
import ServiceCard from "@/components/shared/ServiceCard";
import { StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import { services } from "@/lib/mock-data";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <HeroSection
        image="/images/hero-services.jpg"
        imageAlt="Highlights of Our Catering Services"
        title={
          <>
            Highlights of Our
            <br />
            Catering Services
          </>
        }
      />

      {/* ── Services grid ── */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <StaggerItem key={service.id}>
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-primary px-6 py-16 text-center">
        <h2 className="font-heading text-3xl font-black text-white">
          Ready to book us?
        </h2>
        <p className="mx-auto mt-3 max-w-md font-body text-[15px] leading-relaxed text-white/75">
          Get in touch with us to discuss catering and event services.
        </p>
        <Link
          href="/contact"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-body text-sm font-bold text-primary shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all hover:bg-primary-pink hover:shadow-[0_4px_20px_rgba(0,0,0,0.16)]"
        >
          Contact Us
          <ChevronRight size={15} />
        </Link>
      </section>
    </>
  );
}
