import React from "react";
import { RestaurantProvider, useRestaurant } from "@/contexts/RestaurantContext";
import { CartProvider } from "@/contexts/CartContext";
import RestaurantSelectModal from "./RestaurantSelectModal";

// Cart is scoped to whichever restaurant is currently selected, so it needs
// to live inside RestaurantProvider to read the selected id.
const CartScope: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedRestaurantId } = useRestaurant();
  return <CartProvider restaurantId={selectedRestaurantId}>{children}</CartProvider>;
};

const OrderProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RestaurantProvider>
    <CartScope>
      {children}
      <RestaurantSelectModal />
    </CartScope>
  </RestaurantProvider>
);

export default OrderProviders;
