import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/ordering";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  const isAvailable = product.isAvailable !== false;

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-soft transition-smooth hover:shadow-elegant",
        !isAvailable && "opacity-60"
      )}
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-lg font-semibold text-foreground">{product.name}</h3>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}
        <p className="mt-1 font-medium text-primary">{product.price.toFixed(2)} €</p>
      </div>

      <Button
        size="icon"
        className="shrink-0 rounded-full"
        disabled={!isAvailable}
        onClick={() => onSelect(product)}
        aria-label={`Add ${product.name} to cart`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductCard;
