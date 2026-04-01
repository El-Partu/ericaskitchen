// 📁 app/(auth)/forgot-password/page.tsx

"use client";

import { post, ApiError } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await post("/auth/forgot-password", values);
      setSubmitted(true);
    } catch (error) {
      // API always returns 200 even for unknown emails (prevents enumeration)
      // so we only show an error for unexpected failures
      if (error instanceof ApiError && error.statusCode !== 200) {
        toast.error("Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-gray-light rounded-2xl shadow-sm p-8">
        {submitted ? (
          // Success state
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-primary-pink rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#eb6c6c"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-black text-foreground font-heading mb-2">
              Check your email
            </h1>
            <p className="text-sm text-gray-text font-body mb-6">
              If that email is registered, you&apos;ll receive a password reset
              link shortly.
            </p>
            <Link
              href="/login"
              className="text-sm text-primary font-medium hover:underline font-body"
            >
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-black text-foreground font-heading mb-1">
                Forgot password?
              </h1>
              <p className="text-sm text-gray-text font-body">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-light text-white font-semibold rounded-xl py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                {isSubmitting ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-text font-body">
              Remember it?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
