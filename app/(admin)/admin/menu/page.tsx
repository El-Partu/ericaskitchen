// 📁 app/(admin)/admin/menu/page.tsx

"use client";

import { useState, useCallback } from "react";
import AdminProfileCard from "@/components/admin/AdminProfileCard";
import MenuStatsBar from "@/components/admin/MenuStatsBar";
import MenuItemsTable from "@/components/admin/MenuItemsTable";
import AvailabilityPanel from "@/components/admin/AvailabilityPanel";
import MenuToolbar from "@/components/admin/MenuToolbar";
import ExtraItemsPanel from "@/components/admin/ExtraItemsPanel";
import { SlideIn, SlideUp, FadeIn } from "@/components/ui/Animations";
import { useAdminProfile } from "@/lib/hooks/useAdmin";

export interface MenuFilters {
  search: string;
  isAvailable: string;
  date: string;
}

const DEFAULT_FILTERS: MenuFilters = {
  search: "",
  isAvailable: "",
  date: "",
};

type Tab = "menu-items" | "extra-items";

export default function AdminMenuPage() {
  const { data: profile, isLoading: profileLoading } = useAdminProfile();
  const [filters, setFilters] = useState<MenuFilters>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<Tab>("menu-items");

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GH", {
        month: "long",
        year: "numeric",
      })
    : undefined;

  const handleSearch = useCallback(
    (value: string) => setFilters((f) => ({ ...f, search: value })),
    [],
  );
  const handleStatusChange = useCallback(
    (value: string) => setFilters((f) => ({ ...f, isAvailable: value })),
    [],
  );
  const handleDateChange = useCallback(
    (value: string) => setFilters((f) => ({ ...f, date: value })),
    [],
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Left: Profile card */}
      <SlideIn direction="left">
        <AdminProfileCard
          name={profile?.name}
          role={profile?.role?.name}
          email={profile?.email}
          phone={profile?.phoneNumber}
          avatar={profile?.avatar}
          memberSince={memberSince}
          isLoading={profileLoading}
        />
      </SlideIn>

      {/* Right: Menu management */}
      <div className="min-w-0 flex-1 space-y-5">
        <FadeIn>
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
              Admin
            </p>
            <h1 className="mt-0.5 font-heading text-[22px] font-bold text-admin-text">
              Menu Management
            </h1>
          </div>
        </FadeIn>

        <SlideUp delay={0.1}>
          <MenuStatsBar />
        </SlideUp>

        {/* Tabs */}
        <FadeIn delay={0.15}>
          <div className="flex gap-0 overflow-x-auto border-b border-[#d1d1d1] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["menu-items", "extra-items"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 font-body text-[13px] font-semibold transition-colors sm:px-5 sm:text-sm ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-[#6b6b6b] hover:text-[#2a2a2a]"
                }`}
              >
                {tab === "menu-items" ? "Menu Items" : "Extra Items"}
              </button>
            ))}
          </div>
        </FadeIn>

        <SlideUp delay={0.2}>
          {activeTab === "menu-items" ? (
            <>
              <MenuToolbar
                search={filters.search}
                isAvailable={filters.isAvailable}
                date={filters.date}
                onSearch={handleSearch}
                onStatusChange={handleStatusChange}
                onDateChange={handleDateChange}
              />
              <div className="mt-5 flex flex-col overflow-hidden rounded-[16px] ring-1 ring-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.06)] lg:flex-row">
                <MenuItemsTable filters={filters} />
                <AvailabilityPanel />
              </div>
            </>
          ) : (
            <div className="overflow-hidden rounded-[16px] ring-1 ring-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <ExtraItemsPanel />
            </div>
          )}
        </SlideUp>
      </div>
    </div>
  );
}
