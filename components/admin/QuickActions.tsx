// 📁 components/admin/QuickActions.tsx

import Link from "next/link";
import { UtensilsCrossed, BarChart3, Bell } from "lucide-react";

const actions = [
  {
    label: "Add New Dish",
    description: "Create a menu item",
    icon: UtensilsCrossed,
    iconColor: "text-admin-accent",
    iconBg: "bg-admin-accent/10",
    href: "/admin/menu",
  },
  {
    label: "View Reports",
    description: "Sales & analytics",
    icon: BarChart3,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    href: "/admin",
  },
  {
    label: "Send Notification",
    description: "Notify customers",
    icon: Bell,
    iconColor: "text-admin-amber",
    iconBg: "bg-admin-amber/10",
    href: "/admin",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-[16px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
      {/* ── Header ── */}
      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
          Shortcuts
        </p>
        <h3 className="mt-0.5 font-heading text-[16px] font-bold text-admin-text">
          Quick Actions
        </h3>
      </div>

      {/* ── Action cards ── */}
      <div className="mt-4 flex flex-wrap gap-3">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center gap-3 rounded-[12px] bg-admin-bg px-4 py-3 ring-1 ring-black/[0.05] transition-all duration-200 hover:bg-white hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:ring-black/[0.08]"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.iconBg} transition-transform duration-200 group-hover:scale-110`}
            >
              <a.icon size={16} className={a.iconColor} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-[13px] font-bold text-admin-text">
                {a.label}
              </span>
              <span className="font-body text-[11px] text-admin-muted">
                {a.description}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
