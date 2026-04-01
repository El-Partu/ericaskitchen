"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useTestimonials } from "@/lib/hooks/useMenu";
import { SlideUp } from "@/components/ui/Animations";
import { motion } from "framer-motion";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

function TestimonialSkeleton() {
  return (
    <div className="flex animate-pulse flex-col rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3 w-3 rounded-full bg-[#ede8e3]" />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 rounded-full bg-[#ede8e3]" />
        <div className="h-4 w-4/5 rounded-full bg-[#ede8e3]" />
        <div className="h-4 w-3/5 rounded-full bg-[#ede8e3]" />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-[#ede8e3]" />
        <div className="space-y-2">
          <div className="h-3.5 w-24 rounded-full bg-[#ede8e3]" />
          <div className="h-3 w-16 rounded-full bg-[#ede8e3]" />
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const { data: testimonials, isLoading } = useTestimonials();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
      <SlideUp>
        <div className="flex items-end gap-4">
          <h2 className="font-heading text-2xl font-semibold">
            What our customers say
          </h2>
          <div className="mb-1 h-0.5 w-12 bg-primary" />
        </div>
      </SlideUp>

      {isLoading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <TestimonialSkeleton key={i} />
          ))}
        </div>
      ) : testimonials && testimonials.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex flex-col rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
              {/* Stars */}
              <StarRating rating={t.rating} />

              {/* Quote */}
              <p className="mt-4 flex-1 font-body text-[15px] leading-relaxed text-foreground/70">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Menu item tag */}
              {t.menuItem && (
                <span className="mt-3 inline-block w-fit rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-[12px] font-medium text-primary">
                  {t.menuItem.name}
                </span>
              )}

              {/* Divider */}
              <div className="my-5 h-px bg-black/[0.05]" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#f5f0eb]">
                  {t.user.avatar ? (
                    <Image
                      src={t.user.avatar}
                      alt={t.user.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/15">
                      <span className="font-heading text-sm font-bold uppercase text-primary">
                        {t.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-body text-[14px] font-semibold text-foreground">
                    {t.user.name}
                  </p>
                  <p className="font-body text-[12px] text-foreground/40">
                    Verified customer
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[24px] bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <p className="font-body text-base text-foreground/40">
            No testimonials yet — be the first to leave a review!
          </p>
        </div>
      )}
    </section>
  );
}
