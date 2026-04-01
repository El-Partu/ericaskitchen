"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/shared/HeroSection";
import LocationBar from "@/components/shared/LocationBar";
import CategoryTabs from "@/components/shared/CategoryTabs";
import MenuCard from "@/components/shared/MenuCard";
import CartPanel from "@/components/shared/CartPanel";
import { useCategories, useMenuItems } from "@/lib/hooks/useMenu";
import { MenuItemFilters } from "@/types";
import {
  SlideIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/Animations";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const LIMIT = 6;

function MenuCardSkeleton() {
  return (
    <div className="relative mt-14 animate-pulse rounded-[20px] bg-white shadow-[0_0_4px_rgba(0,0,0,0.25)]">
      <div className="absolute -top-14 left-1/2 z-10 -translate-x-1/2">
        <div className="h-[120px] w-[120px] rounded-full bg-gray-light" />
      </div>
      <div className="space-y-3 px-6 pb-6 pt-16">
        <div className="h-6 w-3/4 rounded bg-gray-light" />
        <div className="h-4 rounded bg-gray-light" />
        <div className="h-4 w-1/2 rounded bg-gray-light" />
        <div className="mt-4 h-10 rounded-[10px] bg-gray-light" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const filters: MenuItemFilters = {
    ...(activeCategory !== "all" && { category: activeCategory }),
    limit: LIMIT,
    isAvailable: true,
  };

  const { data, isLoading: itemsLoading } = useMenuItems(filters);
  const items = data?.items ?? [];

  useEffect(() => {
    if (
      categories &&
      activeCategory !== "all" &&
      !categories.find((c) => c._id === activeCategory)
    ) {
      setActiveCategory("all");
    }
  }, [categories, activeCategory]);

  return (
    <>
      {/* Hero */}
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

      {/* Location / Dine-In Bar */}
      <LocationBar />

      {/* Menu + Cart */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-12 lg:py-16">
        <h2 className="text-center font-heading text-2xl font-semibold">
          Menu
        </h2>

        {/* Category Tabs */}
        <div className="mt-8">
          {categoriesLoading ? (
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 w-28 animate-pulse rounded-[10px] bg-gray-light"
                />
              ))}
            </div>
          ) : (
            <CategoryTabs
              categories={categories ?? []}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          )}
        </div>

        {/* Two-column layout */}
        <div className="mt-10 flex flex-col gap-8 pt-4 lg:mt-12 lg:flex-row lg:pt-8">
          {/* Menu Cards — left side */}
          <div className="flex-1">
            {itemsLoading ? (
              <div className="grid gap-8 sm:grid-cols-2">
                {Array.from({ length: LIMIT }).map((_, i) => (
                  <MenuCardSkeleton key={i} />
                ))}
              </div>
            ) : items.length > 0 ? (
              <StaggerContainer className="grid gap-8 sm:grid-cols-2">
                {items.map((item) => (
                  <StaggerItem key={item._id}>
                    <MenuCard item={item} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <p className="mt-12 text-center font-body text-lg text-foreground/50">
                No items in this category yet. Check back soon!
              </p>
            )}
          </div>

          {/* Cart Panel — mobile in-flow */}
          <SlideIn direction="right" delay={0.15}>
            <div id="cart-panel" className="lg:hidden">
              <CartPanel />
            </div>
          </SlideIn>

          {/* Cart Panel — right sidebar */}
          <SlideIn direction="right" delay={0.2}>
            <aside className="hidden w-full max-w-[380px] shrink-0 lg:block">
              <CartPanel />
            </aside>
          </SlideIn>
        </div>
      </section>

      {/* Mobile floating cart button */}
      <MobileCartFab />
    </>
  );
}
function MobileCartFab() {
  const { itemCount } = useCart();

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 lg:hidden">
      <a
        href="#cart-panel"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
        aria-label="View cart"
      >
        <ShoppingCart size={24} />

        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </a>
    </div>
  );
}
