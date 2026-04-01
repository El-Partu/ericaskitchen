// 📁 components/shared/AnimatedLogo.tsx

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

const NAMES = ["Erica's Kitchen", "4:30"];
const INTERVAL = 4500; // ms between swaps
const LETTER_EXIT_STAGGER = 0.04; // s between each letter leaving
const LETTER_ENTER_STAGGER = 0.035; // s between each letter arriving
const LETTER_DURATION = 0.3; // s per letter transition

// Pre-compute the longest name's character count to set a stable width
const LONGEST = NAMES.reduce((a, b) => (a.length >= b.length ? a : b));

export default function AnimatedLogo() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % NAMES.length),
      INTERVAL,
    );
    return () => clearInterval(id);
  }, []);

  const name = NAMES[index];
  const chars = name.split("");

  return (
    <Link
      href="/"
      className="relative flex items-center font-heading text-[15px] font-black uppercase tracking-tight text-foreground transition-opacity hover:opacity-80 sm:text-[22px] sm:tracking-widest"
      aria-label={name}
    >
      {/*
        Invisible ghost of the longest name — keeps width stable so the
        navbar never reflows as the names swap in and out.
      */}
      <span className="invisible select-none" aria-hidden>
        {LONGEST}
      </span>

      {/*
        Animated name sits absolutely on top of the ghost,
        left-aligned so it doesn't jump around.
      */}
      <span className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={name}
            className="flex"
            // Container itself doesn't animate — only children do
            aria-label={name}
          >
            {chars.map((char, i) => (
              <motion.span
                key={`${name}-${i}`}
                className="inline-block"
                style={{ whiteSpace: "pre" }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{
                  duration: LETTER_DURATION,
                  ease: [0.22, 1, 0.36, 1],
                  // Enter: left-to-right stagger
                  delay: i * LETTER_ENTER_STAGGER,
                  // Exit uses AnimatePresence exit prop below
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </Link>
  );
}
