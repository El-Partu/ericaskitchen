"use client";

import { Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function LiveOrderPanel() {
  return (
    <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[320px]">
      {/* ── Title ────────────────────── */}
      <h1 className="font-body text-2xl font-bold text-white">
        Live Order Tracking
      </h1>

      {/* ── Active Order Card ────────── */}
      <div className="rounded-lg border border-[#FFB62C] p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-body text-lg font-semibold text-white">
            #A45C
          </span>
          <span className="rounded bg-[#FF4D4D] px-2 py-0.5 font-body text-[10px] font-semibold text-white">
            DELAYED
          </span>
        </div>

        {/* Items */}
        <div className="mt-3 space-y-0.5">
          <p className="font-body text-[13px] text-[#FFB62C]">
            2x Jellie Rice with Grilled Chicken
          </p>
          <p className="font-body text-[13px] text-[#FFB62C]">
            1x Banku &amp; Okro Soup
          </p>
        </div>
      </div>

      {/* ── Order Details / Timeline ─── */}
      <div>
        <h3 className="font-body text-[13px] font-semibold text-white">
          Order Details
        </h3>

        <div className="mt-3 space-y-2">
          {/* Step 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center">
                <Clock size={11} className="text-white" />
              </div>
              <span className="font-body text-[13px] text-white">
                Order Received
              </span>
            </div>
            <span className="font-body text-[11px] text-[#A0A3B1]">
              12:10 PM
            </span>
          </div>

          {/* Dot separator */}
          <div className="ml-[7px] flex flex-col gap-1">
            <div className="h-[5px] w-[5px] rounded-full bg-white" />
            <div className="h-[5px] w-[5px] rounded-full bg-white" />
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="14" rx="2" />
                </svg>
              </div>
              <span className="font-body text-[13px] text-white">
                Kitchen Confirmed
              </span>
            </div>
            <span className="font-body text-[11px] text-[#A0A3B1]">
              12:15 PM
            </span>
          </div>

          {/* Step 3 — Delivery issue */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-4 w-4 items-center justify-center">
                <div className="h-3.5 w-3.5 rounded-full bg-[#FF4D4D]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-body text-[11px] text-white">
                  Out for Delivery – Driving.
                </p>
                <p className="font-body text-[11px] text-white">
                  Driver Stopped - Driver break
                </p>
              </div>
            </div>
            <span className="font-body text-[11px] text-[#A0A3B1]">…</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() =>
              toast.info("Calling driver...", {
                description: "Connecting to +233 24 XXX XXXX",
              })
            }
            className="flex items-center gap-1.5 rounded bg-[#FFB62C] px-4 py-2 font-body text-[13px] font-semibold text-black transition-colors hover:bg-[#e5a426]"
          >
            <Phone size={12} />
            Call Driver
          </button>
          <button
            onClick={() =>
              toast.info("Calling customer...", {
                description: "Connecting to +233 50 XXX XXXX",
              })
            }
            className="flex items-center gap-1.5 rounded bg-[#FFB62C] px-4 py-2 font-body text-[13px] font-semibold text-black transition-colors hover:bg-[#e5a426]"
          >
            <Phone size={12} />
            Call Customer
          </button>
        </div>
      </div>

      {/* ── Customer Details ─────────── */}
      <div>
        <h3 className="font-body text-[11px] font-semibold text-white">
          Order Details
        </h3>
        <p className="mt-1 font-body text-[11px] font-semibold text-white">
          Customer Details:
        </p>
        <p className="mt-1 font-body text-[11px] text-[#A0A3B1]">
          Ama Doe ⌕, leave at porter&apos;s lodge
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <MapPin size={9} className="text-[#A0A3B1]" />
          <span className="font-body text-[11px] text-[#A0A3B1]">
            Akuafo Main Hall
          </span>
          <span className="font-body text-[11px] text-[#A0A3B1]">12:10 PM</span>
        </div>
      </div>

      {/* ── Incoming Orders label ────── */}
      <p className="font-body text-xs font-semibold text-white">
        Incoming Orders
      </p>
    </div>
  );
}
