"use client";

import LiveOrderTracker from "@/components/customer/LiveOrderTracker";
import LoyaltyPointsCard from "@/components/customer/LoyaltyPointsCard";
import RecentOrdersGrid from "@/components/customer/RecentOrdersGrid";
import { useAuth } from "@/lib/auth-context";
import { useMyOrders } from "@/lib/hooks/useOrders";
import { SlideUp, FadeIn } from "@/components/ui/Animations";
import { ShoppingBag, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)]"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-body text-[14px] font-semibold text-foreground">
          {label}
        </p>
        <p className="font-body text-[12px] text-foreground/40">
          {description}
        </p>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 text-foreground/20 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  );
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { data: ordersData } = useMyOrders({ limit: 1, page: 1 });

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const totalOrders = ordersData?.pagination?.total ?? 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-[1376px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 md:space-y-8 md:px-8">
      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <SlideUp>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-body text-sm text-foreground/40">{greeting}</p>
            <h1 className="mt-0.5 font-heading text-2xl font-black text-foreground">
              {firstName} 👋
            </h1>
          </div>

          {/* Quick stats */}
          <div className="hidden items-center gap-6 sm:flex">
            <div className="text-right">
              <p className="font-heading text-xl font-black text-foreground">
                {totalOrders}
              </p>
              <p className="font-body text-[12px] text-foreground/40">
                Total orders
              </p>
            </div>
            <div className="h-10 w-px bg-black/[0.06]" />
            <div className="text-right">
              <p className="font-heading text-xl font-black text-foreground">
                —
              </p>
              <p className="font-body text-[12px] text-foreground/40">
                Loyalty points
              </p>
            </div>
          </div>
        </div>
      </SlideUp>

      {/* ── Live order tracker ─────────────────────────────────────────────── */}
      <SlideUp delay={0.05}>
        <LiveOrderTracker />
      </SlideUp>

      {/* ── Two column: quick actions + loyalty ───────────────────────────── */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick actions */}
          <div className="space-y-3">
            <h2 className="font-heading text-[15px] font-bold text-foreground">
              Quick actions
            </h2>
            <QuickActionCard
              icon={ShoppingBag}
              label="Browse Menu"
              description="Explore our full Ghanaian menu"
              href="/menu"
              color="bg-primary/10 text-primary"
            />
            <QuickActionCard
              icon={MapPin}
              label="My Addresses"
              description="Manage your delivery addresses"
              href="/addresses"
              color="bg-blue-50 text-blue-500"
            />
          </div>

          {/* Loyalty points */}
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-[15px] font-bold text-foreground">
              Rewards
            </h2>
            <LoyaltyPointsCard />
          </div>
        </div>
      </FadeIn>

      {/* ── Recent orders ─────────────────────────────────────────────────── */}
      <SlideUp delay={0.15}>
        <RecentOrdersGrid />
      </SlideUp>
    </div>
  );
}
