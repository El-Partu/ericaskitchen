// 📁 components/customer/CustomerTopBar.tsx

"use client";

import { useAuth } from "@/lib/auth-context";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import AnimatedLogo from "@/components/shared/AnimatedLogo";

export default function CustomerTopBar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-black/[0.06] bg-white/80 px-4 backdrop-blur-md md:px-8">
      {/* Left — brand + nav */}
      <div className="flex items-center gap-4 md:gap-8">
        <AnimatedLogo />
        <nav className="hidden items-center gap-6 md:flex">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Orders", href: "/orders" },
            { label: "Addresses", href: "/addresses" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="font-body text-sm text-foreground/50 transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => toast.info("No new notifications")}
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        >
          <Bell size={18} className="text-foreground/60" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-full border border-black/10 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-black/[0.03]"
          >
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/15">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-heading text-xs font-bold text-primary">
                  {initials}
                </span>
              )}
            </div>
            <span className="hidden font-body text-sm font-medium text-foreground sm:block">
              {user?.name?.split(" ")[0] ?? "Account"}
            </span>
            <ChevronDown size={14} className="text-foreground/40" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                <div className="border-b border-black/[0.06] px-4 py-3">
                  <p className="font-body text-[13px] font-semibold text-foreground">
                    {user?.name}
                  </p>
                  <p className="truncate font-body text-[11px] text-foreground/40">
                    {user?.email}
                  </p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-[8px] px-3 py-2 font-body text-sm text-foreground/70 transition-colors hover:bg-black/[0.04] hover:text-foreground"
                  >
                    Profile settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 font-body text-sm text-red-500 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
