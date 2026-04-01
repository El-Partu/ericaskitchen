"use client";

// API endpoints consumed by this page:
//  GET   /admin/profile   → AdminProfileCard + SettingsForm (pre-populate fields)
//  PATCH /admin/profile   → SettingsForm (save name, phoneNumber)
//  PATCH /admin/password  → SettingsForm (change password)

import AdminProfileCard from "@/components/admin/AdminProfileCard";
import SettingsForm from "@/components/admin/SettingsForm";
import { SlideIn, FadeIn } from "@/components/ui/Animations";
import { useAdminProfile } from "@/lib/hooks/useAdmin";

export default function SettingsPage() {
  const { data: profile, isLoading: profileLoading } = useAdminProfile();

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GH", {
        month: "long",
        year: "numeric",
      })
    : undefined;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* ── Left: Profile card ── */}
      <SlideIn direction="left" className="w-full md:max-w-[320px] lg:w-auto">
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

      {/* ── Right: Settings content ── */}
      <div className="min-w-0 flex-1 space-y-5">
        <FadeIn>
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
              Admin
            </p>
            <h1 className="mt-0.5 font-heading text-[22px] font-bold text-admin-text">
              Settings
            </h1>
          </div>
        </FadeIn>

        <SlideIn direction="right" delay={0.15}>
          <SettingsForm />
        </SlideIn>
      </div>
    </div>
  );
}
