"use client";

import Image from "next/image";
import { motion, type Easing } from "framer-motion";
import Button from "@/components/ui/Button";

const ease: Easing = [0.25, 0.1, 0.25, 1];

export default function BookServiceBanner() {
  return (
    <section className="relative h-[400px] w-full overflow-hidden sm:h-[470px] lg:h-[570px]">
      {/* Background image */}
      <Image
        src="/images/services-cta.jpg"
        alt="Book our service"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
          className="font-heading text-5xl font-black text-white sm:text-7xl lg:text-[96px]"
        >
          Book our Service
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          className="mt-8"
        >
          <Button href="/contact" variant="primary-light" size="lg">
            CONTACT US
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
