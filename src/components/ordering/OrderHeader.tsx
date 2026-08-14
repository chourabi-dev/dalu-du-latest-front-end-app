import { Link } from "react-router-dom";
import { ShoppingBag, MapPin, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const OrderHeader = () => {
  const { selectedRestaurant, openSelector } = useRestaurant();
  const { itemCount, openCart } = useCart();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-bold text-primary">
          Da Lu
        </Link>

        <button
          onClick={openSelector}
          className="flex min-w-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-smooth hover:border-primary/50"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate max-w-[10rem] sm:max-w-xs">
            {selectedRestaurant ? selectedRestaurant.name : "Choose location"}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">{user?.name}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={openAuthModal}>
              Sign in
            </Button>
          )}

          <Button variant="outline" size="icon" className="relative" onClick={openCart}>
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default OrderHeader;
