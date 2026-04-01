"use client";

import {
  Users,
  ShoppingCart,
  UtensilsCrossed,
  Truck,
  CalendarDays,
  Clock,
} from "lucide-react";
import { SlideIn, SlideUp } from "@/components/ui/Animations";
import { motion } from "framer-motion";

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-primary shadow-[0_4px_12px_rgba(235,108,108,0.30)]">
        {icon}
      </div>
      <div>
        <p className="font-heading text-[17px] font-bold">{title}</p>
        <p className="mt-0.5 font-body text-[15px] leading-relaxed text-foreground/60">
          {description}
        </p>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: <Users size={22} className="text-white" />,
    title: "3,000+ Customers",
    description: "Proudly served over three thousand satisfied customers",
  },
  {
    icon: <UtensilsCrossed size={22} className="text-white" />,
    title: "Dine-In",
    description: "A warm, welcoming environment to sit and enjoy your meal",
  },
  {
    icon: <ShoppingCart size={22} className="text-white" />,
    title: "Order Online",
    description: "Order from wherever you are during our working hours",
  },
  {
    icon: <Truck size={22} className="text-white" />,
    title: "Fast Delivery",
    description: "Quick and reliable delivery right to your door",
  },
];

export default function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
      <SlideUp>
        <div className="flex items-end gap-4">
          <h2 className="font-heading text-2xl font-semibold">About Us</h2>
          <div className="mb-1 h-0.5 w-12 bg-primary" />
        </div>
      </SlideUp>

      <div className="mt-10 grid gap-16 lg:grid-cols-2">
        {/* Left — story + features */}
        <SlideIn direction="left">
          <p className="font-body text-lg leading-relaxed text-foreground/70">
            We started Erica&apos;s Kitchen with one simple mission: to make the
            food we were craving but couldn&apos;t find. No white tablecloths,
            no pretension — just bold flavors, high-quality ingredients, and a
            seat at the table for everyone. Whether you&apos;re grabbing a quick
            lunch between meetings or settling in for a weekend feast,
            we&apos;ve got the fuel you need to keep going.
          </p>

          {/* Feature grid — plain div, no StaggerContainer */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.08,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <FeatureItem {...f} />
              </motion.div>
            ))}
          </div>
        </SlideIn>

        {/* Right — hours card */}
        <SlideIn direction="right">
          <div className="flex h-full flex-col justify-center gap-6">
            {/* Hours card */}
            <div className="rounded-[24px] bg-[#f5f0eb] p-8">
              <p className="font-body text-sm font-semibold uppercase tracking-widest text-foreground/40">
                Opening Hours
              </p>
              <div className="mt-6 space-y-5">
                {/* Days */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-[0_4px_12px_rgba(235,108,108,0.30)]">
                    <CalendarDays size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-heading text-[17px] font-bold">
                      Monday – Saturday
                    </p>
                    <p className="font-body text-sm text-foreground/50">
                      We&apos;re closed on Sundays
                    </p>
                  </div>
                </div>

                <div className="h-px bg-black/[0.07]" />

                {/* Time */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-[0_4px_12px_rgba(235,108,108,0.30)]">
                    <Clock size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-heading text-[17px] font-bold">
                      11:00 AM – 6:00 PM
                    </p>
                    <p className="font-body text-sm text-foreground/50">
                      Last orders at 5:45 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA inside card */}
              <div className="mt-8 rounded-[14px] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                <p className="font-body text-sm text-foreground/50">
                  Need help planning your visit?
                </p>
                <a
                  href="/contact"
                  className="mt-1 inline-flex items-center gap-1.5 font-heading text-[15px] font-bold text-primary hover:underline"
                >
                  Contact us →
                </a>
              </div>
            </div>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
