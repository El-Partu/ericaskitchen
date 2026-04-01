// 📁 components/customer/LoyaltyPointsCard.tsx

"use client";

import { Gift, Star, ChevronRight } from "lucide-react";

export default function LoyaltyPointsCard() {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {/* Decorative background ring */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/8" />

      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Gift size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-[15px] font-bold text-foreground">
              Loyalty Points
            </h3>
            <p className="mt-0.5 font-body text-sm text-foreground/40">
              Earn rewards on every order
            </p>
          </div>
        </div>

        {/* Points display */}
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1 opacity-30">
            <span className="font-heading text-3xl font-black text-foreground">
              —
            </span>
            <span className="font-body text-sm text-foreground/60">pts</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-black/[0.05]" />

      {/* Coming soon banner */}
      <div className="flex items-center justify-between rounded-[12px] bg-[#f5f0eb] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Star size={14} className="text-amber-400" />
          <span className="font-body text-[13px] font-medium text-foreground/70">
            Loyalty programme launching soon
          </span>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-body text-[11px] font-semibold text-amber-700">
          Coming soon
        </span>
      </div>
    </div>
  );
}
