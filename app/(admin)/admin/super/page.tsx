"use client";

import SuperAdminSettingsPanel from "@/components/admin/SuperAdminSettingsPanel";
import { FadeIn, SlideUp } from "@/components/ui/Animations";

export default function SuperAdminPage() {
  return (
    <div className="space-y-5">
      <FadeIn>
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
            Super Admin
          </p>
          <h1 className="mt-0.5 font-heading text-[22px] font-bold text-admin-text">
            Runtime Commerce Settings
          </h1>
          <p className="mt-1 font-body text-[13px] text-admin-muted">
            Manage processing fees, promo codes, and commission configuration.
          </p>
        </div>
      </FadeIn>

      <SlideUp delay={0.08}>
        <SuperAdminSettingsPanel />
      </SlideUp>
    </div>
  );
}
