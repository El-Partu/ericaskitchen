// 📁 components/admin/SettingsForm.tsx
//
// GET   /admin/profile   → pre-populate name, email, phone, avatar
// PATCH /admin/profile   → { name, phoneNumber }
// PATCH /admin/password  → { currentPassword, newPassword, newPasswordConfirm }

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  useUpdatePassword,
} from "@/lib/hooks/useAdmin";

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-[10px] bg-admin-bg px-3 py-2.5 font-body text-[13px] text-admin-text " +
  "ring-1 ring-black/[0.08] placeholder:text-admin-muted " +
  "focus:outline-none focus:ring-2 focus:ring-admin-accent/30 " +
  "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150";

const labelCls =
  "font-body text-[12px] font-semibold uppercase tracking-widest text-admin-muted";

// ── Labelled field wrapper ────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ── Password field ────────────────────────────────────────────────────────────
function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted transition-colors hover:text-admin-text"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </Field>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  eyebrow,
  children,
  footer,
}: {
  icon: React.ElementType;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-accent/10">
          <Icon size={16} className="text-admin-accent" />
        </div>
        <div>
          <p className={labelCls}>{eyebrow}</p>
          <h3 className="mt-0.5 font-heading text-[16px] font-bold text-admin-text">
            {title}
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-4">{children}</div>

      <div className="mt-5 flex border-t border-black/[0.06] pt-4 sm:justify-end">
        {footer}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SettingsForm() {
  const { data: profile, isLoading } = useAdminProfile();
  const { mutate: updateProfile, isPending: savingProfile } =
    useUpdateAdminProfile();
  const { mutate: updatePassword, isPending: savingPassword } =
    useUpdatePassword();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phoneNumber ?? "");
    }
  }, [profile]);

  const handleProfileSave = () => {
    updateProfile(
      { name, phoneNumber: phone },
      {
        onSuccess: () => toast.success("Profile updated successfully"),
        onError: (e: any) =>
          toast.error(e?.message ?? "Failed to update profile"),
      },
    );
  };

  const handlePasswordSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    updatePassword(
      { currentPassword, newPassword, newPasswordConfirm: confirmPassword },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (e: any) =>
          toast.error(e?.message ?? "Failed to update password"),
      },
    );
  };

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-[200px] animate-pulse rounded-[16px] bg-[#f0ebe5]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* ── Left: Forms ── */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Profile Settings */}
        <SectionCard
          icon={User}
          eyebrow="Account"
          title="Profile Settings"
          footer={
            <button
              onClick={handleProfileSave}
              disabled={savingProfile}
              className="w-full rounded-full bg-admin-accent px-6 py-2 font-body text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(160,58,26,0.25)] transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {savingProfile ? "Saving…" : "Save Profile"}
            </button>
          }
        >
          <Field label="Full Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Email address">
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              className={inputCls}
            />
            <p className="mt-1 font-body text-[11px] text-admin-muted">
              Email cannot be changed here.
            </p>
          </Field>

          <Field label="Phone number">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
            />
          </Field>
        </SectionCard>

        {/* Change Password */}
        <SectionCard
          icon={Lock}
          eyebrow="Security"
          title="Change Password"
          footer={
            <button
              onClick={handlePasswordSave}
              disabled={savingPassword}
              className="w-full rounded-full bg-admin-accent px-6 py-2 font-body text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(160,58,26,0.25)] transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {savingPassword ? "Updating…" : "Update Password"}
            </button>
          }
        >
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </SectionCard>
      </div>

      {/* ── Right: Avatar ── */}
      <div className="order-first mx-auto flex w-full max-w-sm flex-col items-center lg:order-none lg:mx-0 lg:w-[200px] lg:shrink-0">
        <div className="flex w-full flex-col items-center rounded-[16px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
          <p className={`${labelCls} self-start`}>Photo</p>

          {/* Avatar */}
          <div className="relative mt-4 h-[120px] w-[120px] overflow-hidden rounded-full bg-admin-bg shadow-[0_4px_16px_rgba(0,0,0,0.10)] sm:h-[140px] sm:w-[140px]">
            {profile?.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-admin-accent">
                <span className="font-heading text-5xl font-bold uppercase text-white">
                  {profile?.name?.charAt(0) ?? "A"}
                </span>
              </div>
            )}
          </div>

          <p className="mt-3 text-center font-heading text-[14px] font-bold text-admin-text">
            {profile?.name ?? "—"}
          </p>
          <p className="mt-0.5 font-body text-[11px] capitalize text-admin-muted">
            {profile?.role?.name ?? "Admin"}
          </p>

          <button
            onClick={() => toast.info("Photo upload coming soon.")}
            className="mt-4 w-full rounded-full bg-admin-bg py-2 font-body text-[12px] font-semibold text-admin-text ring-1 ring-black/[0.08] transition-all hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          >
            Change Photo
          </button>
        </div>
      </div>
    </div>
  );
}
