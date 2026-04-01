"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useDailySpecials, useMenuItems } from "@/lib/hooks/useMenu";
import { SlideUp, FadeIn } from "@/components/ui/Animations";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function ImageSkeleton() {
  return (
    <div className="relative aspect-[3/4] w-full animate-pulse overflow-hidden rounded-[24px] bg-[#ede8e3]" />
  );
}

export default function MenuOfTheDay() {
  const { data: specials, isLoading: specialsLoading } = useDailySpecials();
  const { data: featuredData, isLoading: featuredLoading } = useMenuItems({
    isFeatured: true,
    limit: 2,
  });

  const featuredItems = featuredData?.items ?? [];
  const isLoading = specialsLoading || featuredLoading;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr_1.1fr]">
        {/* ── Two food image cards ─────────────────────────────── */}
        {isLoading
          ? [0, 1].map((i) => (
              <SlideUp key={i} delay={i * 0.12}>
                <ImageSkeleton />
              </SlideUp>
            ))
          : featuredItems.slice(0, 2).map((item, i) => (
              <SlideUp key={item._id} delay={i * 0.12}>
                <Link href="/menu" className="group block">
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.10)]"
                  >
                    <Image
                      src={item.images?.[0] ?? "/images/hero-bg.jpg"}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Bottom gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Name + price */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="font-heading text-lg font-bold text-white">
                        {item.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="font-body text-sm text-white/70 line-clamp-1">
                          {item.description}
                        </p>
                        <span className="ml-3 shrink-0 font-heading text-base font-bold text-white">
                          GH₵{item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </SlideUp>
            ))}

        {/* ── Menu of the day text column ──────────────────────── */}
        <FadeIn delay={0.25}>
          <div className="lg:pt-4">
            {/* Label */}
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="font-body text-sm font-semibold uppercase tracking-widest text-primary">
                Daily Special
              </span>
            </div>

            <h2 className="mt-3 font-heading text-[38px] font-black leading-tight">
              Menu of
              <br />
              the Day
            </h2>

            <div className="mt-3 h-[3px] w-14 rounded-full bg-primary" />

            <p className="mt-6 font-body text-[15px] leading-relaxed text-foreground/60">
              Need a break from the routine? Our daily special is designed to be
              fast, fresh, and flavorful — perfect for a quick meal that
              doesn&apos;t compromise on quality.
            </p>

            {/* Today's specials */}
            <div className="mt-7">
              <p className="font-body text-[13px] font-semibold uppercase tracking-widest text-foreground/40">
                Today&apos;s Specials
              </p>

              <div className="mt-3 space-y-3">
                {specialsLoading ? (
                  <div className="space-y-3">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-[14px] bg-[#f5f0eb]"
                      />
                    ))}
                  </div>
                ) : specials && specials.length > 0 ? (
                  specials.map((special) => (
                    <div
                      key={special._id}
                      className="rounded-[14px] bg-[#f5f0eb] px-4 py-3"
                    >
                      <p className="font-body text-[14px] font-semibold text-foreground">
                        {special.title}
                      </p>
                      {special.description && (
                        <p className="mt-0.5 font-body text-[13px] text-foreground/50">
                          {special.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[14px] bg-[#f5f0eb] px-4 py-3">
                    <p className="font-body text-[14px] text-foreground/40">
                      No specials today — check back tomorrow!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <Button href="/menu" size="sm">
                Order now
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
