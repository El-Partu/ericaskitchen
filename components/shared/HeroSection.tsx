"use client";

import Image from "next/image";
import { motion, type Easing } from "framer-motion";
import Button from "@/components/ui/Button";

const ease: Easing = [0.25, 0.1, 0.25, 1];

interface HeroSectionProps {
  image?: string;
  imageAlt?: string;
  title: React.ReactNode;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function HeroSection({
  image = "/images/hero-bg.jpg",
  imageAlt = "Delicious Ghanaian food",
  title,
  subtitle,
  ctaLabel = "View Menu",
  ctaHref = "/menu",
}: HeroSectionProps) {
  return (
    <section className="relative h-[500px] w-full sm:h-[600px] lg:h-[750px]">
      <div className="absolute inset-0 overflow-hidden rounded-b-[50px]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Richer gradient — darker at bottom-left where text sits */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-12">
        <div className="max-w-[700px]">
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease }}
            className="font-heading text-4xl font-black leading-tight text-white sm:text-5xl lg:text-[64px] lg:leading-[1.1]"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease }}
              className="mt-4 max-w-md font-body text-base text-white/75 lg:text-lg"
            >
              {subtitle}
            </motion.p>
          )}

          {ctaLabel && ctaHref && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease }}
              className="mt-10"
            >
              <Button href={ctaHref} size="lg">
                {ctaLabel}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
