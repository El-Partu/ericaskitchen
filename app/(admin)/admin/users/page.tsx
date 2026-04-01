"use client";

import { useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminUsers, useUpdateUser } from "@/lib/hooks/useAdmin";
import { SlideUp, FadeIn } from "@/components/ui/Animations";

const LIMIT = 15;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers({
    ...(debouncedSearch && { search: debouncedSearch }),
    page,
    limit: LIMIT,
  });
  const { mutate: updateUser } = useUpdateUser();

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout((window as any).__userSearchTimer);
    (window as any).__userSearchTimer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  };

  const handleToggleActive = (id: string, active: boolean) => {
    setUpdatingId(id);
    updateUser(
      { id, payload: { active: !active } },
      {
        onSuccess: () => {
          toast.success(`User ${!active ? "activated" : "deactivated"}`);
          setUpdatingId(null);
        },
        onError: () => {
          toast.error("Failed to update user");
          setUpdatingId(null);
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      {/* ── Heading ── */}
      <FadeIn>
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
            Admin
          </p>
          <h1 className="mt-0.5 font-heading text-[22px] font-bold text-admin-text">
            User Management
          </h1>
        </div>
      </FadeIn>

      <SlideUp delay={0.1}>
        <div className="rounded-[16px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
          {/* ── Toolbar ── */}
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:min-w-[240px] sm:flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
              />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-[10px] bg-admin-bg py-2.5 pl-8 pr-3 font-body text-[13px] text-admin-text ring-1 ring-black/[0.08] placeholder:text-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-accent/30 transition-all duration-150"
              />
            </div>
            {pagination && (
              <span className="font-body text-[12px] text-admin-muted sm:ml-auto">
                {pagination.total.toLocaleString()} users total
              </span>
            )}
          </div>

          <div className="px-4 pb-2 pt-0 sm:hidden">
            <p className="font-body text-[11px] text-admin-muted">
              Showing essential columns on mobile.
            </p>
          </div>

          {/* ── Table ── */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left sm:min-w-0">
              <thead>
                <tr className="border-y border-black/[0.06] bg-admin-bg">
                  <th className="py-2.5 pl-4 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                    Name
                  </th>
                  <th className="hidden py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted lg:table-cell">
                    Email
                  </th>
                  <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                    Role
                  </th>
                  <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                    Verified
                  </th>
                  <th className="hidden py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted md:table-cell">
                    Joined
                  </th>
                  <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                    Status
                  </th>
                  <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: LIMIT }).map((_, i) => (
                      <tr key={i} className="border-b border-black/[0.05]">
                        <td className="py-3 pl-4">
                          <div className="h-3.5 animate-pulse rounded-full bg-[#f0ebe5]" />
                        </td>
                        <td className="hidden py-3 lg:table-cell">
                          <div className="h-3.5 animate-pulse rounded-full bg-[#f0ebe5]" />
                        </td>
                        <td className="py-3">
                          <div className="h-3.5 animate-pulse rounded-full bg-[#f0ebe5]" />
                        </td>
                        <td className="py-3">
                          <div className="h-3.5 animate-pulse rounded-full bg-[#f0ebe5]" />
                        </td>
                        <td className="hidden py-3 md:table-cell">
                          <div className="h-3.5 animate-pulse rounded-full bg-[#f0ebe5]" />
                        </td>
                        <td className="py-3">
                          <div className="h-3.5 animate-pulse rounded-full bg-[#f0ebe5]" />
                        </td>
                        <td className="py-3">
                          <div className="h-3.5 animate-pulse rounded-full bg-[#f0ebe5]" />
                        </td>
                      </tr>
                    ))
                  : users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-black/[0.05] transition-colors duration-150 hover:bg-admin-bg/60"
                      >
                        {/* Name */}
                        <td className="py-3 pl-4 font-body text-[13px] font-semibold text-admin-text">
                          {user.name}
                        </td>

                        {/* Email */}
                        <td className="hidden py-3 font-body text-[13px] text-admin-muted lg:table-cell">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="py-3">
                          <span className="rounded-full bg-admin-bg px-2.5 py-0.5 font-body text-[11px] font-semibold capitalize text-admin-text ring-1 ring-black/[0.06]">
                            {user.role.name}
                          </span>
                        </td>

                        {/* Verified */}
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                              user.emailVerified
                                ? "bg-green-500/10 text-green-700"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {user.emailVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="hidden py-3 font-body text-[13px] text-admin-muted md:table-cell">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-GH",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                              user.active
                                ? "bg-green-500/10 text-green-700"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {user.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3">
                          <button
                            onClick={() =>
                              handleToggleActive(user._id, user.active)
                            }
                            disabled={updatingId === user._id}
                            title={
                              user.active ? "Deactivate user" : "Activate user"
                            }
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-[11px] font-semibold transition-all duration-150 disabled:opacity-50 ${
                              user.active
                                ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                : "bg-green-500/10 text-green-700 hover:bg-green-500/20"
                            }`}
                          >
                            {user.active ? (
                              <UserX size={12} />
                            ) : (
                              <UserCheck size={12} />
                            )}
                            <span className="hidden sm:inline">
                              {user.active ? "Deactivate" : "Activate"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}

                {!isLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center">
                      <p className="font-body text-[13px] text-admin-muted">
                        No users found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {pagination && pagination.pages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] px-4 py-3">
              <span className="font-body text-[12px] text-admin-muted">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-bg text-admin-muted transition-colors hover:bg-admin-accent/10 hover:text-admin-accent disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="min-w-[40px] text-center font-body text-[13px] font-bold text-admin-text">
                  {page}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                  disabled={page === pagination.pages}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-bg text-admin-muted transition-colors hover:bg-admin-accent/10 hover:text-admin-accent disabled:opacity-40"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </SlideUp>
    </div>
  );
}
