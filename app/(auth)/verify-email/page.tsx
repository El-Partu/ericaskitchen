"use client";

import Link from "next/link";

export default function VerifyEmailPendingPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-light bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-pink">
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
              d="M3 8l8.28 5.52a1.3 1.3 0 0 0 1.44 0L21 8m-16 8h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z"
            />
          </svg>
        </div>

        <h1 className="mb-2 font-heading text-xl font-black text-foreground">
          Check your inbox
        </h1>
        <p className="font-body text-sm text-gray-text">
          We sent a verification link to your email address. Open the link to
          activate your account.
        </p>

        <div className="mt-6 space-y-2">
          <Link
            href="/login"
            className="block rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            Back to sign in
          </Link>
          <Link
            href="/signup"
            className="block text-sm font-medium text-primary hover:underline"
          >
            Use a different email
          </Link>
        </div>
      </div>
    </div>
  );
}
