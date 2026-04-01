// 📁 components/admin/AdminProfileCard.tsx

"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  useUpdatePassword,
} from "@/lib/hooks/useAdmin";

interface AdminProfileCardProps {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  memberSince?: string;
  isLoading: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { mutate: updateProfile, isPending } = useUpdateAdminProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateProfile(
      { name: name.trim(), phoneNumber: phone.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Profile updated");
          onClose();
        },
        onError: () => toast.error("Failed to update profile"),
      },
    );
  };

  const inputClass =
    "w-full rounded-md border border-[#d1d1d1] px-3 py-2 font-body text-sm focus:outline-none focus:border-primary mt-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-semibold mb-4">
          Edit profile
        </h3>
        <div className="space-y-3">
          <div>
            <label className="font-body text-sm font-medium text-[#4a4f63]">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-[#4a4f63]">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233..."
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 font-body text-sm outline outline-1 outline-[#d1d1d1] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-md bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { mutate: updatePassword, isPending } = useUpdatePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSave = () => {
    if (!current || !next || !confirm) {
      toast.error("All fields are required");
      return;
    }
    if (next !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (next.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    updatePassword(
      {
        currentPassword: current,
        newPassword: next,
        newPasswordConfirm: confirm,
      },
      {
        onSuccess: () => {
          toast.success("Password updated");
          onClose();
        },
        onError: () => toast.error("Current password is incorrect"),
      },
    );
  };

  const inputClass =
    "w-full rounded-md border border-[#d1d1d1] px-3 py-2 font-body text-sm focus:outline-none focus:border-primary mt-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-semibold mb-4">
          Change password
        </h3>
        <div className="space-y-3">
          <div>
            <label className="font-body text-sm font-medium text-[#4a4f63]">
              Current password
            </label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-[#4a4f63]">
              New password
            </label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="Min. 8 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-[#4a4f63]">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 font-body text-sm outline outline-1 outline-[#d1d1d1] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-md bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Updating…" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProfileCard({
  name: nameProp,
  role: roleProp,
  email: emailProp,
  phone: phoneProp,
  avatar: avatarProp,
  memberSince: memberSinceProp,
  isLoading,
}: AdminProfileCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const name = nameProp ?? "Admin";
  const role = roleProp ?? "";
  const email = emailProp ?? "";
  const phone = phoneProp ?? "—";
  const memberSince = memberSinceProp ?? "—";
  const avatar = avatarProp;

  return (
    <>
      <div className="w-full shrink-0 overflow-hidden rounded-xl border border-gray-light bg-white shadow-sm lg:w-[280px]">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 bg-[#3f4859] px-6 pb-6 pt-8">
          {isLoading ? (
            <div className="h-20 w-20 animate-pulse rounded-full bg-white/10" />
          ) : avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-20 w-20 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary border-2 border-white/20">
              <span className="font-heading text-2xl font-semibold text-white">
                {getInitials(name)}
              </span>
            </div>
          )}
          <div className="text-center">
            {isLoading ? (
              <>
                <div className="h-5 w-32 animate-pulse rounded bg-white/10 mx-auto" />
                <div className="h-3 w-20 animate-pulse rounded bg-white/10 mx-auto mt-2" />
              </>
            ) : (
              <>
                <p className="font-body text-base font-semibold text-white">
                  {name}
                </p>
                <p className="mt-1 font-body text-xs capitalize text-white/55">
                  {role}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="divide-y divide-gray-light px-6 py-2">
          {[
            { label: "Email", value: email },
            { label: "Phone", value: phone },
            { label: "Member since", value: memberSince },
          ].map(({ label, value }) => (
            <div key={label} className="py-3">
              <p className="font-body text-[10px] uppercase tracking-wider text-gray-text">
                {label}
              </p>
              <p className="mt-0.5 font-body text-sm text-foreground break-all">
                {isLoading ? (
                  <span className="inline-block h-4 w-32 animate-pulse rounded bg-gray-light" />
                ) : (
                  value || "—"
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2 px-6 pb-5 pt-3">
          <button
            onClick={() => setShowEdit(true)}
            className="w-full rounded-xl bg-primary py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Edit profile
          </button>
          <button
            onClick={() => setShowPassword(true)}
            className="w-full rounded-xl border border-gray-light py-2.5 font-body text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Change password
          </button>
        </div>

        {/* Settings link */}
        <Link
          href="/admin/settings"
          className="flex items-center justify-center gap-2 border-t border-gray-light py-3.5 transition-colors hover:bg-gray-50"
        >
          <Settings size={14} className="text-gray-text" />
          <span className="font-body text-sm text-gray-text">Settings</span>
        </Link>
      </div>

      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      {showPassword && (
        <ChangePasswordModal onClose={() => setShowPassword(false)} />
      )}
    </>
  );
}
