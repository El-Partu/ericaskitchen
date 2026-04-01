"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Clock, Star, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MenuItem } from "@/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useLikeStatus, useToggleLike } from "@/lib/hooks/useMenu";
import ExtraItemsModal from "@/components/shared/ExtraItemsModal";

interface MenuCardProps {
  item: MenuItem;
}

function isDrinkCategory(item: MenuItem): boolean {
  const name = item.category?.name?.toLowerCase() ?? "";
  const slug = item.category?.slug?.toLowerCase() ?? "";
  return (
    name.includes("drink") ||
    name.includes("beverage") ||
    slug.includes("drink") ||
    slug.includes("beverage")
  );
}

export default function MenuCard({ item }: MenuCardProps) {
  const [qty, setQty] = useState(0);
  const [showExtras, setShowExtras] = useState(false);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const isDrink = isDrinkCategory(item);
  const itemImage = item.images?.[0] ?? "";
  const prepLabel = item.preparationTime ? `${item.preparationTime} min` : null;
  const description = item.description?.trim() ?? "";
  const hasDescription = !isDrink && description.length > 0;

  // API-driven: if the menu item has extraItems configured, show the extras modal
  const hasExtras = (item.extraItems?.length ?? 0) > 0;

  const { data: liked } = useLikeStatus(item._id, isAuthenticated);
  const { mutate: toggleLike, isPending: likeLoading } = useToggleLike();
  const isFav = liked ?? false;

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast("Sign in to save favourites", { icon: "❤️" });
      router.push("/login");
      return;
    }
    if (likeLoading) return;
    toggleLike(item._id, {
      onSuccess: (data) => {
        toast(
          data.data.liked ? "Added to favourites" : "Removed from favourites",
          { icon: "❤️" },
        );
      },
    });
  };

  const handleAddToCart = async () => {
    if (!item.isAvailable) return;
    if (hasExtras) {
      setShowExtras(true);
    } else {
      await addItem(item, 1);
      toast.success(`${item.name} added to cart`);
    }
  };

  const handleDrinkAdd = async () => {
    if (!item.isAvailable || qty === 0) return;
    await addItem(item, qty);
    toast.success(`${qty}x ${item.name} added to cart`);
    setQty(0);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={{
          y: -8,
          boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
          transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
        }}
        className="relative mt-16 flex flex-col rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
      >
        {/* Image */}
        <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2">
          <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
            <div className="relative h-[84px] w-[84px] overflow-hidden rounded-full bg-[#f5f0eb]">
              {itemImage ? (
                <Image
                  src={itemImage}
                  alt={item.name}
                  fill
                  sizes="84px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag size={24} className="text-gray-text" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unavailable ribbon */}
        {!item.isAvailable && (
          <div className="absolute left-0 right-0 top-0 flex items-center justify-center rounded-t-[24px] bg-gray-light/80 py-1.5 backdrop-blur-sm">
            <span className="font-body text-[11px] font-semibold uppercase tracking-widest text-gray-text">
              Unavailable
            </span>
          </div>
        )}

        {/* Heart */}
        <button
          onClick={handleFavorite}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.10)] transition-transform hover:scale-110 active:scale-95"
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart
            size={16}
            className={isFav ? "fill-primary text-primary" : "text-[#aaaaaa]"}
            strokeWidth={isFav ? 0 : 2}
          />
        </button>

        {/* Card body */}
        <div className="flex flex-1 flex-col px-5 pb-5 pt-14">
          <h3 className="text-center font-heading text-[17px] font-bold leading-tight text-foreground">
            {item.name}
          </h3>

          <div className="mt-2 flex items-center justify-center gap-3">
            {item.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="font-body text-[12px] text-foreground/50">
                  {item.averageRating.toFixed(1)}
                  {item.totalReviews > 0 && (
                    <span className="ml-0.5 text-foreground/35">
                      ({item.totalReviews})
                    </span>
                  )}
                </span>
              </div>
            )}
            {!isDrink && prepLabel && (
              <>
                {item.averageRating > 0 && (
                  <span className="h-3 w-px bg-black/10" />
                )}
                <div className="flex items-center gap-1">
                  <Clock size={11} className="text-foreground/35" />
                  <span className="font-body text-[12px] text-foreground/50">
                    {prepLabel}
                  </span>
                </div>
              </>
            )}
          </div>

          {hasDescription && (
            <p className="mt-2.5 line-clamp-2 text-center font-body text-[13px] leading-relaxed text-foreground/50">
              {description}
            </p>
          )}

          {hasDescription ? (
            <div className="flex-1" />
          ) : (
            <div className="mt-2" />
          )}
          <div className="my-4 h-px w-full bg-black/[0.06]" />

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-body text-[10px] uppercase tracking-widest text-foreground/35">
                Price
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="font-body text-[11px] font-medium text-foreground/50">
                  GH₵
                </span>
                <span className="font-heading text-[22px] font-bold leading-none text-foreground">
                  {item.price.toFixed(2)}
                </span>
              </div>
            </div>

            {isDrink ? (
              <div className="flex max-w-full flex-wrap items-center justify-end gap-2.5">
                <button
                  onClick={() => setQty((q) => Math.max(0, q - 1))}
                  disabled={qty === 0}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-black/30 disabled:opacity-30 sm:h-8 sm:w-8"
                  aria-label="Decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[20px] shrink-0 text-center font-heading text-lg font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-white transition-opacity hover:opacity-80 sm:h-8 sm:w-8"
                  aria-label="Increase"
                >
                  <Plus size={14} />
                </button>
                {qty > 0 && (
                  <button
                    onClick={handleDrinkAdd}
                    disabled={!item.isAvailable}
                    className="w-full rounded-full bg-primary px-4 py-2 font-body text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
                  >
                    Add
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!item.isAvailable}
                className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.35)] transition-all hover:opacity-90 hover:shadow-[0_4px_16px_rgba(235,108,108,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {hasExtras ? "Customise" : "Add to cart"}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-sm font-bold leading-none">
                  +
                </span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {showExtras && (
        <ExtraItemsModal item={item} onClose={() => setShowExtras(false)} />
      )}
    </>
  );
}
