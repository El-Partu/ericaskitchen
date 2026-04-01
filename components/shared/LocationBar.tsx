"use client";

import { useState } from "react";
import {
  ChevronDown,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useAddresses } from "@/lib/hooks/useAddresses";

const ease = [0.25, 0.1, 0.25, 1] as const;

type OrderMode = "Delivery" | "Dine In" | "Takeaway";

const ORDER_MODES: { mode: OrderMode; icon: React.ElementType }[] = [
  { mode: "Delivery", icon: Bike },
  { mode: "Dine In", icon: UtensilsCrossed },
  { mode: "Takeaway", icon: ShoppingBag },
];

export default function LocationBar() {
  const { isAuthenticated } = useAuth();
  const { data: addresses } = useAddresses({ enabled: isAuthenticated });
  const [orderMode, setOrderMode] = useState<OrderMode>("Delivery");
  const [showDropdown, setShowDropdown] = useState(false);

  const defaultAddress = addresses?.find((a) => a.isDefault) ?? addresses?.[0];
  const locationText =
    isAuthenticated && defaultAddress
      ? defaultAddress.location
      : "Select a delivery location";

  const ActiveIcon =
    ORDER_MODES.find((o) => o.mode === orderMode)?.icon ?? Bike;

  return (
    <div className="relative z-10 mx-auto -mt-8 max-w-2xl px-6 lg:px-0">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="flex items-stretch overflow-hidden rounded-[16px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.07]"
      >
        {/* ── Location ── */}
        <div className="flex flex-1 items-center gap-3 overflow-hidden px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MapPin size={16} className="text-primary" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-foreground/40">
              Deliver to
            </span>
            <span className="truncate font-body text-[14px] font-semibold text-foreground">
              {locationText}
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="my-3 w-px bg-black/[0.08]" />

        {/* ── Order Mode Dropdown ── */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="flex h-full items-center gap-2.5 px-5 transition-colors duration-150 hover:bg-[#f5f0eb]"
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <ActiveIcon size={16} className="text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-foreground/40">
                Order as
              </span>
              <span className="font-body text-[14px] font-semibold text-foreground">
                {orderMode}
              </span>
            </div>
            <ChevronDown
              size={15}
              className={`ml-1 shrink-0 text-foreground/40 transition-transform duration-200 ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{ duration: 0.18, ease }}
                className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
              >
                <div className="p-1.5">
                  {ORDER_MODES.map(({ mode, icon: Icon }) => {
                    const isActive = orderMode === mode;
                    return (
                      <button
                        key={mode}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          setOrderMode(mode);
                          setShowDropdown(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors duration-150 ${
                          isActive
                            ? "bg-primary/8 text-primary"
                            : "text-foreground/70 hover:bg-[#f5f0eb] hover:text-foreground"
                        }`}
                      >
                        <Icon size={15} className="shrink-0" />
                        <span
                          className={`font-body text-[13px] ${isActive ? "font-semibold" : ""}`}
                        >
                          {mode}
                        </span>
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
