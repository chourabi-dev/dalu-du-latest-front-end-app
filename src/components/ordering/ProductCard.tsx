import { Plus, X, Maximize2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/ordering";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  const [showImage, setShowImage] = useState(false);

  const isAvailable = product.isAvailable !== false;

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-soft transition-smooth hover:shadow-elegant",
          !isAvailable && "opacity-60"
        )}
      >
        {/* Clickable Image */}
        <button
          type="button"
          onClick={() => product.image && setShowImage(true)}
          disabled={!product.image}
          className={cn(
            "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted",
            product.image && "cursor-zoom-in"
          )}
        >
          {product.image ? (
            <>
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                <Maximize2 className="h-5 w-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-lg font-semibold text-foreground">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}

          <p className="mt-1 font-medium text-primary">
            {product.price.toFixed(2)} €
          </p>
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

      {/* Image Modal */}
      {showImage && product.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowImage(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowImage(false)}
              className="absolute -right-3 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110"
              aria-label="Close image"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Large image */}
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Product name */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
              <h3 className="text-xl font-semibold text-white">
                {product.name}
              </h3>

              {product.description && (
                <p className="mt-1 text-sm text-white/80">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;