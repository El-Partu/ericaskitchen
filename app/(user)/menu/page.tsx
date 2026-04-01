// 📁 app/(user)/menu/page.tsx

"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/shared/HeroSection";
import LocationBar from "@/components/shared/LocationBar";
import MenuCard from "@/components/shared/MenuCard";
import CartPanel from "@/components/shared/CartPanel";
import CategoryTabs from "@/components/shared/CategoryTabs";
import { useCategories, useMenuItems } from "@/lib/hooks/useMenu";
import { useCart } from "@/lib/cart-context";
import type { MenuItemFilters } from "@/types";
import { SlideUp } from "@/components/ui/Animations";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  X,
} from "lucide-react";
import Link from "next/link";

const LIMIT = 9;

// ── Skeleton matches new MenuCard proportions ────────────────────────────────
function MenuCardSkeleton() {
  return (
    <div className="relative mt-16 animate-pulse rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {/* Image ring */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="h-[84px] w-[84px] rounded-full bg-[#ede8e3]" />
        </div>
      </div>
      <div className="px-5 pb-5 pt-14">
        <div className="mx-auto h-5 w-2/3 rounded-full bg-[#ede8e3]" />
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-3 w-10 rounded-full bg-[#ede8e3]" />
          <div className="h-3 w-px bg-[#ede8e3]" />
          <div className="h-3 w-12 rounded-full bg-[#ede8e3]" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-3 rounded-full bg-[#ede8e3]" />
          <div className="mx-auto h-3 w-4/5 rounded-full bg-[#ede8e3]" />
        </div>
        <div className="my-4 h-px bg-[#ede8e3]" />
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-2.5 w-8 rounded-full bg-[#ede8e3]" />
            <div className="h-6 w-16 rounded-full bg-[#ede8e3]" />
          </div>
          <div className="h-10 w-32 rounded-full bg-[#ede8e3]" />
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { itemCount, totalAmount } = useCart();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters: MenuItemFilters = {
    ...(activeCategory !== "all" && { category: activeCategory }),
    ...(searchQuery && { search: searchQuery }),
    page,
    limit: LIMIT,
  };

  const {
    data,
    isLoading: itemsLoading,
    isFetching,
    isError,
    error,
  } = useMenuItems(filters);

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (pagination && page > pagination.pages && pagination.pages > 0) {
      setPage(pagination.pages);
    }
  }, [pagination, page]);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  return (
    <>
      <HeroSection
        image="/images/hero-menu.jpg"
        imageAlt="Food of the Day - Banku with Soup"
        title={
          <>
            Food of the
            <br />
            Day - Banku with Soup
          </>
        }
        ctaLabel="Place Order"
        ctaHref="/menu"
      />

      <LocationBar />

      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-12 lg:py-16">
        <div className="flex items-start gap-8 lg:gap-10">
          {/* ── Menu content ────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* Title */}
            <SlideUp>
              <div className="text-center">
                <h2 className="font-heading text-3xl font-black text-foreground">
                  Our Menu
                </h2>
                <p className="mt-1 font-body text-sm text-foreground/40">
                  Fresh, homemade Ghanaian food — order now
                </p>
              </div>
            </SlideUp>

            {/* Search */}
            <SlideUp delay={0.05}>
              <div className="mx-auto mt-6 max-w-lg sm:mt-7">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30"
                  />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for a dish…"
                    className="w-full rounded-full border border-black/10 bg-white py-3 pl-10 pr-10 font-body text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] outline-none transition-all focus:border-primary focus:shadow-[0_2px_12px_rgba(235,108,108,0.12)]"
                  />
                  {searchInput ? (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-black/10 transition-colors hover:bg-black/20"
                      aria-label="Clear search"
                    >
                      <X size={11} className="text-foreground/60" />
                    </button>
                  ) : searchInput !== searchQuery ? (
                    <span className="absolute right-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 animate-pulse rounded-full bg-primary" />
                  ) : null}
                </div>
              </div>
            </SlideUp>

            {/* Category tabs */}
            <div className="mt-8">
              {categoriesLoading ? (
                <div className="flex flex-wrap justify-center gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-24 animate-pulse rounded-[10px] bg-gray-light"
                    />
                  ))}
                </div>
              ) : (
                <CategoryTabs
                  categories={categories ?? []}
                  active={activeCategory}
                  onChange={handleCategoryChange}
                />
              )}
            </div>

            {/* Active filter pills */}
            {(searchQuery || activeCategory !== "all") && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {activeCategory !== "all" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
                    {categories?.find((c) => c._id === activeCategory)?.name ??
                      "Category"}
                    <button
                      onClick={() => handleCategoryChange("all")}
                      aria-label="Clear category"
                      className="hover:opacity-70"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 font-body text-xs font-medium text-foreground/60">
                    "{searchQuery}"
                    <button
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="hover:opacity-70"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {pagination && (
                  <span className="font-body text-xs text-foreground/30">
                    {pagination.total} result{pagination.total !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}

            {/* Background fetch indicator */}
            {isFetching && !itemsLoading && (
              <div className="mt-5 flex items-center justify-center gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Grid */}
            {itemsLoading ? (
              <div className="mt-14 grid gap-x-6 gap-y-14 pt-4 sm:mt-16 sm:gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(LIMIT)].map((_, i) => (
                  <MenuCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="mt-16 rounded-[20px] border border-red-100 bg-red-50/60 p-10 text-center">
                <p className="font-body text-sm text-red-400">
                  {(error as any)?.message ?? "Failed to load menu items."}
                </p>
                <button
                  onClick={() => setPage(1)}
                  className="mt-3 font-body text-sm text-primary underline"
                >
                  Try again
                </button>
              </div>
            ) : items.length > 0 ? (
              <div
                className={`mt-16 grid gap-x-6 gap-y-16 pt-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300 ${
                  isFetching ? "opacity-50" : "opacity-100"
                }`}
              >
                {items.map((item) => (
                  <MenuCard key={item._id} item={item} />
                ))}
              </div>
            ) : (
              <div className="mt-16 flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f0eb]">
                  <Search size={22} className="text-foreground/30" />
                </div>
                <p className="font-body text-base text-foreground/50">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "No items in this category yet."}
                </p>
                <button
                  onClick={() => {
                    handleCategoryChange("all");
                    clearSearch();
                  }}
                  className="mt-3 font-body text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-all hover:border-primary hover:text-primary hover:shadow-[0_2px_8px_rgba(235,108,108,0.2)] disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.pages ||
                        Math.abs(p - page) <= 1,
                    )
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                        acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="w-8 text-center font-body text-sm text-foreground/30"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`flex h-9 w-9 items-center justify-center rounded-full font-body text-sm font-medium transition-all ${
                            page === p
                              ? "bg-primary text-white shadow-[0_4px_12px_rgba(235,108,108,0.35)]"
                              : "text-foreground/50 hover:bg-black/5"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                </div>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                  disabled={page === pagination.pages}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-all hover:border-primary hover:text-primary hover:shadow-[0_2px_8px_rgba(235,108,108,0.2)] disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </div>

          {/* ── Cart sidebar ─────────────────────────────────────────────── */}
          <div className="hidden xl:block w-[380px] shrink-0">
            <div className="sticky top-24">
              <CartPanel />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky cart bar ───────────────────────────────────────── */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          <div className="relative mx-4 mb-4">
            <Link
              href="/checkout"
              className="flex items-center justify-between rounded-[18px] bg-[#1e2025] px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <ShoppingCart size={18} className="text-white" />
                  <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary font-body text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                </div>
                <div>
                  <p className="font-body text-[11px] text-white/50">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} in cart
                  </p>
                  <p className="font-heading text-base font-bold text-white">
                    GH₵ {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 shadow-[0_4px_12px_rgba(235,108,108,0.4)]">
                <span className="font-body text-sm font-bold text-white">
                  Checkout
                </span>
                <ChevronRight size={15} className="text-white" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {itemCount > 0 && <div className="xl:hidden h-28" />}
    </>
  );
}
