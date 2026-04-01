// 📁 components/ui/Toaster.tsx
// Drop-in replacement. Render <Toaster /> once in your root layout

"use client";

import { Toaster as Sonner } from "sonner";
import type { ComponentProps } from "react";

type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <>
      <style>{`

        /* ── Shell ─────────────────────────────────────────────────────── */
        [data-sonner-toast] {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          width: 356px !important;
          max-width: calc(100vw - 32px) !important;
          padding: 12px 14px !important;
          background: #ffffff !important;
          border-radius: 14px !important;
          border: 1px solid rgba(0,0,0,0.07) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.04) !important;
          font-family: inherit !important;
          overflow: hidden !important;
        }

        /* ── Left accent bar ───────────────────────────────────────────── */
        [data-sonner-toast]::before {
          content: "" !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          bottom: 0 !important;
          width: 3.5px !important;
          background: #d9d9d9 !important;
          border-radius: 14px 0 0 14px !important;
        }
        [data-sonner-toast][data-type="success"]::before { background: #22c55e !important; }
        [data-sonner-toast][data-type="error"]::before   { background: #eb6c6c !important; }
        [data-sonner-toast][data-type="warning"]::before { background: #f59e0b !important; }
        [data-sonner-toast][data-type="info"]::before    { background: #60a5fa !important; }

        /* ── Icon circle ───────────────────────────────────────────────── */
        [data-sonner-toast] [data-icon] {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          background: #f5f0eb !important;
          margin-left: 4px !important;
        }
        [data-sonner-toast][data-type="success"] [data-icon] { background: rgba(34,197,94,0.12) !important; }
        [data-sonner-toast][data-type="error"]   [data-icon] { background: rgba(235,108,108,0.12) !important; }
        [data-sonner-toast][data-type="warning"] [data-icon] { background: rgba(245,158,11,0.12) !important; }
        [data-sonner-toast][data-type="info"]    [data-icon] { background: rgba(96,165,250,0.12) !important; }

        [data-sonner-toast] [data-icon] svg {
          width: 15px !important;
          height: 15px !important;
          flex-shrink: 0 !important;
        }
        [data-sonner-toast][data-type="success"] [data-icon] svg { color: #22c55e !important; }
        [data-sonner-toast][data-type="error"]   [data-icon] svg { color: #eb6c6c !important; }
        [data-sonner-toast][data-type="warning"] [data-icon] svg { color: #f59e0b !important; }
        [data-sonner-toast][data-type="info"]    [data-icon] svg { color: #60a5fa !important; }

        /* ── Content ───────────────────────────────────────────────────── */
        [data-sonner-toast] [data-content] {
          flex: 1 !important;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 1px !important;
        }

        [data-sonner-toast] [data-title] {
          font-size: 13px !important;
          font-weight: 700 !important;
          line-height: 1.35 !important;
          color: rgba(0,0,0,0.88) !important;
          margin: 0 !important;
          font-family: var(--font-heading), sans-serif !important;
        }

        [data-sonner-toast] [data-description] {
          font-size: 12px !important;
          font-weight: 400 !important;
          line-height: 1.5 !important;
          color: rgba(0,0,0,0.42) !important;
          margin: 0 !important;
          font-family: var(--font-body), sans-serif !important;
        }

        /* ── Close button ──────────────────────────────────────────────── */
        /*
          Sonner injects the close button as a sibling of [data-content],
          inside the toast flex row. We override ALL positioning so it sits
          naturally at the end of the flex row.
        */
        [data-sonner-toast] [data-close-button] {
          all: unset !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          width: 22px !important;
          height: 22px !important;
          border-radius: 50% !important;
          background: rgba(0,0,0,0.05) !important;
          color: rgba(0,0,0,0.35) !important;
          cursor: pointer !important;
          transition: background 0.15s, color 0.15s !important;
          /* forcibly remove Sonner's absolute positioning */
          position: static !important;
          top: unset !important;
          left: unset !important;
          right: unset !important;
          bottom: unset !important;
          transform: none !important;
          margin-left: 2px !important;
        }
        [data-sonner-toast] [data-close-button]:hover {
          background: rgba(0,0,0,0.10) !important;
          color: rgba(0,0,0,0.75) !important;
        }
        [data-sonner-toast] [data-close-button] svg {
          width: 11px !important;
          height: 11px !important;
          display: block !important;
        }

        /* ── Action / cancel buttons ───────────────────────────────────── */
        [data-sonner-toast] [data-button] {
          border-radius: 999px !important;
          background: #eb6c6c !important;
          color: #ffffff !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 3px 10px !important;
          border: none !important;
          box-shadow: 0 2px 6px rgba(235,108,108,0.28) !important;
          transition: opacity 0.15s !important;
          cursor: pointer !important;
          font-family: var(--font-body), sans-serif !important;
        }
        [data-sonner-toast] [data-button]:hover { opacity: 0.85 !important; }

        [data-sonner-toast] [data-cancel] {
          border-radius: 999px !important;
          background: #f5f0eb !important;
          color: rgba(0,0,0,0.55) !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 3px 10px !important;
          border: none !important;
          transition: background 0.15s !important;
          cursor: pointer !important;
          font-family: var(--font-body), sans-serif !important;
        }
        [data-sonner-toast] [data-cancel]:hover { background: #ede8e3 !important; }

        /* ── Loading spinner ───────────────────────────────────────────── */
        [data-sonner-toast] [data-loader] { color: #eb6c6c !important; }

      `}</style>

      <Sonner
        position="top-right"
        closeButton
        duration={4000}
        gap={8}
        {...props}
      />
    </>
  );
}
