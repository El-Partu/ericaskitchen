// 📁 app/(user)/payment/callback/page.tsx

"use client";

import { useVerifyPayment } from "@/lib/hooks/useOrders";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? "";
  const router = useRouter();

  const { data, isLoading, isError, failureCount } =
    useVerifyPayment(reference);

  const paymentStatus = data?.payment?.status;

  // Redirect to order detail on success
  useEffect(() => {
    if (paymentStatus === "success" && data?.payment?.order) {
      setTimeout(() => {
        router.push(`/orders/${data.payment.order}`);
      }, 2000);
    }
  }, [paymentStatus, data, router]);

  if (!reference) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-text font-body">Invalid payment reference.</p>
          <Link
            href="/"
            className="text-primary hover:underline font-body text-sm mt-2 inline-block"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  // FIX: distinguish "still loading / retrying" from "exhausted retries with pending status"
  // isLoading covers the initial fetch; failureCount < 3 covers mid-retry pauses.
  const isStillVerifying =
    isLoading || (paymentStatus === "pending" && failureCount < 3);

  // Treat exhausted retries with a still-pending status the same as a hard error,
  // since we can't confirm success — show the failure UI and let the user check orders.
  const showFailure =
    (!isStillVerifying && (paymentStatus === "failed" || isError)) ||
    (!isStillVerifying && paymentStatus === "pending");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-light rounded-2xl shadow-sm p-8 text-center">
        {isStillVerifying && (
          <div className="py-8">
            <div className="w-10 h-10 border-4 border-primary-pink border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-text font-body">
              Verifying payment…
            </p>
            {/* Reassure the user if we're on a retry */}
            {paymentStatus === "pending" && (
              <p className="text-xs text-gray-text font-body mt-2">
                This is taking a moment — still checking with Paystack…
              </p>
            )}
          </div>
        )}

        {!isStillVerifying && paymentStatus === "success" && (
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
              Payment successful!
            </h1>
            <p className="text-sm text-gray-text font-body mb-6">
              Your order has been placed. Redirecting to your order…
            </p>
            {data?.payment?.order && (
              <Link
                href={`/orders/${data.payment.order}`}
                className="text-sm text-primary font-medium hover:underline font-body"
              >
                View order →
              </Link>
            )}
          </div>
        )}

        {showFailure && (
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
              {paymentStatus === "pending"
                ? "Payment pending"
                : "Payment failed"}
            </h1>
            <p className="text-sm text-gray-text font-body mb-6">
              {paymentStatus === "pending"
                ? "We couldn't confirm your payment yet. Check your orders — it may still go through."
                : "Your payment could not be completed. You have not been charged."}
            </p>
            <div className="flex flex-col gap-2">
              {paymentStatus !== "pending" && (
                <Link
                  href="/checkout"
                  className="inline-block bg-primary hover:bg-primary-light text-white font-semibold rounded-xl py-3 px-8 text-sm transition-colors font-body"
                >
                  Try again
                </Link>
              )}
              <Link
                href="/orders"
                className="text-sm text-gray-text hover:text-foreground font-body"
              >
                View my orders
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
