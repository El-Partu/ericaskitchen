// 📁 components/admin/RecentActivity.tsx

"use client";

import { ShoppingCart, Utensils, Users } from "lucide-react";
import { useRecentActivity } from "@/lib/hooks/useAnalytics";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP: Record<
  string,
  { icon: typeof ShoppingCart; color: string; bg: string }
> = {
  order: {
    icon: ShoppingCart,
    color: "text-admin-accent",
    bg: "bg-admin-accent/10",
  },
  menu: { icon: Utensils, color: "text-admin-amber", bg: "bg-admin-amber/10" },
  user: { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
};

function getIconConfig(type: string) {
  return ICON_MAP[type] ?? ICON_MAP.order;
}

function Skeleton() {
  return (
    <div className="space-y-1 divide-y divide-black/[0.05]">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[#f0ebe5]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/5 animate-pulse rounded-full bg-[#f0ebe5]" />
            <div className="h-3 w-1/4 animate-pulse rounded-full bg-[#f0ebe5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity();

  return (
    <div className="rounded-[16px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
            Live Feed
          </p>
          <h3 className="mt-0.5 font-heading text-[16px] font-bold text-admin-text">
            Recent Activity
          </h3>
        </div>
        {/* Pulse dot — indicates live data */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="font-body text-[11px] text-admin-muted">Live</span>
        </div>
      </div>

      {/* ── List ── */}
      <div className="mt-4">
        {isLoading ? (
          <Skeleton />
        ) : activities?.length ? (
          <div className="divide-y divide-black/[0.05]">
            {activities.map((a) => {
              // Icon is driven by a.data.resource (e.g. "user", "order")
              // falling back to a.type ("audit") → default order icon
              const {
                icon: Icon,
                color,
                bg,
              } = getIconConfig(a.data?.resource ?? a.type);

              // Real timestamp field is "timestamp", not "createdAt"
              const date = a.timestamp ? new Date(a.timestamp) : null;
              const timeAgo =
                date && !isNaN(date.getTime())
                  ? formatDistanceToNow(date, { addSuffix: true })
                  : "recently";

              // Actor is nested at a.data.actor.name
              const actorName = a.data?.actor?.name;

              // Unique key is a.data.logId
              const key = a.data?.logId ?? `${a.title}-${a.timestamp}`;

              return (
                <div key={key} className="flex items-start gap-3 py-3">
                  {/* Icon circle */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}
                  >
                    <Icon size={14} className={color} />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[13px] font-semibold leading-snug text-admin-text">
                      {a.description}
                      {actorName && (
                        <span className="font-normal text-admin-muted">
                          {" "}
                          by {actorName}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 font-body text-[11px] text-admin-muted">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[12px] bg-admin-bg px-4 py-6 text-center">
            <p className="font-body text-[13px] text-admin-muted">
              No recent activity yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
