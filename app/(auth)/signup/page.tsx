// 📁 app/(auth)/signup/page.tsx

"use client";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
        phoneNumber: values.phoneNumber || undefined,
      });
      toast.success("Account created! Please check your email to verify.");
      router.replace("/verify-email");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 409) {
          toast.error("An account with this email already exists.");
        } else {
          toast.error(error.message ?? "Signup failed. Please try again.");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-gray-light rounded-2xl shadow-sm p-8">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-foreground font-heading mb-1">
            Create your account
          </h1>
          <p className="text-sm text-gray-text font-body">
            Join Erica&apos;s Kitchen and start ordering
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-1">
              Full name
            </label>
            <input
              {...register("name")}
              type="text"
              autoComplete="name"
              placeholder="Abena Mensah"
              disabled={isSubmitting}
              className="w-full border border-gray-light rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 font-body"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-primary-red font-body">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-1">
              Email address
            </label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="w-full border border-gray-light rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 font-body"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-primary-red font-body">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-1">
              Phone number{" "}
              <span className="text-gray-text font-normal">(optional)</span>
            </label>
            <input
              {...register("phoneNumber")}
              type="tel"
              autoComplete="tel"
              placeholder="+233201234567"
              disabled={isSubmitting}
              className="w-full border border-gray-light rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 font-body"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-primary-red font-body">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                disabled={isSubmitting}
                className="w-full border border-gray-light rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 font-body pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text hover:text-foreground transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532 3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 4.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-primary-red font-body">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-1">
              Confirm password
            </label>
            <input
              {...register("passwordConfirm")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full border border-gray-light rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 font-body"
            />
            {errors.passwordConfirm && (
              <p className="mt-1 text-xs text-primary-red font-body">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-light text-white font-semibold rounded-xl py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body mt-2"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-text font-body">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
