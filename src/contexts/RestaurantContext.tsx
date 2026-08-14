import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { restaurantsApi } from "@/lib/api";
import type { Restaurant } from "@/types/ordering";

const STORAGE_KEY = "dalu-selected-restaurant-id";

interface RestaurantContextType {
  restaurants: Restaurant[];
  isLoadingRestaurants: boolean;
  restaurantsError: unknown;
  selectedRestaurantId: string | null;
  selectedRestaurant: Restaurant | null;
  selectRestaurant: (id: string) => void;
  clearRestaurant: () => void;
  isSelectorOpen: boolean;
  openSelector: () => void;
  closeSelector: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  );
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const {
    data: restaurants = [],
    isLoading: isLoadingRestaurants,
    error: restaurantsError,
  } = useQuery({
    queryKey: ["restaurants"],
    queryFn: restaurantsApi.list,
  });

  // If nothing selected yet (first visit), prompt the picker once restaurants load.
  useEffect(() => {
    if (!selectedRestaurantId && !isLoadingRestaurants) {
      setIsSelectorOpen(true);
    }
  }, [selectedRestaurantId, isLoadingRestaurants]);

  const selectRestaurant = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setSelectedRestaurantId(id);
    setIsSelectorOpen(false);
  };

  const clearRestaurant = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedRestaurantId(null);
  };

  const selectedRestaurant =
    restaurants.find((r) => r.id === selectedRestaurantId) || null;

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        isLoadingRestaurants,
        restaurantsError,
        selectedRestaurantId,
        selectedRestaurant,
        selectRestaurant,
        clearRestaurant,
        isSelectorOpen,
        openSelector: () => setIsSelectorOpen(true),
        closeSelector: () => setIsSelectorOpen(false),
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider");
  return ctx;
};
