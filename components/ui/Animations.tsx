"use client";

import { motion, type Variants, type Easing } from "framer-motion";
import { type ReactNode } from "react";

/* ─────────────────────────────────────
   Shared easing & duration defaults
   ───────────────────────────────────── */
const ease: Easing = [0.25, 0.1, 0.25, 1]; // cubic-bezier

/* ─────────────────────────────────────
   FadeIn — simple opacity fade
   ───────────────────────────────────── */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────
   SlideUp — fade + slide from below
   ───────────────────────────────────── */
export function SlideUp({
  children,
  delay = 0,
  duration = 0.6,
  distance = 30,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────
   SlideIn — fade + slide from left/right
   ───────────────────────────────────── */
export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  duration = 0.6,
  distance = 40,
  className,
}: {
  children: ReactNode;
  direction?: "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) {
  const x = direction === "left" ? -distance : distance;
  return (
    <motion.div
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────
   ScaleIn — fade + subtle scale-up
   ───────────────────────────────────── */
export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────
   StaggerContainer + StaggerItem
   (for grids / lists with staggered children)
   ───────────────────────────────────── */
const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease },
  },
};

export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
