// 📁 app/(auth)/verify-email/[token]/page.tsx

"use client";

import { get, ApiError } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch((error) => {
        setStatus("error");
        if (error instanceof ApiError) {
          setMessage(error.message ?? "This link is invalid or has expired.");
        } else {
          setMessage("Something went wrong. Please try again.");
        }
      });
  }, [token]);

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-gray-light rounded-2xl shadow-sm p-8 text-center">
        {status === "loading" && (
          <div className="py-8">
            <div className="w-10 h-10 border-4 border-primary-pink border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-text font-body">
              Verifying your email…
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-black text-foreground font-heading mb-2">
              Email verified!
            </h1>
            <p className="text-sm text-gray-text font-body mb-6">
              Your email has been confirmed. You can now sign in.
            </p>
            <Link
              href="/login"
              className="inline-block bg-primary hover:bg-primary-light text-white font-semibold rounded-xl py-3 px-8 text-sm transition-colors font-body"
            >
              Sign in
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#ff0000"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-black text-foreground font-heading mb-2">
              Verification failed
            </h1>
            <p className="text-sm text-gray-text font-body mb-6">
              {message || "This link is invalid or has expired."}
            </p>
            <Link
              href="/login"
              className="text-sm text-primary font-medium hover:underline font-body"
            >
              ← Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
