// 📁 app/(customer)/profile/page.tsx

"use client";

import { useAuth } from "@/lib/auth-context";
import { patch, ApiError } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    newPasswordConfirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: "Passwords do not match",
    path: ["newPasswordConfirm"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // ── Profile form ──────────────────────────────────────────────────────────
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      await patch("/auth/update-profile", {
        name: values.name,
        phoneNumber: values.phoneNumber || undefined,
      });
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch (error) {
      const msg =
        error instanceof ApiError ? error.message : "Failed to update profile.";
      toast.error(msg);
    }
  };

  // ── Password form ─────────────────────────────────────────────────────────
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      await patch("/auth/update-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        newPasswordConfirm: values.newPasswordConfirm,
      });
      resetPassword();
      toast.success("Password updated successfully.");
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : "Failed to update password.";
      toast.error(msg);
    }
  };

  const inputClass =
    "w-full border border-gray-light rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition font-body disabled:opacity-50";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 md:px-8">
      <h1 className="text-2xl font-black text-foreground font-heading">
        My Profile
      </h1>

      {/* Profile info */}
      <div className="bg-white border border-gray-light rounded-2xl p-6">
        <h2 className="font-bold text-foreground font-heading mb-4">
          Personal information
        </h2>

        {/* Email — read only */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground font-body mb-1">
            Email address
          </label>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className={inputClass}
            />
            {user?.emailVerified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-body whitespace-nowrap">
                Verified
              </span>
            )}
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-1">
              Full name
            </label>
            <input
              {...registerProfile("name")}
              type="text"
              disabled={profileSubmitting}
              className={inputClass}
            />
            {profileErrors.name && (
              <p className="mt-1 text-xs text-primary-red font-body">
                {profileErrors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-1">
              Phone number{" "}
              <span className="text-gray-text font-normal">(optional)</span>
            </label>
            <input
              {...registerProfile("phoneNumber")}
              type="tel"
              placeholder="+233201234567"
              disabled={profileSubmitting}
              className={inputClass}
            />
            {profileErrors.phoneNumber && (
              <p className="mt-1 text-xs text-primary-red font-body">
                {profileErrors.phoneNumber.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={profileSubmitting}
            className="bg-primary hover:bg-primary-light text-white font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors disabled:opacity-50 font-body"
          >
            {profileSubmitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Change password — only for local auth */}
      {user?.authMethod === "local" && (
        <div className="bg-white border border-gray-light rounded-2xl p-6">
          <h2 className="font-bold text-foreground font-heading mb-4">
            Change password
          </h2>

          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground font-body mb-1">
                Current password
              </label>
              <input
                {...registerPassword("currentPassword")}
                type={showPassword ? "text" : "password"}
                disabled={passwordSubmitting}
                className={inputClass}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-xs text-primary-red font-body">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground font-body mb-1">
                New password
              </label>
              <input
                {...registerPassword("newPassword")}
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                disabled={passwordSubmitting}
                className={inputClass}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-primary-red font-body">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground font-body mb-1">
                Confirm new password
              </label>
              <input
                {...registerPassword("newPasswordConfirm")}
                type={showPassword ? "text" : "password"}
                disabled={passwordSubmitting}
                className={inputClass}
              />
              {passwordErrors.newPasswordConfirm && (
                <p className="mt-1 text-xs text-primary-red font-body">
                  {passwordErrors.newPasswordConfirm.message}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="bg-primary hover:bg-primary-light text-white font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors disabled:opacity-50 font-body"
              >
                {passwordSubmitting ? "Updating…" : "Update password"}
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-text font-body cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="accent-primary"
                />
                Show passwords
              </label>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
