import type {
  Restaurant,
  MenuCategory,
  Product,
  ExtraGroup,
  AuthResponse,
  User,
  OrderPayload,
  Order,
} from "@/types/ordering";

// Base URL of the backend. Configure via .env (VITE_API_BASE_URL).
// Falls back to localhost:8000 for local development against the team's API.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/open-api";

const TOKEN_STORAGE_KEY = "dalu-auth-token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(message, res.status);
  }

  // Handle empty responses (e.g. 204 No Content)
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// ---------------------------------------------------------------------------
// Restaurants
// ---------------------------------------------------------------------------

export const restaurantsApi = {
  list: () => request<Restaurant[]>("/api/restaurants"),
  get: (id: string) => request<Restaurant>(`/api/restaurants/${id}`),
};

// ---------------------------------------------------------------------------
// Menu (categories + products) for a given restaurant
// ---------------------------------------------------------------------------

export const menuApi = {
  categories: (restaurantId: string) =>
    request<MenuCategory[]>(`/api/restaurants/${restaurantId}/categories`),
  products: (restaurantId: string) =>
    request<Product[]>(`/api/restaurants/${restaurantId}/products`),
};

// ---------------------------------------------------------------------------
// Extras (fetched per product id)
// ---------------------------------------------------------------------------

export const extrasApi = {
  forProduct: (productId: string) =>
    request<ExtraGroup[]>(`/api/products/${productId}/extras`),
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (username: string, password: string) =>
    request<AuthResponse>("/api/client/login_check", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  google: (idToken: string) =>
    request<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
  me: () => request<User>("/api/auth/me"),
};

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const ordersApi = {
  create: (payload: OrderPayload) =>
    request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};


export interface PaypalOrderRef {
  success: boolean;
  orderID: string;
  status?: string;
}

export interface PaypalCaptureResult {
  paypal: any;
  success: boolean;
  
}

export const paymentsApi = {
  createPaypalOrder: (restaurantId: string, amount: number) =>
    request<PaypalOrderRef>("/api/payments/paypal/create-order", {
      method: "POST",
      body: JSON.stringify({ restaurantId, amount, currency: "EUR" }),
    }),
  capturePaypalOrder: (paypalOrderId: string) =>
    request<PaypalCaptureResult>("/api/payments/paypal/capture-order", {
      method: "POST",
      body: JSON.stringify({ paypalOrderId }),
    }),
};
