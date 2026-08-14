import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col gap-0 font-sans sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl text-primary">
            Your order {itemCount > 0 && `(${itemCount})`}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
            <p>Your cart is empty. Add something delicious from the menu.</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="truncate font-medium text-foreground">{item.product.name}</h4>
                    {item.extras.length > 0 && (
                      <ul className="mt-1 text-xs text-muted-foreground">
                        {item.extras.map((e) => (
                          <li key={e.optionId}>
                            {e.groupName}: {e.optionName}
                            {e.price > 0 ? ` (+${e.price.toFixed(2)} €)` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.notes && (
                      <p className="mt-1 text-xs italic text-muted-foreground">"{item.notes}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-muted-foreground transition-smooth hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-border p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full transition-smooth hover:bg-muted"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full transition-smooth hover:bg-muted"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-medium text-primary">{item.lineTotal.toFixed(2)} €</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-3 border-t border-border pt-4 sm:flex-col">
            <div className="flex w-full items-center justify-between font-serif text-lg">
              <span>Subtotal</span>
              <span className="text-primary">{subtotal.toFixed(2)} €</span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                closeCart();
                navigate("/checkout");
              }}
            >
              Go to checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
