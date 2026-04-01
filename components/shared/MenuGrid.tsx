"use client";

import MenuCard from "@/components/shared/MenuCard";
import Button from "@/components/ui/Button";
import { useMenuItems } from "@/lib/hooks/useMenu";
import {
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/Animations";

// Skeleton card placeholder
function MenuCardSkeleton() {
  return (
    <div className="relative mt-14 animate-pulse rounded-[20px] bg-white shadow-[0_0_4px_rgba(0,0,0,0.25)]">
      <div className="absolute -top-14 left-1/2 z-10 -translate-x-1/2">
        <div className="h-[120px] w-[120px] rounded-full bg-gray-light" />
      </div>
      <div className="px-6 pb-6 pt-16 space-y-3">
        <div className="h-6 w-3/4 rounded bg-gray-light" />
        <div className="h-4 rounded bg-gray-light" />
        <div className="h-4 w-1/2 rounded bg-gray-light" />
        <div className="mt-4 h-10 rounded-[10px] bg-gray-light" />
      </div>
    </div>
  );
}

export default function MenuGrid() {
  const { data, isLoading } = useMenuItems({ isFeatured: true, limit: 6 });
  const items = data?.items ?? [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
      <SlideUp>
        <h2 className="font-heading text-2xl font-semibold">Menu</h2>
      </SlideUp>

      {isLoading ? (
        <div className="mt-10 grid gap-8 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <StaggerContainer className="mt-10 grid gap-8 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item._id}>
              <MenuCard item={item} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <SlideUp delay={0.2}>
        <div className="mt-12 flex justify-center">
          <Button
            href="/menu"
            variant="primary-light"
            size="md"
            className="w-full max-w-xl"
          >
            View all Menu
          </Button>
        </div>
      </SlideUp>
    </section>
  );
}
