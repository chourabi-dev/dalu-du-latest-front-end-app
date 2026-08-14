import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { CartItem, CartLineExtra, Product } from "@/types/ordering";

const STORAGE_PREFIX = "dalu-cart-";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, extras: CartLineExtra[], notes?: string) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function makeLineId() {
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const CartProvider: React.FC<{ restaurantId: string | null; children: React.ReactNode }> = ({
  restaurantId,
  children,
}) => {
  const storageKey = restaurantId ? `${STORAGE_PREFIX}${restaurantId}` : null;

  const [items, setItems] = useState<CartItem[]>(() => {
    if (!storageKey) return [];
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Reload cart whenever the active restaurant changes.
  useEffect(() => {
    if (!storageKey) {
      setItems([]);
      return;
    }
    const raw = localStorage.getItem(storageKey);
    setItems(raw ? (JSON.parse(raw) as CartItem[]) : []);
  }, [storageKey]);

  // Persist on every change.
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (product: Product, quantity: number, extras: CartLineExtra[], notes?: string) => {
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = product.price + extrasTotal;
    const line: CartItem = {
      id: makeLineId(),
      product,
      quantity,
      extras,
      notes,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
    setItems((prev) => [...prev, line]);
    setIsCartOpen(true);
  };

  const removeItem = (lineId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === lineId
          ? { ...i, quantity, lineTotal: i.unitPrice * quantity }
          : i
      ).filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.lineTotal, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
