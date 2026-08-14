import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Minus, Plus } from "lucide-react";
import { extrasApi } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import type { Product, CartLineExtra, ExtraGroup } from "@/types/ordering";
import { cn } from "@/lib/utils";

interface ExtrasModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Selections keyed by group id.
// - "single" groups store a single option id (string)
// - "multiple" groups store an array of option ids
type Selections = Record<string, string | string[]>;

const ExtrasModal = ({ product, open, onOpenChange }: ExtrasModalProps) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Selections>({});
  const [notes, setNotes] = useState("");

  const {
    data: extraGroups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["extras", product?.id],
    queryFn: () => extrasApi.forProduct(product!.id),
    enabled: !!product && open,
  });

  // Reset transient state whenever a new product is opened.
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelections({});
      setNotes("");
    }
  }, [open, product?.id]);

  // Pre-select defaults once groups load.
  useEffect(() => {
    if (!extraGroups.length) return;
    setSelections((prev) => {
      const next = { ...prev };
      for (const group of extraGroups) {
        if (next[group.id] !== undefined) continue;
        const defaults = group.options.filter((o) => o.isDefault).map((o) => o.id);
        if (group.selectionType === "single") {
          next[group.id] = defaults[0] || "";
        } else {
          next[group.id] = defaults;
        }
      }
      return next;
    });
  }, [extraGroups]);

  const toggleMultiple = (group: ExtraGroup, optionId: string) => {
    setSelections((prev) => {
      const current = (prev[group.id] as string[] | undefined) || [];
      const isSelected = current.includes(optionId);
      let next: string[];
      if (isSelected) {
        next = current.filter((id) => id !== optionId);
      } else {
        if (group.maxSelect && current.length >= group.maxSelect) {
          // Respect max — swap out the earliest pick to make room.
          next = [...current.slice(1), optionId];
        } else {
          next = [...current, optionId];
        }
      }
      return { ...prev, [group.id]: next };
    });
  };

  const setSingle = (group: ExtraGroup, optionId: string) => {
    setSelections((prev) => ({ ...prev, [group.id]: optionId }));
  };

  const missingRequired = useMemo(() => {
    return extraGroups.filter((g) => {
      if (!g.required) return false;
      const sel = selections[g.id];
      if (g.selectionType === "single") return !sel;
      return !sel || (sel as string[]).length < (g.minSelect || 1);
    });
  }, [extraGroups, selections]);

  const selectedExtras: CartLineExtra[] = useMemo(() => {
    const result: CartLineExtra[] = [];
    for (const group of extraGroups) {
      const sel = selections[group.id];
      const ids = group.selectionType === "single" ? [sel as string].filter(Boolean) : ((sel as string[]) || []);
      for (const optionId of ids) {
        const option = group.options.find((o) => o.id === optionId);
        if (option) {
          result.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            price: option.price,
          });
        }
      }
    }
    return result;
  }, [extraGroups, selections]);

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const totalPrice = product ? (product.price + extrasTotal) * quantity : 0;

  const handleAddToCart = () => {
    if (!product || missingRequired.length > 0) return;
    addItem(product, quantity, selectedExtras, notes.trim() || undefined);
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg font-sans">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">{product.name}</DialogTitle>
          
          {product.description && (
            <DialogDescription>{product.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[50vh] space-y-6 overflow-y-auto pr-1">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading options…</span>
            </div>
          )}

          {!!error && !isLoading && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              Couldn't load extras for this item. You can still add it as-is.
            </div>
          )}

          {!isLoading &&
            extraGroups.map((group) => (
              <div key={group.id}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h4 className="font-medium text-foreground">
                    {group.name}
                    {group.required && <span className="ml-1 text-xs text-destructive">*required</span>}
                  </h4>
                  {group.selectionType === "multiple" && group.maxSelect > 1 && (
                    <span className="text-xs text-muted-foreground">choose up to {group.maxSelect}</span>
                  )}
                </div>

                {group.selectionType === "single" ? (
                  <RadioGroup
                    value={(selections[group.id] as string) || ""}
                    onValueChange={(val) => setSingle(group, val)}
                    className="space-y-2"
                  >
                    {group.options.map((option) => (
                      <label
                        key={option.id}
                        htmlFor={`${group.id}-${option.id}`}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2 transition-smooth hover:border-primary/50",
                          selections[group.id] === option.id && "border-primary bg-primary/5"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <RadioGroupItem value={option.id} id={`${group.id}-${option.id}`} />
                          {option.name}
                        </span>
                        {option.price > 0 && (
                          <span className="text-sm text-muted-foreground">+{option.price.toFixed(2)} €</span>
                        )}
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isChecked = ((selections[group.id] as string[]) || []).includes(option.id);
                      return (
                        <label
                          key={option.id}
                          htmlFor={`${group.id}-${option.id}`}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2 transition-smooth hover:border-primary/50",
                            isChecked && "border-primary bg-primary/5"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Checkbox
                              id={`${group.id}-${option.id}`}
                              checked={isChecked}
                              onCheckedChange={() => toggleMultiple(group, option.id)}
                            />
                            {option.name}
                          </span>
                          {option.price > 0 && (
                            <span className="text-sm text-muted-foreground">+{option.price.toFixed(2)} €</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

          <div>
            <h4 className="mb-2 font-medium text-foreground">Special instructions</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any allergies or preferences? (optional)"
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="mt-2 flex-col gap-3 sm:flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 rounded-full border border-border p-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center font-medium">{quantity}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="font-serif text-xl text-primary">{totalPrice.toFixed(2)} €</span>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || missingRequired.length > 0}
            className="w-full"
            size="lg"
          >
            Add to cart
          </Button>
          {missingRequired.length > 0 && (
            <p className="text-center text-xs text-destructive">
              Please choose {missingRequired.map((g) => g.name).join(", ")}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtrasModal;
