// 📁 lib/cart-context.tsx
// FIX: Load server cart on mount when the user is already authenticated.
// Previously the mount effect only loaded the local cart when NOT authenticated,
// meaning an existing session (direct nav to /checkout, page refresh while
// logged in) would leave the cart empty until the auth-change effect fired.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { get, post, patch, del } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type {
  Cart,
  CartItem,
  LocalCartItem,
  MenuItem,
  OrderType,
  SelectedExtraInput,
} from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartContextValue {
  items: LocalCartItem[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;

  addItem: (
    item: MenuItem,
    quantity?: number,
    customizationOrExtras?: string | SelectedExtraInput[],
  ) => Promise<void>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  removeItem: (menuItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LOCAL_CART_KEY = "ek_cart";

function loadLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: LocalCartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

function extrasToCustomization(extras: SelectedExtraInput[]): string {
  return extras
    .map((extra) => {
      const label = extra.name ?? "Extra";
      return extra.quantity > 1 ? `${label} x${extra.quantity}` : label;
    })
    .join(", ");
}

type CartMenuRef = CartItem["menuItem"] | string | null | undefined;

function serverCartToLocal(cart: Cart): LocalCartItem[] {
  return cart.items
    .map((item: CartItem) => {
      const menu = item.menuItem as CartMenuRef;
      if (!menu) return null;

      const id =
        typeof menu === "string" ? menu : (menu._id as string | undefined);
      if (!id) return null;

      const name =
        typeof menu === "object" && "name" in menu && menu.name
          ? (menu.name as string)
          : "";

      const price =
        typeof item.unitPrice === "number"
          ? item.unitPrice
          : typeof menu === "object" &&
              "price" in menu &&
              typeof menu.price === "number"
            ? (menu.price as number)
            : 0;

      const image =
        typeof menu === "object" && Array.isArray(menu.images)
          ? (menu.images[0] ?? "")
          : "";

      return {
        lineId: item._id,
        menuItemId: id,
        name,
        price,
        image,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        customization: Array.isArray(item.selectedExtras)
          ? item.selectedExtras
              .map((se) => {
                const extra = se.extraItem;
                const label =
                  typeof extra === "string" ? "Extra" : (extra.name ?? "Extra");
                return se.quantity > 1 ? `${label} x${se.quantity}` : label;
              })
              .join(", ")
          : undefined,
      } as LocalCartItem;
    })
    .filter((i): i is LocalCartItem => i !== null);
}

async function scrubOrphanedCartItems(cart: Cart): Promise<LocalCartItem[]> {
  const hasOrphans = cart.items.some((item) => {
    const menu = item.menuItem as CartMenuRef;
    return (
      !menu ||
      (typeof menu === "object" && !menu._id) ||
      (typeof menu === "string" && !menu)
    );
  });

  if (hasOrphans) {
    await del("/cart").catch(() => {});
    return [];
  }

  return serverCartToLocal(cart);
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("delivery");

  const prevAuthRef = useRef(isAuthenticated);

  // ── Load cart from server ─────────────────────────────────────────────────

  const loadServerCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await get<{ status: string; data: { cart: Cart } }>("/cart");
      const cleaned = await scrubOrphanedCartItems(res.data.cart);
      setItems(cleaned);
    } catch {
      // Empty or error — keep current items
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Mount effect ──────────────────────────────────────────────────────────
  // FIX: If the user is already authenticated when CartProvider mounts
  // (existing session / direct navigation), load the server cart immediately.
  // Previously this branch was missing — the cart stayed empty until the
  // auth-change effect fired, which only triggers on a login event.

  useEffect(() => {
    if (isAuthenticated) {
      loadServerCart();
    } else {
      setItems(loadLocalCart());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth-change effect ────────────────────────────────────────────────────
  // Handles login: merge local cart into server cart, then load server cart.
  // Handles logout: switch back to local cart (will be empty after a login).

  useEffect(() => {
    const wasLoggedOut = !prevAuthRef.current;
    const isNowLoggedIn = isAuthenticated;

    if (wasLoggedOut && isNowLoggedIn) {
      const localItems = loadLocalCart();

      const mergeAndLoad = async () => {
        setIsLoading(true);
        try {
          for (const item of localItems) {
            if (!item.menuItemId) continue;
            await post("/cart/items", {
              menuItem: item.menuItemId,
              quantity: item.quantity,
            }).catch(() => {});
          }
          saveLocalCart([]);
          await loadServerCart();
        } finally {
          setIsLoading(false);
        }
      };

      mergeAndLoad();
    }

    if (!isAuthenticated && prevAuthRef.current) {
      setItems(loadLocalCart());
    }

    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, loadServerCart]);

  // Persist local cart to localStorage (anonymous users only)
  useEffect(() => {
    if (!isAuthenticated) {
      saveLocalCart(items);
    }
  }, [items, isAuthenticated]);

  // ── Cart actions ──────────────────────────────────────────────────────────

  const addItem = useCallback(
    async (
      menuItem: MenuItem,
      quantity = 1,
      customizationOrExtras?: string | SelectedExtraInput[],
    ) => {
      const selectedExtras = Array.isArray(customizationOrExtras)
        ? customizationOrExtras
        : undefined;
      const customization = Array.isArray(customizationOrExtras)
        ? extrasToCustomization(customizationOrExtras)
        : customizationOrExtras;

      if (isAuthenticated) {
        setIsLoading(true);
        try {
          const payload: {
            menuItem: string;
            quantity: number;
            selectedExtras?: Array<{ extraItem: string; quantity: number }>;
          } = { menuItem: menuItem._id, quantity };

          if (selectedExtras && selectedExtras.length > 0) {
            payload.selectedExtras = selectedExtras.map((extra) => ({
              extraItem: extra.extraItem,
              quantity: extra.quantity,
            }));
          }

          const res = await post<{ status: string; data: { cart: Cart } }>(
            "/cart/items",
            payload,
          );
          setItems(serverCartToLocal(res.data.cart));
        } finally {
          setIsLoading(false);
        }
      } else {
        setItems((prev) => {
          const existing = prev.find((i) => i.menuItemId === menuItem._id);
          if (existing) {
            return prev.map((i) =>
              i.menuItemId === menuItem._id
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            );
          }
          const extrasPrice =
            selectedExtras?.reduce(
              (sum, extra) =>
                sum + (extra.price ?? 0) * Math.max(0, extra.quantity),
              0,
            ) ?? 0;
          const unitPrice = menuItem.price + extrasPrice;
          return [
            ...prev,
            {
              menuItemId: menuItem._id,
              name: menuItem.name,
              price: unitPrice,
              image: menuItem.images?.[0] ?? "",
              quantity,
              lineTotal: unitPrice * quantity,
              customization,
              selectedExtras,
            },
          ];
        });
      }
    },
    [isAuthenticated],
  );

  const updateQuantity = useCallback(
    async (menuItemId: string, quantity: number) => {
      if (quantity < 1) return;

      if (isAuthenticated) {
        setIsLoading(true);
        try {
          const res = await patch<{ status: string; data: { cart: Cart } }>(
            `/cart/items/${menuItemId}`,
            { quantity },
          );
          setItems(serverCartToLocal(res.data.cart));
        } finally {
          setIsLoading(false);
        }
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i,
          ),
        );
      }
    },
    [isAuthenticated],
  );

  const removeItem = useCallback(
    async (menuItemId: string) => {
      if (isAuthenticated) {
        setIsLoading(true);
        try {
          const res = await del<{ status: string; data: { cart: Cart } }>(
            `/cart/items/${menuItemId}`,
          );
          setItems(serverCartToLocal(res.data.cart));
        } finally {
          setIsLoading(false);
        }
      } else {
        setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
      }
    },
    [isAuthenticated],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        await del("/cart");
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems([]);
      saveLocalCart([]);
    }
  }, [isAuthenticated]);

  // ── Derived values ────────────────────────────────────────────────────────

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.lineTotal ?? item.price * item.quantity),
        0,
      ),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalAmount,
      itemCount,
      isLoading,
      orderType,
      setOrderType,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
    }),
    [
      items,
      totalAmount,
      itemCount,
      isLoading,
      orderType,
      setOrderType,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
