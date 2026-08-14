import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Phone, Loader2, UtensilsCrossed } from "lucide-react";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { cn } from "@/lib/utils";

const RestaurantSelectModal = () => {
  const {
    restaurants,
    isLoadingRestaurants,
    restaurantsError,
    isSelectorOpen,
    selectedRestaurantId,
    selectRestaurant,
    closeSelector,
  } = useRestaurant();

  // Only dismissable once a restaurant has already been chosen at least once.
  const canDismiss = !!selectedRestaurantId;

  return (
    <Dialog open={isSelectorOpen} onOpenChange={(open) => !open && canDismiss && closeSelector()}>
      <DialogContent
        className="max-w-lg font-sans"
        onInteractOutside={(e) => !canDismiss && e.preventDefault()}
        onEscapeKeyDown={(e) => !canDismiss && e.preventDefault()}
        hideClose={!canDismiss}
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">Choose your Da Lu</DialogTitle>
          <DialogDescription>
            Select the location you'd like to order from. Menu and prices may vary by restaurant.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {isLoadingRestaurants && (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading restaurants…</span>
            </div>
          )}

          {!!restaurantsError && !isLoadingRestaurants && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              We couldn't load restaurants right now. Please check your connection and try again.
            </div>
          )}

          {!isLoadingRestaurants && !restaurantsError && restaurants.length === 0 && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No restaurants are available yet.
            </div>
          )}

          {restaurants.map((restaurant) => {
            const isSelected = restaurant.id === selectedRestaurantId;
            return (
              <button
                key={restaurant.id}
                onClick={() => selectRestaurant(restaurant.id)}
                disabled={restaurant.isOpen === false}
                className={cn(
                  "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-smooth hover:border-primary/50 hover:shadow-soft",
                  isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
                  restaurant.isOpen === false && "cursor-not-allowed opacity-50"
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-serif text-lg font-semibold text-foreground">
                      {restaurant.name}
                    </h3>
                    {restaurant.isOpen === false && (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Closed
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ""}</span>
                  </p>
                  {restaurant.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{restaurant.phone}</span>
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantSelectModal;
