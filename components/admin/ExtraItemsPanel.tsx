// 📁 components/admin/ExtraItemsPanel.tsx

"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  useExtraItems,
  useExtraItemCategories,
  useCreateExtraItem,
  useUpdateExtraItem,
  useDeleteExtraItem,
  useCreateExtraItemCategory,
  useUpdateExtraItemCategory,
  useDeleteExtraItemCategory,
  type ExtraItem,
  type ExtraItemCategory,
  type CreateExtraItemPayload,
} from "@/lib/hooks/useExtraItems";

// ── Category Modal ────────────────────────────────────────────────────────────

function CategoryModal({
  category,
  onClose,
}: {
  category?: ExtraItemCategory;
  onClose: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const { mutate: create, isPending: creating } = useCreateExtraItemCategory();
  const { mutate: update, isPending: updating } = useUpdateExtraItemCategory();
  const isPending = creating || updating;

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (category) {
      update(
        { id: category._id, name: name.trim() },
        {
          onSuccess: () => {
            toast.success("Category updated");
            onClose();
          },
          onError: () => toast.error("Failed to update category"),
        },
      );
    } else {
      create(
        { name: name.trim() },
        {
          onSuccess: () => {
            toast.success("Category created");
            onClose();
          },
          onError: () => toast.error("Failed to create category"),
        },
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-semibold mb-4">
          {category ? "Edit category" : "New category"}
        </h3>
        <div>
          <label className="font-body text-sm font-medium text-[#4a4f63]">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. Soups, Proteins…"
            className="mt-1 w-full rounded border border-[#d1d1d1] px-3 py-2 font-body text-sm focus:outline-primary"
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 font-body text-sm outline outline-1 outline-[#d1d1d1] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-md bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Saving…" : category ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Extra Item Modal ──────────────────────────────────────────────────────────

function ExtraItemModal({
  item,
  onClose,
}: {
  item?: ExtraItem;
  onClose: () => void;
}) {
  const { data: categories } = useExtraItemCategories();
  const { mutate: create, isPending: creating } = useCreateExtraItem();
  const { mutate: update, isPending: updating } = useUpdateExtraItem();
  const isPending = creating || updating;

  const defaultCategory =
    item?.category && typeof item.category === "object"
      ? item.category._id
      : ((item?.category as string) ?? "");

  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState(item?.price ?? 0);
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState(defaultCategory);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (price < 0) {
      toast.error("Price must be 0 or more.");
      return;
    }
    if (!category) {
      toast.error("Category is required.");
      return;
    }

    const payload: CreateExtraItemPayload = {
      name: name.trim(),
      price,
      description: description.trim() || undefined,
      category,
    };

    if (item) {
      update(
        { id: item._id, payload },
        {
          onSuccess: () => {
            toast.success("Extra item updated");
            onClose();
          },
          onError: () => toast.error("Failed to update extra item"),
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Extra item created");
          onClose();
        },
        onError: () => toast.error("Failed to create extra item"),
      });
    }
  };

  const inputClass =
    "mt-1 w-full rounded border border-[#d1d1d1] px-3 py-2 font-body text-sm focus:outline-primary";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-semibold mb-4">
          {item ? "Edit extra item" : "New extra item"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="font-body text-sm font-medium text-[#4a4f63]">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-sm font-medium text-[#4a4f63]">
                Price (GH₵) *
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-[#4a4f63]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">Select…</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="font-body text-sm font-medium text-[#4a4f63]">
              Description{" "}
              <span className="font-normal text-foreground/40">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 font-body text-sm outline outline-1 outline-[#d1d1d1] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-md bg-primary px-5 py-2 font-body text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Saving…" : item ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function ExtraItemsPanel() {
  const { data: categories, isLoading: catsLoading } = useExtraItemCategories();
  const { data: items, isLoading: itemsLoading } = useExtraItems();
  const { mutate: deleteCategory, isPending: deletingCat } =
    useDeleteExtraItemCategory();
  const { mutate: deleteItem, isPending: deletingItem } = useDeleteExtraItem();

  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<string>("all");
  const [editCategory, setEditCategory] = useState<
    ExtraItemCategory | null | "new"
  >(null);
  const [editItem, setEditItem] = useState<ExtraItem | null | "new">(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "category" | "item";
    id: string;
    name: string;
  } | null>(null);

  const filteredItems =
    activeCategoryFilter === "all"
      ? (items ?? [])
      : (items ?? []).filter((i) => {
          const catId =
            typeof i.category === "object" ? i.category._id : i.category;
          return catId === activeCategoryFilter;
        });

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "category") {
      deleteCategory(confirmDelete.id, {
        onSuccess: () => {
          toast.success("Category deleted");
          setConfirmDelete(null);
        },
        onError: () => toast.error("Failed to delete category"),
      });
    } else {
      deleteItem(confirmDelete.id, {
        onSuccess: () => {
          toast.success("Extra item deleted");
          setConfirmDelete(null);
        },
        onError: () => toast.error("Failed to delete extra item"),
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      {/* ── Categories section ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-body text-sm font-semibold text-[#4a4a4a]">
            Categories
          </h3>
          <button
            onClick={() => setEditCategory("new")}
            className="flex items-center gap-1 rounded-md bg-[#4a4a4a] px-3 py-1.5 font-body text-xs font-semibold text-white hover:bg-[#333]"
          >
            <Plus size={12} />
            New category
          </button>
        </div>

        {catsLoading ? (
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 animate-pulse rounded-md bg-gray-100"
              />
            ))}
          </div>
        ) : !categories?.length ? (
          <p className="font-body text-sm text-[#6b6b6b]">
            No categories yet. Create one to get started.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center gap-1 rounded-md bg-[#f5f5f5] px-3 py-1.5 outline outline-1 outline-[#d1d1d1]"
              >
                <span className="font-body text-sm text-[#2a2a2a]">
                  {cat.name}
                </span>
                <button
                  onClick={() => setEditCategory(cat)}
                  className="ml-1 text-[#4a4a4a] hover:text-primary"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() =>
                    setConfirmDelete({
                      type: "category",
                      id: cat._id,
                      name: cat.name,
                    })
                  }
                  className="text-[#4a4a4a] hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Extra Items section ────────────────────────────────────── */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-body text-sm font-semibold text-[#4a4a4a]">
            Extra Items
          </h3>
          <button
            onClick={() => setEditItem("new")}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-body text-xs font-semibold text-white hover:bg-primary-light"
          >
            <Plus size={12} />
            Add item
          </button>
        </div>

        {/* Category filter tabs */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveCategoryFilter("all")}
              className={`rounded-md px-3 py-1 font-body text-xs font-semibold transition-colors ${activeCategoryFilter === "all" ? "bg-[#4a4a4a] text-white" : "bg-white text-[#4a4a4a] outline outline-1 outline-[#d1d1d1] hover:bg-[#f5f5f5]"}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategoryFilter(cat._id)}
                className={`rounded-md px-3 py-1 font-body text-xs font-semibold transition-colors ${activeCategoryFilter === cat._id ? "bg-[#4a4a4a] text-white" : "bg-white text-[#4a4a4a] outline outline-1 outline-[#d1d1d1] hover:bg-[#f5f5f5]"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Items table */}
        <div className="overflow-x-auto rounded-lg outline outline-1 outline-[#e1dcd8]">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-[#d1d1d1] bg-[#fafafa]">
                <th className="py-2 pl-4 font-semibold text-[#4a4a4a]">Name</th>
                <th className="py-2 font-semibold text-[#4a4a4a]">Category</th>
                <th className="py-2 font-semibold text-[#4a4a4a]">GH₵ Price</th>
                <th className="py-2 font-semibold text-[#4a4a4a]">
                  Description
                </th>
                <th className="py-2 font-semibold text-[#4a4a4a]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {itemsLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-[#e1dcd8]">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="py-3 pl-4">
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6b6b6b]">
                    No extra items found. Add one to get started.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const catName =
                    typeof item.category === "object"
                      ? item.category.name
                      : (categories?.find((c) => c._id === item.category)
                          ?.name ?? "—");
                  return (
                    <tr
                      key={item._id}
                      className="border-b border-[#e1dcd8] hover:bg-admin-bg/30 transition-colors"
                    >
                      <td className="py-3 pl-4 font-semibold text-[#2a2a2a]">
                        {item.name}
                      </td>
                      <td className="py-3 text-[#4a4a4a]">{catName}</td>
                      <td className="py-3 font-semibold text-[#2a2a2a]">
                        {item.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-[#6b6b6b] max-w-[200px] truncate">
                        {item.description ?? "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditItem(item)}
                            className="text-[#4a4a4a] hover:text-primary"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: "item",
                                id: item._id,
                                name: item.name,
                              })
                            }
                            className="text-[#4a4a4a] hover:text-red-500"
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {editCategory !== null && (
        <CategoryModal
          category={editCategory === "new" ? undefined : editCategory}
          onClose={() => setEditCategory(null)}
        />
      )}

      {editItem !== null && (
        <ExtraItemModal
          item={editItem === "new" ? undefined : editItem}
          onClose={() => setEditItem(null)}
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-semibold">
              Delete {confirmDelete.type}?
            </h3>
            <p className="mt-2 font-body text-sm text-foreground/60">
              <span className="font-semibold">"{confirmDelete.name}"</span> will
              be permanently deleted.
              {confirmDelete.type === "category" &&
                " This will not delete the items in this category."}
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md px-4 py-2 font-body text-sm outline outline-1 outline-[#d1d1d1] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={deletingCat || deletingItem}
                className="rounded-md bg-red-500 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deletingCat || deletingItem ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
