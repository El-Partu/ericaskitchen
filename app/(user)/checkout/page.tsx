// 📁 app/(user)/checkout/page.tsx
// FIX 1: Order summary now shows item.customization (extras) under each item name.
// FIX 2: Per-item price now uses item.lineTotal ?? item.price * item.quantity
//         (same as CartPanel) instead of item.price * item.quantity, so the
//         displayed price correctly reflects extras added by the customer.

"use client";

import { useCart } from "@/lib/cart-context";
import { useAddresses } from "@/lib/hooks/useAddresses";
import { usePlaceOrder, useInitializePayment } from "@/lib/hooks/useOrders";
import { useProcessingFee } from "@/lib/hooks/useSuperAdminSettings";
import { ApiError } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ChevronLeft, MapPin, FileText, ShoppingBag } from "lucide-react";
import { SlideUp, FadeIn } from "@/components/ui/Animations";
import type { OrderType } from "@/types";

const schema = z.object({
  addressId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

const sectionCls =
  "rounded-[24px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] sm:p-6";
const sectionHeadingCls = "font-heading text-[16px] font-bold text-foreground";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const { items, totalAmount, clearCart } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: processingFeeConfig } = useProcessingFee();
  const [processing, setProcessing] = useState(false);
  const queryPromoCode = searchParams.get("promoCode") ?? "";
  const [promoCode, setPromoCode] = useState(queryPromoCode.toUpperCase());
  // New: Payment method state (default to paystack, could be manual/other)
  const [paymentMethod, setPaymentMethod] = useState<
    "paystack" | "manual" | "other"
  >("paystack");

  const processingFeeEstimate = useMemo(() => {
    if (!processingFeeConfig) return null;
    if (processingFeeConfig.type === "fixed") {
      return processingFeeConfig.amount;
    }
    return (totalAmount * processingFeeConfig.amount) / 100;
  }, [processingFeeConfig, totalAmount]);

  const estimatedTotal =
    totalAmount +
    (processingFeeEstimate && processingFeeEstimate > 0
      ? processingFeeEstimate
      : 0);

  const orderTypeParam = searchParams.get("orderType");
  const orderType: OrderType =
    orderTypeParam === "dine_in" || orderTypeParam === "takeaway"
      ? orderTypeParam
      : "delivery";
  const isDeliveryOrder = orderType === "delivery";

  const queryAddressId = searchParams.get("addressId") ?? "";
  const queryNotes = searchParams.get("notes") ?? "";

  const defaultAddressId =
    queryAddressId || addresses?.find((a) => a.isDefault)?._id || "";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      addressId: defaultAddressId,
      notes: queryNotes,
    },
  });

  const isLoading = isSubmitting || processing;

  // ── Empty cart ──
  if (!items.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f0eb]">
            <ShoppingBag size={22} className="text-foreground/30" />
          </div>
          <p className="font-body text-[15px] text-foreground/50">
            Your cart is empty.
          </p>
          <Link
            href="/menu"
            className="rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)] transition-all hover:opacity-90"
          >
            Browse the menu
          </Link>
        </div>
      </div>
    );
  }

  // ── Processing ──
  if (processing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-pink border-t-primary" />
          <p className="font-body text-sm text-foreground/50">
            Placing your order…
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    if (isDeliveryOrder && !values.addressId) {
      setError("addressId", {
        type: "manual",
        message: "Please select a delivery address",
      });
      return;
    }

    setProcessing(true);
    try {
      // Always fetch latest cart from server before payment
      const cartRes = await fetch("/api/v1/cart", { method: "GET" });
      const cartData = await cartRes.json();
      // Prepare payment payload
      const paymentPayload = {
        cartSnapshot: cartData.data.cart,
        method: paymentMethod,
        provider: paymentMethod === "paystack" ? "paystack" : undefined,
        orderType,
        addressId: isDeliveryOrder ? values.addressId : undefined,
        notes: values.notes,
        promoCode: promoCode.trim() || undefined,
      };
      // Initiate payment
      let paymentRes;
      if (paymentMethod === "paystack") {
        paymentRes = await fetch("/api/v1/payment/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        });
      } else {
        paymentRes = await fetch("/api/v1/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        });
      }
      const paymentJson = await paymentRes.json();
      if (!paymentRes.ok)
        throw new ApiError(paymentJson.message, paymentRes.status);
      await clearCart();
      // For Paystack, redirect to authorizationUrl
      if (paymentMethod === "paystack" && paymentJson.data.authorizationUrl) {
        window.location.assign(paymentJson.data.authorizationUrl);
      } else {
        // For manual/other, show confirmation or redirect as needed
        window.location.assign("/orders");
      }
    } catch (error) {
      setProcessing(false);
      if (error instanceof ApiError) {
        if (error.statusCode === 400 && error.message.includes("address")) {
          toast.error("Please add a delivery address before ordering.");
        } else {
          toast.error(
            error.message ?? "Failed to initiate payment. Please try again.",
          );
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ── Header ── */}
        <SlideUp>
          <Link
            href="/cart"
            className="mb-5 flex w-fit items-center gap-1.5 font-body text-sm text-foreground/40 transition-colors hover:text-foreground"
          >
            <ChevronLeft size={15} />
            Back to cart
          </Link>
          <h1 className="font-heading text-2xl font-black text-foreground">
            Checkout
          </h1>
        </SlideUp>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {/* ── Left ── */}
            <div className="space-y-5 lg:col-span-2">
              {/* Delivery address */}
              {isDeliveryOrder && (
                <FadeIn delay={0.05}>
                  <div className={sectionCls}>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <MapPin size={16} className="text-primary" />
                      </div>
                      <h2 className={sectionHeadingCls}>Delivery address</h2>
                    </div>

                    {addressesLoading ? (
                      <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className="h-[72px] animate-pulse rounded-[14px] bg-[#f5f0eb]"
                          />
                        ))}
                      </div>
                    ) : !addresses?.length ? (
                      <div className="rounded-[14px] bg-[#f5f0eb] px-4 py-5 text-center">
                        <p className="font-body text-[14px] text-foreground/50">
                          No saved addresses. Add one to continue.
                        </p>
                        <Link
                          href="/addresses?redirect=/checkout"
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 font-body text-sm font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)] transition-all hover:opacity-90"
                        >
                          Add address
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {addresses.map((address) => (
                          <label
                            key={address._id}
                            className="flex cursor-pointer items-start gap-3 rounded-[14px] p-4 ring-1 ring-black/7 transition-all duration-200 has-checked:bg-primary/4 has-checked:ring-primary/40"
                          >
                            <input
                              {...register("addressId")}
                              type="radio"
                              value={address._id}
                              className="mt-0.5 accent-primary"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-body text-[14px] font-semibold text-foreground">
                                  {address.label ?? "Address"}
                                </span>
                                {address.isDefault && (
                                  <span className="rounded-full bg-primary-pink px-2.5 py-0.5 font-body text-[11px] font-semibold text-primary">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 font-body text-[13px] text-foreground/60">
                                {address.location}
                              </p>
                              {address.landmark && (
                                <p className="font-body text-[12px] text-foreground/40">
                                  {address.landmark}
                                </p>
                              )}
                              <p className="font-body text-[12px] text-foreground/45">
                                {address.phoneNumber}
                              </p>
                            </div>
                          </label>
                        ))}
                        <Link
                          href="/addresses?redirect=/checkout"
                          className="mt-1 inline-block font-body text-sm text-primary transition-opacity hover:opacity-75"
                        >
                          + Add new address
                        </Link>
                      </div>
                    )}

                    {errors.addressId && (
                      <p className="mt-2 font-body text-[12px] text-primary-red">
                        {errors.addressId.message}
                      </p>
                    )}
                  </div>
                </FadeIn>
              )}

              {!isDeliveryOrder && (
                <FadeIn delay={0.05}>
                  <div className={sectionCls}>
                    <h2 className={sectionHeadingCls}>Order type</h2>
                    <p className="mt-2 font-body text-[13px] text-foreground/50 capitalize">
                      {orderType.replace("_", " ")} selected. Delivery address
                      is not required.
                    </p>
                  </div>
                </FadeIn>
              )}

              {/* Order notes */}
              <FadeIn delay={0.1}>
                <div className={sectionCls}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb]">
                      <FileText size={16} className="text-foreground/40" />
                    </div>
                    <div>
                      <h2 className={sectionHeadingCls}>Order notes</h2>
                      <p className="font-body text-[12px] text-foreground/40">
                        Soup type, protein choices, special instructions
                      </p>
                    </div>
                  </div>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    placeholder="e.g. Soup: Light Soup | Proteins: Tilapia, Chicken"
                    className="mt-3 w-full resize-none rounded-[12px] border border-black/10 bg-[#f5f0eb] px-4 py-3 font-body text-[14px] text-foreground placeholder:text-foreground/35 transition-all duration-200 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.notes && (
                    <p className="mt-1.5 font-body text-[12px] text-primary-red">
                      {errors.notes.message}
                    </p>
                  )}
                </div>
              </FadeIn>

              {/* Promo code */}
              <FadeIn delay={0.14}>
                <div className={sectionCls}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb]">
                      <FileText size={16} className="text-foreground/40" />
                    </div>
                    <div>
                      <h2 className={sectionHeadingCls}>Promo code</h2>
                      <p className="font-body text-[12px] text-foreground/40">
                        Promo is validated by the server when you place the
                        order.
                      </p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="mt-3 w-full rounded-[12px] border border-black/10 bg-[#f5f0eb] px-4 py-3 font-body text-[14px] text-foreground placeholder:text-foreground/35 transition-all duration-200 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </FadeIn>
            </div>

            {/* ── Right: order summary ── */}
            <FadeIn delay={0.08}>
              <div className="lg:col-span-1">
                <div className={`${sectionCls} lg:sticky lg:top-6`}>
                  <h2 className={`${sectionHeadingCls} mb-4`}>Order summary</h2>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.lineId ?? item.menuItemId}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body text-[13px] font-semibold text-foreground">
                            {item.name}
                          </p>
                          <p className="font-body text-[12px] text-foreground/40">
                            × {item.quantity}
                          </p>
                          {/* FIX 3: Show selected extras under the item name */}
                          {item.customization && (
                            <p className="mt-0.5 truncate font-body text-[11px] text-foreground/40">
                              {item.customization}
                            </p>
                          )}
                        </div>
                        {/* FIX 2: Use lineTotal for correct price including extras */}
                        <p className="shrink-0 font-body text-[13px] font-semibold text-foreground">
                          GH₵{" "}
                          {(
                            item.lineTotal ?? item.price * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 border-t border-black/6 pt-4">
                    <div className="flex justify-between font-body text-[13px]">
                      <span className="text-foreground/50">Subtotal</span>
                      <span className="text-foreground">
                        GH₵ {totalAmount.toFixed(2)}
                      </span>
                    </div>
                    {promoCode.trim() && (
                      <div className="flex justify-between font-body text-[13px]">
                        <span className="text-foreground/50">
                          Promo ({promoCode})
                        </span>
                        <span className="italic text-foreground/40">
                          Applied at order placement
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-body text-[13px]">
                      <span className="text-foreground/50">Processing fee</span>
                      {processingFeeEstimate !== null ? (
                        <span className="text-foreground">
                          GH₵ {processingFeeEstimate.toFixed(2)}
                        </span>
                      ) : (
                        <span className="italic text-foreground/40">
                          At checkout
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between font-body text-[13px]">
                      <span className="text-foreground/50">Delivery fee</span>
                      <span className="italic text-foreground/40">
                        At checkout
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-black/6 pt-4">
                    <span className="font-heading text-[15px] font-bold text-foreground">
                      Estimated total
                    </span>
                    <span className="font-heading text-[15px] font-bold text-foreground">
                      GH₵ {estimatedTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isLoading || (isDeliveryOrder && !addresses?.length)
                    }
                    className="mt-6 w-full rounded-full bg-primary py-3 font-body text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)] transition-all hover:opacity-90 hover:shadow-[0_4px_16px_rgba(235,108,108,0.40)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {isLoading ? "Placing order…" : "Place order"}
                  </button>

                  <p className="mt-3 text-center font-body text-[11px] text-foreground/35">
                    You&apos;ll choose your payment method on the next step
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-pink border-t-primary" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
