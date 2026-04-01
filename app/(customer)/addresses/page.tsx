// 📁 app/(customer)/addresses/page.tsx
//
// GET    /addresses              🔒 Auth → list addresses
// POST   /addresses              🔒 Auth → create address
// PATCH  /addresses/:id          🔒 Auth → update address
// DELETE /addresses/:id          🔒 Auth → delete address

"use client";

import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
} from "@/lib/hooks/useAddresses";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { MapPin, X, Pencil, Trash2, Plus } from "lucide-react";
import { SlideUp, FadeIn } from "@/components/ui/Animations";
import { motion, AnimatePresence } from "framer-motion";
import type { Address } from "@/types";

const ease = [0.25, 0.1, 0.25, 1] as const;

// ── Validation schema ─────────────────────────────────────────────────────────

const addressSchema = z.object({
  label: z.string().max(50).optional().or(z.literal("")),
  location: z.string().min(1, "Location is required").max(300),
  landmark: z.string().max(200).optional().or(z.literal("")),
  gpsAddress: z.string().optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number"),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

// ── Shared input style ────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-[12px] border border-black/[0.10] bg-[#f5f0eb] px-4 py-3 " +
  "font-body text-[14px] text-foreground placeholder:text-foreground/35 " +
  "transition-all duration-200 focus:border-primary/40 focus:bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

const labelCls =
  "mb-1.5 block font-body text-[13px] font-semibold text-foreground/70";

// ── Address form ──────────────────────────────────────────────────────────────

function AddressForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  title,
}: {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  title: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 8 }}
      transition={{ duration: 0.22, ease }}
      className="rounded-[20px] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.10)] ring-1 ring-primary/20 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-[17px] font-bold text-foreground">
          {title}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-foreground/40 transition-colors hover:bg-black/10 hover:text-foreground"
        >
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        {/* Label + phone */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>
              Label{" "}
              <span className="font-normal text-foreground/35">(optional)</span>
            </label>
            <input
              {...register("label")}
              placeholder="Home, Office…"
              className={inputCls}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className={labelCls}>Phone number</label>
            <input
              {...register("phoneNumber")}
              placeholder="+233201234567"
              className={inputCls}
              disabled={isSubmitting}
            />
            {errors.phoneNumber && (
              <p className="mt-1.5 font-body text-[12px] text-primary-red">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className={labelCls}>Location</label>
          <input
            {...register("location")}
            placeholder="East Legon, Accra"
            className={inputCls}
            disabled={isSubmitting}
          />
          {errors.location && (
            <p className="mt-1.5 font-body text-[12px] text-primary-red">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Landmark + GPS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>
              Landmark{" "}
              <span className="font-normal text-foreground/35">(optional)</span>
            </label>
            <input
              {...register("landmark")}
              placeholder="Near A&C Mall"
              className={inputCls}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className={labelCls}>
              GPS address{" "}
              <span className="font-normal text-foreground/35">(optional)</span>
            </label>
            <input
              {...register("gpsAddress")}
              placeholder="GA-457-1234"
              className={inputCls}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Default toggle */}
        <label className="flex cursor-pointer items-center gap-2 font-body text-[14px] text-foreground/70">
          <input
            {...register("isDefault")}
            type="checkbox"
            className="accent-primary h-4 w-4"
          />
          Set as default address
        </label>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-primary py-2.5 font-body text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? "Saving…" : "Save address"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 font-body text-[14px] font-semibold text-foreground/60 ring-1 ring-black/[0.10] transition-colors hover:bg-[#f5f0eb]"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (values: AddressFormValues) => {
    try {
      await createAddress.mutateAsync({
        label: values.label || undefined,
        location: values.location,
        landmark: values.landmark || undefined,
        gpsAddress: values.gpsAddress || undefined,
        phoneNumber: values.phoneNumber,
        isDefault: values.isDefault,
      });
      toast.success("Address added.");
      setShowForm(false);
    } catch {
      toast.error("Failed to add address.");
    }
  };

  const handleUpdate = async (id: string, values: AddressFormValues) => {
    try {
      await updateAddress.mutateAsync({
        id,
        payload: {
          label: values.label || undefined,
          location: values.location,
          landmark: values.landmark || undefined,
          gpsAddress: values.gpsAddress || undefined,
          phoneNumber: values.phoneNumber,
          isDefault: values.isDefault,
        },
      });
      toast.success("Address updated.");
      setEditingId(null);
    } catch {
      toast.error("Failed to update address.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteAddress.mutateAsync(id);
      toast.success("Address deleted.");
    } catch {
      toast.error("Failed to delete address.");
    }
  };

  return (
    <div className="mx-auto max-w-[1376px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
      {/* ── Heading ── */}
      <SlideUp>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-heading text-2xl font-black text-foreground">
            Delivery Addresses
          </h1>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
              }}
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)] transition-all hover:opacity-90"
            >
              <Plus size={15} />
              Add address
            </button>
          )}
        </div>
      </SlideUp>

      {/* ── Add form ── */}
      <AnimatePresence>
        {showForm && (
          <AddressForm
            title="New Address"
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isSubmitting={createAddress.isPending}
          />
        )}
      </AnimatePresence>

      {/* ── Address list ── */}
      <SlideUp delay={0.08}>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-[100px] animate-pulse rounded-[20px] bg-[#f5f0eb]"
              />
            ))}
          </div>
        ) : !addresses?.length ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-16 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f0eb]">
              <MapPin size={22} className="text-foreground/30" />
            </div>
            <p className="font-body text-[15px] font-semibold text-foreground/50">
              No saved addresses yet
            </p>
            <p className="mt-1 font-body text-sm text-foreground/35">
              Add a delivery address to start placing orders.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-5 flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.35)] transition-all hover:opacity-90"
            >
              <Plus size={15} />
              Add address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {addresses.map((address: Address) => (
                <motion.div
                  key={address._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease }}
                >
                  {editingId === address._id ? (
                    <AddressForm
                      title="Edit Address"
                      defaultValues={{
                        label: address.label ?? "",
                        location: address.location,
                        landmark: address.landmark ?? "",
                        gpsAddress: address.gpsAddress ?? "",
                        phoneNumber: address.phoneNumber,
                        isDefault: address.isDefault,
                      }}
                      onSubmit={(values) => handleUpdate(address._id, values)}
                      onCancel={() => setEditingId(null)}
                      isSubmitting={updateAddress.isPending}
                    />
                  ) : (
                    <div className="group flex items-start gap-4 rounded-[20px] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)]">
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f0eb]">
                        <MapPin size={16} className="text-foreground/40" />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-heading text-[14px] font-bold text-foreground">
                            {address.label ?? "Address"}
                          </p>
                          {address.isDefault && (
                            <span className="rounded-full bg-primary-pink px-2.5 py-0.5 font-body text-[11px] font-semibold text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-body text-[13px] text-foreground/70">
                          {address.location}
                        </p>
                        {address.landmark && (
                          <p className="font-body text-[12px] text-foreground/40">
                            {address.landmark}
                          </p>
                        )}
                        <p className="mt-0.5 font-body text-[12px] text-foreground/50">
                          {address.phoneNumber}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(address._id);
                            setShowForm(false);
                          }}
                          aria-label="Edit address"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f0eb] text-foreground/35 transition-all hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(address._id)}
                          disabled={deleteAddress.isPending}
                          aria-label="Delete address"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f0eb] text-foreground/35 transition-all hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </SlideUp>
    </div>
  );
}
