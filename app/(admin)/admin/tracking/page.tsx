"use client";

import { MapPin, Truck, Radio, Bell } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/ui/Animations";

const PLANNED_FEATURES = [
  {
    icon: MapPin,
    label: "Live Map View",
    description: "Real-time driver location on an interactive map",
  },
  {
    icon: Truck,
    label: "Delivery Tracking",
    description: "Step-by-step order status from kitchen to doorstep",
  },
  {
    icon: Radio,
    label: "Driver Communication",
    description: "Call or message drivers directly from the dashboard",
  },
  {
    icon: Bell,
    label: "Live Order Feed",
    description: "Incoming orders and delay alerts in real time",
  },
];

export default function AdminTrackingPage() {
  return (
    <FadeIn>
      <div className="flex min-h-[560px] flex-col items-center justify-center rounded-[20px] bg-admin-dark px-4 py-10 text-center sm:px-6 sm:py-14 md:px-8 md:py-16">
        {/* ── Animated pulse icon ── */}
        <SlideUp>
          <div className="relative mb-8 flex items-center justify-center">
            {/* Outer ping rings */}
            <span className="absolute h-24 w-24 animate-ping rounded-full bg-admin-accent-light/20" />
            <span className="absolute h-16 w-16 animate-ping rounded-full bg-admin-accent-light/30 [animation-delay:0.3s]" />
            {/* Icon circle */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-admin-accent/80 shadow-[0_0_32px_rgba(160,58,26,0.45)]">
              <Truck size={28} className="text-white" />
            </div>
          </div>
        </SlideUp>

        {/* ── Heading ── */}
        <SlideUp delay={0.08}>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Coming Soon
          </p>
          <h1 className="mt-2 font-heading text-[24px] font-black text-white sm:text-[28px] md:text-[32px]">
            Live Order Tracking
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-[14px] leading-relaxed text-white/50">
            We&apos;re building a real-time delivery tracking system — live map,
            driver updates, and instant order status — all in one place.
          </p>
        </SlideUp>

        {/* ── Planned features ── */}
        <SlideUp delay={0.16}>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {PLANNED_FEATURES.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-[14px] bg-white/[0.05] px-4 py-3.5 text-left ring-1 ring-white/[0.07]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-admin-accent/20">
                  <Icon size={15} className="text-admin-accent-light" />
                </div>
                <div>
                  <p className="font-heading text-[13px] font-bold text-white">
                    {label}
                  </p>
                  <p className="mt-0.5 font-body text-[12px] leading-relaxed text-white/45">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SlideUp>

        {/* ── Status pill ── */}
        <SlideUp delay={0.22}>
          <div className="mt-10 flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 ring-1 ring-white/[0.08]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-admin-amber opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-admin-amber" />
            </span>
            <span className="font-body text-[12px] font-semibold text-white/50">
              In development — check back soon
            </span>
          </div>
        </SlideUp>
      </div>
    </FadeIn>
  );
}
