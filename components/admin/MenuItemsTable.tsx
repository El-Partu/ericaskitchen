// 📁 components/admin/MenuItemsTable.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminMenuItems,
  useUpdateMenuItem,
  useDeleteMenuItem,
  adminKeys,
} from "@/lib/hooks/useAdmin";
import { useCategories } from "@/lib/hooks/useMenu";
import {
  useExtraItems,
  useExtraItemCategories,
} from "@/lib/hooks/useExtraItems";
import type { MenuItem } from "@/types";
import type { MenuFilters } from "@/app/(admin)/admin/menu/page";

const LIMIT = 8;

interface MenuItemsTableProps {
  filters: MenuFilters;
}

// ── Tag input helper ──────────────────────────────────────────────────────────

function TagInput({
  label,
  value,
  tags,
  placeholder,
  tagStyle,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  value: string;
  tags: string[];
  placeholder: string;
  tagStyle: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  const labelCls =
    "font-body text-[12px] font-semibold uppercase tracking-widest text-admin-muted";
  return (
    <div>
      <label className={labelCls}>
        {label}{" "}
        <span className="font-normal normal-case tracking-normal text-admin-muted">
          (optional)
        </span>
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-[10px] bg-admin-bg px-3 py-2.5 font-body text-[13px] text-admin-text ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-admin-accent/30 transition-all"
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-[10px] bg-admin-dark px-4 py-2 font-body text-[13px] font-semibold text-white transition-opacity hover:opacity-80"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-body text-[12px] ${tagStyle}`}
            >
              {tag}
              <button
                onClick={() => onRemove(i)}
                className="opacity-50 hover:opacity-100"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Toggle checkbox helper ────────────────────────────────────────────────────

function ToggleCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer font-body text-[13px] text-admin-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-admin-accent h-4 w-4"
      />
      {label}
    </label>
  );
}

// ── Inline Edit / Create Modal ────────────────────────────────────────────────

function MenuItemModal({
  item,
  onClose,
}: {
  item?: MenuItem;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { data: allExtras } = useExtraItems();
  const { data: extraCategories } = useExtraItemCategories();
  const { mutate: updateItem, isPending: updating } = useUpdateMenuItem();

  const [submitting, setSubmitting] = useState(false);
  const isPending = submitting || updating;

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price ?? 0);
  const [preparationTime, setPreparationTime] = useState(
    item?.preparationTime ?? 1,
  );
  const [category, setCategory] = useState(
    typeof item?.category === "object"
      ? item.category._id
      : (item?.category ?? ""),
  );
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(item?.isFeatured ?? false);
  const [ingredients, setIngredients] = useState<string[]>(
    item?.ingredients ?? [],
  );
  const [allergens, setAllergens] = useState<string[]>(item?.allergens ?? []);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>(
    item?.extraItems ?? [],
  );
  const [ingredientInput, setIngredientInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    item?.images ?? [],
  );
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const handleImageSelect = (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files);
    setImageFiles((p) => [...p, ...selected]);
    setNewPreviews((p) => [
      ...p,
      ...selected.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const addTag = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setter((p) => [...p, trimmed]);
    inputSetter("");
  };

  const toggleExtra = (id: string) => {
    setSelectedExtraIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Group extras by category for display
  const groupedExtras = (extraCategories ?? [])
    .map((cat) => ({
      category: cat,
      items: (allExtras ?? []).filter((e) => {
        const catId =
          typeof e.category === "object" ? e.category._id : e.category;
        return catId === cat._id;
      }),
    }))
    .filter((g) => g.items.length > 0);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name is required.");
    if (price < 0) return toast.error("Price must be 0 or more.");
    if (!category) return toast.error("Category is required.");
    if (preparationTime < 1)
      return toast.error("Preparation time must be at least 1 minute.");
    if (!item && existingImages.length + imageFiles.length === 0)
      return toast.error("At least one image is required.");

    if (item) {
      updateItem(
        {
          id: item._id,
          payload: {
            name,
            description,
            price,
            category,
            preparationTime,
            isAvailable,
            isFeatured,
            ingredients,
            allergens,
            extraItems: selectedExtraIds,
            ...(existingImages.length !== item.images?.length && {
              images: existingImages,
            }),
          },
        },
        {
          onSuccess: () => {
            toast.success("Menu item updated");
            onClose();
          },
          onError: () => toast.error("Failed to update item"),
        },
      );
    } else {
      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.append("name", name);
        if (description.trim()) {
          fd.append("description", description.trim());
        }
        fd.append("price", String(price));
        fd.append("category", category);
        fd.append("preparationTime", String(preparationTime));
        fd.append("isAvailable", String(isAvailable));
        fd.append("isFeatured", String(isFeatured));
        ingredients.forEach((ing) => fd.append("ingredients[]", ing));
        allergens.forEach((a) => fd.append("allergens[]", a));
        selectedExtraIds.forEach((id) => fd.append("extraItems[]", id));
        imageFiles.forEach((f) => fd.append("images", f));

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
        if (!apiBaseUrl) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured");
        }

        const res = await fetch(`${apiBaseUrl}/menu-items`, {
          method: "POST",
          headers: { "X-API-Key": process.env.NEXT_PUBLIC_API_KEY! },
          credentials: "include",
          body: fd,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? "Failed to create item");
        }

        await queryClient.invalidateQueries({
          queryKey: adminKeys.menuItems(),
        });
        toast.success("Menu item created");
        onClose();
      } catch (err: any) {
        toast.error(err.message ?? "Failed to create item");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const inputCls =
    "mt-1 w-full rounded-[10px] bg-admin-bg px-3 py-2.5 font-body text-[13px] text-admin-text ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-admin-accent/30 transition-all duration-150";
  const labelCls =
    "font-body text-[12px] font-semibold uppercase tracking-widest text-admin-muted";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[20px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.14)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-admin-muted transition-colors hover:bg-black/10 hover:text-admin-text"
        >
          <X size={16} />
        </button>

        <div className="pr-8">
          <p className={labelCls}>Menu Items</p>
          <h2 className="mt-0.5 font-heading text-[20px] font-bold text-admin-text">
            {item ? "Edit Item" : "Add New Item"}
          </h2>
        </div>

        <div className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>
              Name <span className="text-admin-accent">*</span>
            </label>
            <input
              type="text"
              value={name}
              maxLength={150}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>
              Description{" "}
              <span className="font-normal normal-case tracking-normal text-admin-muted">
                (optional)
              </span>
            </label>
            <textarea
              value={description}
              maxLength={1000}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Price + Prep time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                Price (GH₵) <span className="text-admin-accent">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Prep Time (min) <span className="text-admin-accent">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={preparationTime}
                onChange={(e) =>
                  setPreparationTime(parseInt(e.target.value) || 1)
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>
              Category <span className="text-admin-accent">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              <option value="">Select category…</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}>
              Images{!item && <span className="text-admin-accent"> *</span>}
              {item && (
                <span className="ml-1 font-normal normal-case tracking-normal text-admin-muted">
                  (upload to add more)
                </span>
              )}
            </label>
            <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-black/[0.10] px-4 py-3 transition-colors hover:border-admin-accent">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files)}
              />
              <span className="font-body text-[13px] text-admin-muted">
                Click to select images (JPG, PNG, WEBP)
              </span>
            </label>
            {existingImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {existingImages.map((url, i) => (
                  <div
                    key={i}
                    className="group relative h-16 w-16 overflow-hidden rounded-[8px] bg-admin-bg"
                  >
                    <Image
                      src={url}
                      alt={`Image ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() =>
                        setExistingImages((p) => p.filter((_, j) => j !== i))
                      }
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {newPreviews.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {newPreviews.map((url, i) => (
                    <div
                      key={i}
                      className="group relative h-16 w-16 overflow-hidden rounded-[8px] bg-admin-bg ring-2 ring-admin-accent ring-offset-1"
                    >
                      <Image
                        src={url}
                        alt={`New ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => {
                          setImageFiles((p) => p.filter((_, j) => j !== i));
                          setNewPreviews((p) => p.filter((_, j) => j !== i));
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-1 font-body text-[11px] text-admin-muted">
                  {newPreviews.length} new image
                  {newPreviews.length > 1 ? "s" : ""} selected — will upload on
                  save
                </p>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <TagInput
            label="Ingredients"
            value={ingredientInput}
            tags={ingredients}
            onChange={setIngredientInput}
            onAdd={() =>
              addTag(ingredientInput, setIngredients, setIngredientInput)
            }
            onRemove={(i) => setIngredients((p) => p.filter((_, j) => j !== i))}
            placeholder="e.g. Rice, Tomato…"
            tagStyle="bg-admin-bg text-admin-text"
          />

          {/* Allergens */}
          <TagInput
            label="Allergens"
            value={allergenInput}
            tags={allergens}
            onChange={setAllergenInput}
            onAdd={() => addTag(allergenInput, setAllergens, setAllergenInput)}
            onRemove={(i) => setAllergens((p) => p.filter((_, j) => j !== i))}
            placeholder="e.g. Nuts, Gluten…"
            tagStyle="bg-red-50 text-red-600"
          />

          {/* Extra Items */}
          {groupedExtras.length > 0 && (
            <div>
              <label className={labelCls}>
                Extra Items{" "}
                <span className="ml-1 font-normal normal-case tracking-normal text-admin-muted">
                  (optional — shown to customer at order time)
                </span>
              </label>
              <div className="mt-2 space-y-3">
                {groupedExtras.map(({ category: cat, items }) => (
                  <div key={cat._id}>
                    <p className="mb-1.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                      {cat.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((extra) => {
                        const selected = selectedExtraIds.includes(extra._id);
                        return (
                          <button
                            key={extra._id}
                            type="button"
                            onClick={() => toggleExtra(extra._id)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-[12px] font-semibold transition-all duration-150 ${
                              selected
                                ? "bg-admin-accent text-white shadow-[0_2px_8px_rgba(160,58,26,0.25)]"
                                : "bg-admin-bg text-admin-text ring-1 ring-black/[0.08] hover:ring-admin-accent/30"
                            }`}
                          >
                            {selected && (
                              <svg
                                width="10"
                                height="8"
                                viewBox="0 0 10 8"
                                fill="none"
                              >
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            {extra.name}
                            <span
                              className={`font-normal ${selected ? "text-white/70" : "text-admin-muted"}`}
                            >
                              GH₵{extra.price.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {selectedExtraIds.length > 0 && (
                <p className="mt-2 font-body text-[11px] text-admin-accent">
                  {selectedExtraIds.length} extra item
                  {selectedExtraIds.length > 1 ? "s" : ""} linked
                </p>
              )}
            </div>
          )}

          {/* Toggles */}
          <div className="flex gap-5">
            <ToggleCheck
              label="Available"
              checked={isAvailable}
              onChange={setIsAvailable}
            />
            <ToggleCheck
              label="Featured"
              checked={isFeatured}
              onChange={setIsFeatured}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 font-body text-[13px] font-semibold text-admin-muted ring-1 ring-black/[0.10] transition-colors hover:bg-admin-bg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-full bg-admin-accent px-6 py-2 font-body text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(160,58,26,0.25)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Saving…" : item ? "Save Changes" : "Create Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Table ────────────────────────────────────────────────────────────────

export default function MenuItemsTable({ filters }: MenuItemsTableProps) {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [editItem, setEditItem] = useState<MenuItem | null | "new">(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const { mutate: deleteItem, isPending: deleting } = useDeleteMenuItem();
  const { mutate: toggleAvailability } = useUpdateMenuItem();

  const isAvailableParam =
    filters.isAvailable === "available"
      ? true
      : filters.isAvailable === "unavailable"
        ? false
        : undefined;

  const { data, isLoading } = useAdminMenuItems({
    ...(activeCategory !== "all" && { category: activeCategory }),
    ...(filters.search && { search: filters.search }),
    ...(isAvailableParam !== undefined && { isAvailable: isAvailableParam }),
    page,
    limit: LIMIT,
  });

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.isAvailable]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleDelete = (id: string) => {
    deleteItem(id, {
      onSuccess: () => {
        toast.success("Menu item deleted");
        setConfirmDeleteId(null);
      },
      onError: () => toast.error("Failed to delete item"),
    });
  };

  const handleToggleAvailability = (item: MenuItem) => {
    toggleAvailability(
      { id: item._id, payload: { isAvailable: !item.isAvailable } },
      {
        onSuccess: () =>
          toast.success(
            `${item.name} marked as ${!item.isAvailable ? "available" : "unavailable"}`,
          ),
        onError: () => toast.error("Failed to update availability"),
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Category tabs + Add button */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {[{ _id: "all", name: "All" }, ...(categories ?? [])].map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setActiveCategory(cat._id);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 font-body text-[12px] font-semibold transition-all duration-150 ${
                activeCategory === cat._id
                  ? "bg-admin-dark text-white"
                  : "bg-admin-bg text-admin-muted hover:bg-admin-accent/10 hover:text-admin-accent ring-1 ring-black/[0.06]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setEditItem("new")}
          className="flex items-center gap-1.5 rounded-full bg-admin-accent px-3.5 py-1.5 font-body text-[12px] font-semibold text-white shadow-[0_2px_8px_rgba(160,58,26,0.25)] transition-opacity hover:opacity-90"
        >
          <Plus size={13} />
          Add Item
        </button>
      </div>

      {/* Table */}
      <div className="mt-3 px-4 pb-1 sm:hidden">
        <p className="font-body text-[11px] text-admin-muted">
          Compact mobile view: category is hidden to keep actions readable.
        </p>
      </div>
      <div className="mt-2 overflow-x-auto sm:mt-3">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/[0.07]">
              <th className="py-2.5 pl-4 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                Item
              </th>
              <th className="hidden py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted sm:table-cell">
                Category
              </th>
              <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                GH₵ Price
              </th>
              <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                Availability
              </th>
              <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: LIMIT }).map((_, i) => (
                  <tr key={i} className="border-b border-black/[0.05]">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className={`py-3 ${j === 0 ? "pl-4" : ""}`}>
                        <div className="h-4 animate-pulse rounded-full bg-[#f0ebe5]" />
                      </td>
                    ))}
                  </tr>
                ))
              : items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-black/[0.05] transition-colors hover:bg-admin-bg/60"
                  >
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[8px] bg-admin-bg">
                          {item.images?.[0] && (
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <span className="font-body text-[13px] font-semibold text-admin-text">
                            {item.name}
                          </span>
                          {(item.extraItems?.length ?? 0) > 0 && (
                            <p className="font-body text-[11px] text-admin-muted">
                              {item.extraItems!.length} extra item
                              {item.extraItems!.length > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden py-3 font-body text-[13px] text-admin-muted sm:table-cell">
                      {typeof item.category === "object" &&
                      item.category !== null
                        ? (item.category.name ?? "—")
                        : (item.category ?? "—")}
                    </td>
                    <td className="py-3 font-heading text-[14px] font-bold text-admin-text">
                      {item.price.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold transition-opacity hover:opacity-70 ${
                          item.isAvailable
                            ? "bg-green-500/10 text-green-700"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditItem(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-bg text-admin-muted transition-colors hover:bg-admin-accent/10 hover:text-admin-accent"
                          aria-label="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(item._id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-bg text-admin-muted transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center">
                  <p className="font-body text-[13px] text-admin-muted">
                    No menu items found.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-black/[0.06] px-4 py-3">
          <span className="font-body text-[12px] text-admin-muted">
            {pagination.total} items total
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-bg text-admin-muted transition-colors hover:bg-admin-accent/10 hover:text-admin-accent disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="min-w-[60px] text-center font-body text-[13px] font-bold text-admin-text">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-bg text-admin-muted transition-colors hover:bg-admin-accent/10 hover:text-admin-accent disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Edit / Create modal */}
      {editItem !== null && (
        <MenuItemModal
          item={editItem === "new" ? undefined : editItem}
          onClose={() => setEditItem(null)}
        />
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-[20px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.14)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-[18px] font-bold text-admin-text">
              Delete item?
            </h3>
            <p className="mt-1.5 font-body text-[13px] text-admin-muted">
              This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-full px-4 py-2 font-body text-[13px] font-semibold text-admin-muted ring-1 ring-black/[0.10] transition-colors hover:bg-admin-bg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleting}
                className="rounded-full bg-red-500 px-5 py-2 font-body text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
