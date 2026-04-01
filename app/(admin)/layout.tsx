"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAdminProfile } from "@/lib/hooks/useAdmin";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

const navTabs = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Menu", href: "/admin/menu" },
  { label: "Live Tracking", href: "/admin/tracking" },
  { label: "Users", href: "/admin/users" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated, isAdmin, isSuperAdmin, isLoading } =
    useAuth();
  const { data: profile } = useAdminProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSuperRoute = pathname.startsWith("/admin/super");
  const visibleTabs = isSuperAdmin
    ? [...navTabs, { label: "Super Settings", href: "/admin/super" }]
    : navTabs;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/admin");
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      router.replace("/");
    } else if (!isLoading && isAuthenticated && isSuperRoute && !isSuperAdmin) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, isAdmin, isSuperAdmin, isSuperRoute, router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (
    isLoading ||
    !isAuthenticated ||
    !isAdmin ||
    (isSuperRoute && !isSuperAdmin)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* ── Top Bar ── */}
      <header className="flex h-[58px] items-center justify-between bg-admin-dark px-4 md:px-8">
        {/* Left — brand */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px]"
            style={{ background: "rgba(160,58,26,0.75)" }}
          >
            <span className="font-heading text-[11px] font-black uppercase text-white">
              EK
            </span>
          </div>
          <span className="hidden font-heading text-[15px] font-bold tracking-wide text-white/80 sm:block">
            Erica&apos;s Kitchen
          </span>
          <span className="rounded-full bg-admin-accent/60 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-widest text-white/70">
            Admin
          </span>
        </div>

        {/* Right — profile dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 transition-colors duration-150 hover:bg-white/[0.07] sm:gap-2.5 sm:px-3"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {/* Avatar */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-admin-accent/70">
              {profile?.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="font-heading text-[11px] font-bold uppercase text-white">
                  {profile?.name?.charAt(0) ?? "A"}
                </span>
              )}
            </div>

            {/* Name — hidden below sm */}
            <span className="hidden font-body text-[13px] font-semibold text-white/75 sm:block">
              {profile?.name ?? "Admin"}
            </span>

            {/*
              ChevronDown — hidden below sm alongside the name.
              Previously it was always rendered, creating an orphaned [avatar][▾]
              on mobile that looked like a broken button.
            */}
            <ChevronDown
              size={13}
              className={`hidden text-white/40 transition-transform duration-200 sm:block ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{ duration: 0.16, ease }}
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-[14px] border border-white/[0.08] bg-admin-dark shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
              >
                {/* User info */}
                <div className="border-b border-white/[0.08] px-4 py-3">
                  <p className="truncate font-body text-[13px] font-semibold text-white/80">
                    {profile?.name ?? "Admin"}
                  </p>
                  <p className="truncate font-body text-[11px] text-white/35">
                    {profile?.email ?? ""}
                  </p>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 font-body text-[13px] text-red-400 transition-colors duration-150 hover:bg-white/[0.07]"
                  >
                    <LogOut size={14} className="shrink-0" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/*
        ── Navigation Bar ────────────────────────────────────────────────────────
        Wraps the scrollable tab strip in a relative container so we can apply
        a right-side fade mask. The mask gives users a visual affordance that
        more tabs exist off-screen at narrow widths — previously there was no
        indicator at all, tabs just disappeared silently.

        The `after:` pseudo-element gradient fades out on the right edge.
        It's pointer-events-none so it doesn't block tab clicks.
      */}
      <div className="relative border-b border-black/[0.10] bg-white after:pointer-events-none after:absolute after:right-0 after:top-0 after:h-full after:w-8 after:bg-gradient-to-l after:from-white after:to-transparent sm:after:hidden">
        <nav className="flex h-[44px] items-stretch gap-0.5 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleTabs.map((tab) => {
            const isActive =
              tab.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex shrink-0 items-center whitespace-nowrap px-3.5 font-body text-[12px] font-semibold transition-colors duration-150 sm:px-4 sm:text-[13px] ${
                  isActive
                    ? "text-admin-accent"
                    : "text-admin-muted hover:text-admin-text"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="admin-nav-active"
                    className="absolute bottom-0 left-0 h-[2.5px] w-full rounded-t-full bg-admin-accent"
                    transition={{ duration: 0.22, ease }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Content ── */}
      <main className="mx-auto max-w-[1200px] p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
