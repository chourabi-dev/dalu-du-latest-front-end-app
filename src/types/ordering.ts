// ---------------------------------------------------------------------------
// Core domain types for the Da Lu ordering system.
// These mirror the API contract in API_CONTRACT.md — keep both in sync.
// ---------------------------------------------------------------------------

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city?: string;
  phone?: string;
  image?: string;
  isOpen?: boolean;
  openingHours?: string;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
}


export type FulfillmentType = "dine_in" | "delivery" | "pickup";

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  position?: number;
}

export interface Product {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number; // base price, in the store's currency (€)
  image?: string;
  isAvailable?: boolean;
  hasExtras?: boolean;
}

export type ExtraGroupSelectionType = "single" | "multiple";

export interface ExtraOption {
  id: string;
  name: string;
  photo: string;
  price: number; // additive price, 0 for free options
  isDefault?: boolean;
}

export interface ExtraGroup {
  id: string;
  productId: string;
  name: string; // e.g. "Drinks", "Sauces"
  selectionType: ExtraGroupSelectionType;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ExtraOption[];
}

export interface CartLineExtra {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string; // client-generated unique line id
  product: Product;
  quantity: number;
  extras: CartLineExtra[];
  notes?: string;
  unitPrice: number; // product.price + sum(extras)
  lineTotal: number; // unitPrice * quantity
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// "cash" = pay the cashier (on delivery, at pickup, or at the table).
// "online" = paid up front via PayPal; the order is sent straight to the
// kitchen since payment is already confirmed.
export type PaymentMethod = "cash" | "online";

export interface OrderPayload {
  restaurantId: string;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  // Required when fulfillmentType is "delivery", omitted otherwise.
  deliveryAddress?: string;
  // Required when fulfillmentType is "pickup". Either a specific time the
  // customer chose, or "asap".
  pickupTime?: string;
  // Required for "delivery" and "pickup" (so the restaurant/rider can reach
  // the customer); optional for "dine_in" since staff can just walk over.
  phone?: string;
  // For "dine_in" this doubles as the table number / any note to the kitchen.
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    extraOptionIds: string[];
    notes?: string;
  }[];
  // Present when paymentMethod is "online": the captured PayPal order id,
  // used by the backend to verify the payment before firing the order to
  // the kitchen.
  paypalOrderId?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  fulfillmentType: FulfillmentType;
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "ready_for_pickup" | "delivered" | "cancelled";
  paymentMethod: PaymentMethod;
  total: number;
  createdAt: string;
}
