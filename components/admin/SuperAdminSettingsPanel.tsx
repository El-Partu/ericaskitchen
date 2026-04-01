"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCommissionSettings,
  useCommissionTodaySummary,
  useCreatePromoCode,
  useDeletePromoCode,
  useInvalidatePromoCode,
  useProcessingFee,
  usePromoCodes,
  useUpdateCommissionSettings,
  useUpdateProcessingFee,
  useUpdatePromoCode,
} from "@/lib/hooks/useSuperAdminSettings";
import type {
  CommissionConfig,
  ProcessingFeeConfig,
  PromoCode,
  PromoDiscountType,
} from "@/types";

const inputCls =
  "w-full rounded-[10px] bg-admin-bg px-3 py-2.5 font-body text-[13px] text-admin-text " +
  "ring-1 ring-black/[0.08] placeholder:text-admin-muted " +
  "focus:outline-none focus:ring-2 focus:ring-admin-accent/30 transition-all duration-150";

const labelCls =
  "font-body text-[12px] font-semibold uppercase tracking-widest text-admin-muted";

function SettingCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[16px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] sm:p-6">
      <h2 className="font-heading text-[18px] font-bold text-admin-text">
        {title}
      </h2>
      <p className="mt-1 font-body text-[13px] text-admin-muted">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function normalizeAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function PromoCodeRow({
  promo,
  onSave,
  onInvalidate,
  onDelete,
  isSaving,
}: {
  promo: PromoCode;
  onSave: (
    id: string,
    payload: {
      discountValue?: number;
      isActive?: boolean;
      expiresAt?: string;
    },
  ) => void;
  onInvalidate: (id: string) => void;
  onDelete: (id: string) => void;
  isSaving: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [discountValue, setDiscountValue] = useState(
    String(promo.discountValue),
  );
  const [isActive, setIsActive] = useState(promo.isActive);

  const expiresAtInput = useMemo(
    () => (promo.expiresAt ? promo.expiresAt.slice(0, 10) : ""),
    [promo.expiresAt],
  );
  const [expiresAt, setExpiresAt] = useState(expiresAtInput);

  const handleSave = () => {
    onSave(promo._id, {
      discountValue: normalizeAmount(discountValue),
      isActive,
      expiresAt: expiresAt || undefined,
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-[12px] bg-admin-bg p-3 ring-1 ring-black/[0.06]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-[15px] font-bold text-admin-text">
            {promo.code}
          </p>
          <p className="font-body text-[12px] text-admin-muted">
            {promo.discountType === "percent"
              ? `${promo.discountValue}%`
              : `GHS ${promo.discountValue.toFixed(2)}`}{" "}
            discount
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${
            promo.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {promo.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {isEditing ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Discount value</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputCls} mt-1`}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Expires at</label>
            <input
              type="date"
              className={`${inputCls} mt-1`}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 font-body text-[13px] text-admin-text">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-admin-accent"
              />
              Active
            </label>
          </div>

          <div className="sm:col-span-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-admin-accent px-4 py-2 font-body text-[12px] font-semibold text-white disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full bg-white px-4 py-2 font-body text-[12px] font-semibold text-admin-text ring-1 ring-black/[0.08]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-white px-3 py-1.5 font-body text-[12px] font-semibold text-admin-text ring-1 ring-black/[0.08]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onInvalidate(promo._id)}
            disabled={isSaving || !promo.isActive}
            className="rounded-full bg-amber-100 px-3 py-1.5 font-body text-[12px] font-semibold text-amber-700 disabled:opacity-50"
          >
            Invalidate
          </button>
          <button
            type="button"
            onClick={() => onDelete(promo._id)}
            disabled={isSaving}
            className="rounded-full bg-red-100 px-3 py-1.5 font-body text-[12px] font-semibold text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminSettingsPanel() {
  const { data: processingFee, isLoading: processingFeeLoading } =
    useProcessingFee();
  const { mutateAsync: updateProcessingFee, isPending: updatingProcessingFee } =
    useUpdateProcessingFee();

  const { data: commission, isLoading: commissionLoading } =
    useCommissionSettings();
  const { data: todaySummary } = useCommissionTodaySummary();
  const { mutateAsync: updateCommission, isPending: updatingCommission } =
    useUpdateCommissionSettings();

  const { data: promoCodes, isLoading: promoLoading } = usePromoCodes();
  const { mutateAsync: createPromo, isPending: creatingPromo } =
    useCreatePromoCode();
  const { mutateAsync: updatePromo, isPending: updatingPromo } =
    useUpdatePromoCode();
  const { mutateAsync: invalidatePromo, isPending: invalidatingPromo } =
    useInvalidatePromoCode();
  const { mutateAsync: deletePromo, isPending: deletingPromo } =
    useDeletePromoCode();

  const [processingFeeDraft, setProcessingFeeDraft] = useState<{
    type: ProcessingFeeConfig["type"];
    amount: string;
  } | null>(null);

  const [commissionDraft, setCommissionDraft] = useState<{
    type: CommissionConfig["type"];
    value: string;
  } | null>(null);

  const [promoCode, setPromoCode] = useState("");
  const [discountType, setDiscountType] =
    useState<PromoDiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("0");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [promoExpiresAt, setPromoExpiresAt] = useState("");

  const processingFeeType =
    processingFeeDraft?.type ?? processingFee?.type ?? "fixed";
  const processingFeeAmount =
    processingFeeDraft?.amount ?? String(processingFee?.amount ?? 0);

  const commissionType = commissionDraft?.type ?? commission?.type ?? "percent";
  const commissionValue =
    commissionDraft?.value ?? String(commission?.value ?? 0);

  const isBusy =
    updatingPromo || invalidatingPromo || deletingPromo || creatingPromo;

  const handleProcessingFeeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateProcessingFee({
        type: processingFeeType,
        amount: normalizeAmount(processingFeeAmount),
      });
      setProcessingFeeDraft(null);
      toast.success("Processing fee updated.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update processing fee."));
    }
  };

  const handleCommissionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateCommission({
        type: commissionType,
        value: normalizeAmount(commissionValue),
      });
      setCommissionDraft(null);
      toast.success("Commission settings updated.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update commission."));
    }
  };

  const handlePromoCreate = async (e: FormEvent) => {
    e.preventDefault();

    if (!promoCode.trim()) {
      toast.error("Promo code is required.");
      return;
    }

    try {
      await createPromo({
        code: promoCode.trim().toUpperCase(),
        discountType,
        discountValue: normalizeAmount(discountValue),
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
        expiresAt: promoExpiresAt || undefined,
        isActive: true,
      });
      toast.success("Promo code created.");
      setPromoCode("");
      setDiscountType("percent");
      setDiscountValue("0");
      setMaxRedemptions("");
      setPromoExpiresAt("");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to create promo code."));
    }
  };

  const handlePromoUpdate = async (
    id: string,
    payload: {
      discountValue?: number;
      isActive?: boolean;
      expiresAt?: string;
    },
  ) => {
    try {
      await updatePromo({ id, payload });
      toast.success("Promo code updated.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update promo code."));
    }
  };

  const handlePromoInvalidate = async (id: string) => {
    try {
      await invalidatePromo(id);
      toast.success("Promo code invalidated.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to invalidate promo code."));
    }
  };

  const handlePromoDelete = async (id: string) => {
    try {
      await deletePromo(id);
      toast.success("Promo code deleted.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete promo code."));
    }
  };

  return (
    <div className="space-y-5">
      <SettingCard
        title="Processing Fee"
        description="Controls the fee applied to each new order."
      >
        <form
          onSubmit={handleProcessingFeeSubmit}
          className="grid gap-3 sm:grid-cols-3"
        >
          <div>
            <label className={labelCls}>Type</label>
            <select
              className={`${inputCls} mt-1`}
              value={processingFeeType}
              onChange={(e) =>
                setProcessingFeeDraft({
                  type: e.target.value as ProcessingFeeConfig["type"],
                  amount: processingFeeAmount,
                })
              }
              disabled={processingFeeLoading || updatingProcessingFee}
            >
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Amount</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputCls} mt-1`}
              value={processingFeeAmount}
              onChange={(e) =>
                setProcessingFeeDraft({
                  type: processingFeeType,
                  amount: e.target.value,
                })
              }
              disabled={processingFeeLoading || updatingProcessingFee}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={processingFeeLoading || updatingProcessingFee}
              className="w-full rounded-full bg-admin-accent px-5 py-2.5 font-body text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {updatingProcessingFee ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </SettingCard>

      <SettingCard
        title="Commission (Internal)"
        description="Commission values are for internal accounting only and are not shown during customer checkout."
      >
        <form
          onSubmit={handleCommissionSubmit}
          className="grid gap-3 sm:grid-cols-3"
        >
          <div>
            <label className={labelCls}>Type</label>
            <select
              className={`${inputCls} mt-1`}
              value={commissionType}
              onChange={(e) =>
                setCommissionDraft({
                  type: e.target.value as CommissionConfig["type"],
                  value: commissionValue,
                })
              }
              disabled={commissionLoading || updatingCommission}
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Value</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputCls} mt-1`}
              value={commissionValue}
              onChange={(e) =>
                setCommissionDraft({
                  type: commissionType,
                  value: e.target.value,
                })
              }
              disabled={commissionLoading || updatingCommission}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={commissionLoading || updatingCommission}
              className="w-full rounded-full bg-admin-accent px-5 py-2.5 font-body text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {updatingCommission ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-[12px] bg-admin-bg p-3 ring-1 ring-black/[0.06]">
          <p className="font-body text-[12px] text-admin-muted">
            Today&apos;s commission summary
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-4">
            <p className="font-heading text-[20px] font-bold text-admin-text">
              GHS {(todaySummary?.totalCommission ?? 0).toFixed(2)}
            </p>
            <p className="font-body text-[12px] text-admin-muted">
              {todaySummary?.orderCount ?? 0} orders contributing
            </p>
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title="Promo Codes"
        description="Create and manage active promo codes used at checkout via promoCode in order creation."
      >
        <form
          onSubmit={handlePromoCreate}
          className="grid gap-3 sm:grid-cols-5"
        >
          <div className="sm:col-span-2">
            <label className={labelCls}>Code</label>
            <input
              type="text"
              className={`${inputCls} mt-1`}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="WELCOME10"
              disabled={creatingPromo}
            />
          </div>

          <div>
            <label className={labelCls}>Type</label>
            <select
              className={`${inputCls} mt-1`}
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as PromoDiscountType)
              }
              disabled={creatingPromo}
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Value</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputCls} mt-1`}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              disabled={creatingPromo}
            />
          </div>

          <div>
            <label className={labelCls}>Max redemptions</label>
            <input
              type="number"
              min={1}
              className={`${inputCls} mt-1`}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              disabled={creatingPromo}
            />
          </div>

          <div>
            <label className={labelCls}>Expires at</label>
            <input
              type="date"
              className={`${inputCls} mt-1`}
              value={promoExpiresAt}
              onChange={(e) => setPromoExpiresAt(e.target.value)}
              disabled={creatingPromo}
            />
          </div>

          <div className="sm:col-span-5">
            <button
              type="submit"
              disabled={creatingPromo}
              className="rounded-full bg-admin-accent px-5 py-2.5 font-body text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {creatingPromo ? "Creating..." : "Create Promo"}
            </button>
          </div>
        </form>

        <div className="mt-4 space-y-3">
          {promoLoading && (
            <p className="font-body text-[13px] text-admin-muted">
              Loading promo codes...
            </p>
          )}

          {!promoLoading && !promoCodes?.length && (
            <p className="font-body text-[13px] text-admin-muted">
              No promo codes created yet.
            </p>
          )}

          {(promoCodes ?? []).map((promo) => (
            <PromoCodeRow
              key={promo._id}
              promo={promo}
              onSave={handlePromoUpdate}
              onInvalidate={handlePromoInvalidate}
              onDelete={handlePromoDelete}
              isSaving={isBusy}
            />
          ))}
        </div>
      </SettingCard>
    </div>
  );
}
