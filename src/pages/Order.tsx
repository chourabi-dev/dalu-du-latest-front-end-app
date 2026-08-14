import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { menuApi } from "@/lib/api";
import { useRestaurant } from "@/contexts/RestaurantContext";
import OrderHeader from "@/components/ordering/OrderHeader";
import ProductCard from "@/components/ordering/ProductCard";
import ExtrasModal from "@/components/ordering/ExtrasModal";
import CartDrawer from "@/components/ordering/CartDrawer";
import AuthModal from "@/components/ordering/AuthModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/ordering";

const Order = () => {
  const { selectedRestaurantId, selectedRestaurant, openSelector } = useRestaurant();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ["categories", selectedRestaurantId],
    queryFn: () => menuApi.categories(selectedRestaurantId!),
    enabled: !!selectedRestaurantId,
  });

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["products", selectedRestaurantId],
    queryFn: () => menuApi.products(selectedRestaurantId!),
    enabled: !!selectedRestaurantId,
  });

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [categories]
  );

  const currentCategoryId = activeCategoryId || sortedCategories[0]?.id || null;

  const visibleProducts = useMemo(
    () => products.filter((p) => (currentCategoryId ? p.categoryId === currentCategoryId : true)),
    [products, currentCategoryId]
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsExtrasOpen(true);
  };

  const isLoading = isLoadingCategories || isLoadingProducts;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <OrderHeader />

      {!selectedRestaurantId ? (
        <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <UtensilsCrossed className="h-10 w-10 text-primary" />
          <h2 className="font-serif text-2xl text-foreground">Pick a location to see the menu</h2>
          <Button onClick={openSelector}>Choose a restaurant</Button>
        </div>
      ) : (
        <main className="container py-8">
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">Menu</h1>
            {selectedRestaurant && (
              <p className="mt-1 text-muted-foreground">Ordering from {selectedRestaurant.name}</p>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading the menu…</span>
            </div>
          )}

          {!!productsError && !isLoading && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              We couldn't load the menu right now. Please try again shortly.
            </div>
          )}

          {!isLoading && !productsError && (
            <>
              {sortedCategories.length > 0 && (
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                  {sortedCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategoryId(category.id)}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-smooth",
                        currentCategoryId === category.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}

              {visibleProducts.length === 0 ? (
                <div className="rounded-lg border border-border bg-muted/40 p-6 text-center text-muted-foreground">
                  No items in this category yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onSelect={handleSelectProduct} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      )}

      <ExtrasModal product={selectedProduct} open={isExtrasOpen} onOpenChange={setIsExtrasOpen} />
      <CartDrawer />
      <AuthModal />
    </div>
  );
};

export default Order;
