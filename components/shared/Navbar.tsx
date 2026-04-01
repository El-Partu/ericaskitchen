// 📁 components/shared/Navbar.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import AnimatedLogo from "@/components/shared/AnimatedLogo";

const ease = [0.25, 0.1, 0.25, 1] as const;

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Services", href: "/services" },
  { label: "Contact Us", href: "/contact" },
];

const userMenuLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ClipboardList, label: "My Orders", href: "/orders" },
  { icon: MapPin, label: "My Addresses", href: "/addresses" },
  { icon: Settings, label: "Profile", href: "/profile" },
];

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout, isLoading } =
    useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const roleName = user?.role?.name?.toLowerCase();
  const canSeeAdminPanel =
    isAdmin &&
    Boolean(roleName && ["admin", "super_admin", "staff"].includes(roleName));

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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className="w-full border-b border-black/[0.07] bg-white"
    >
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* ── Animated logo ── */}
        <AnimatedLogo />

        {/* ── Nav links ── */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-heading text-[15px] font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-[22px] left-0 h-0.5 w-full bg-primary"
                    transition={{ duration: 0.25, ease }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right-side actions ── */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f0eb] text-foreground/70 transition-all duration-200 hover:bg-primary/10 hover:text-primary md:hidden"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f0eb] text-foreground/70 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            aria-label="Cart"
          >
            <ShoppingCart size={19} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-body text-[10px] font-bold leading-none text-white shadow-[0_2px_6px_rgba(235,108,108,0.45)]"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <div ref={dropdownRef} className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-all duration-200 hover:bg-[#f5f0eb]"
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary shadow-[0_2px_8px_rgba(235,108,108,0.35)]">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-heading text-[13px] font-bold uppercase text-white">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="hidden font-body text-[13px] font-semibold text-foreground/80 sm:block">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`hidden text-foreground/40 transition-transform duration-200 sm:block ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 6 }}
                        transition={{ duration: 0.18, ease }}
                        className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[16px] border border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)]"
                      >
                        <div className="border-b border-black/[0.07] px-4 py-3">
                          <p className="truncate font-body text-[13px] font-semibold text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate font-body text-[12px] text-foreground/45">
                            {user.email}
                          </p>
                        </div>

                        <div className="py-1.5">
                          {userMenuLinks.map(({ icon: Icon, label, href }) => (
                            <Link
                              key={href}
                              href={href}
                              className="flex items-center gap-3 px-4 py-2.5 font-body text-[13px] text-foreground/70 transition-colors duration-150 hover:bg-[#f5f0eb] hover:text-foreground"
                            >
                              <Icon
                                size={15}
                                className="shrink-0 text-foreground/40"
                              />
                              {label}
                            </Link>
                          ))}

                          {canSeeAdminPanel && (
                            <>
                              <div className="mx-4 my-1.5 h-px bg-black/[0.07]" />
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-2.5 font-body text-[13px] font-semibold text-admin-accent transition-colors duration-150 hover:bg-[#f5f0eb]"
                              >
                                <LayoutDashboard
                                  size={15}
                                  className="shrink-0"
                                />
                                Admin Panel
                              </Link>
                              {isSuperAdmin && (
                                <Link
                                  href="/admin/super"
                                  className="flex items-center gap-3 px-4 py-2.5 font-body text-[13px] font-semibold text-admin-accent transition-colors duration-150 hover:bg-[#f5f0eb]"
                                >
                                  <LayoutDashboard
                                    size={15}
                                    className="shrink-0"
                                  />
                                  Super Admin
                                </Link>
                              )}
                            </>
                          )}

                          <div className="mx-4 my-1.5 h-px bg-black/[0.07]" />
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 font-body text-[13px] text-red-500 transition-colors duration-150 hover:bg-red-50"
                          >
                            <LogOut size={15} className="shrink-0" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 font-heading text-[13px] font-semibold text-foreground/70 transition-colors duration-200 hover:bg-[#f5f0eb] hover:text-foreground"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-primary px-5 py-2 font-heading text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)] transition-all duration-200 hover:opacity-90 hover:shadow-[0_4px_16px_rgba(235,108,108,0.40)]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close mobile menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease }}
              className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease }}
              className="fixed right-0 top-0 z-[60] flex h-screen w-[82vw] max-w-[360px] flex-col bg-white shadow-[-12px_0_32px_rgba(0,0,0,0.14)] md:hidden"
            >
              <div className="flex items-center justify-between border-b border-black/6 px-4 py-4">
                <AnimatedLogo />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb] text-foreground/70"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <nav className="space-y-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block rounded-[12px] px-3 py-2.5 font-heading text-[15px] font-semibold transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/75 hover:bg-[#f5f0eb]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                {!isLoading && (
                  <div className="mt-5 border-t border-black/6 pt-4">
                    {isAuthenticated && user ? (
                      <>
                        <p className="px-3 font-body text-[12px] text-foreground/45">
                          Signed in as
                        </p>
                        <p className="mb-2 truncate px-3 font-body text-[13px] font-semibold text-foreground">
                          {user.email}
                        </p>

                        <div className="space-y-1">
                          {userMenuLinks.map(({ icon: Icon, label, href }) => (
                            <Link
                              key={href}
                              href={href}
                              className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-body text-[14px] text-foreground/75 transition-colors hover:bg-[#f5f0eb]"
                            >
                              <Icon size={16} className="text-foreground/45" />
                              {label}
                            </Link>
                          ))}

                          {canSeeAdminPanel && (
                            <>
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-body text-[14px] font-semibold text-admin-accent transition-colors hover:bg-[#f5f0eb]"
                              >
                                <LayoutDashboard size={16} />
                                Admin Panel
                              </Link>
                              {isSuperAdmin && (
                                <Link
                                  href="/admin/super"
                                  className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-body text-[14px] font-semibold text-admin-accent transition-colors hover:bg-[#f5f0eb]"
                                >
                                  <LayoutDashboard size={16} />
                                  Super Admin
                                </Link>
                              )}
                            </>
                          )}

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-1 flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left font-body text-[14px] text-red-500 transition-colors hover:bg-red-50"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/login"
                          className="block rounded-full border border-black/10 px-4 py-2.5 text-center font-heading text-[13px] font-semibold text-foreground/70"
                        >
                          Login
                        </Link>
                        <Link
                          href="/signup"
                          className="block rounded-full bg-primary px-4 py-2.5 text-center font-heading text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)]"
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
