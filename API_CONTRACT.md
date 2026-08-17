# Da Lu Ordering API Contract

This is the contract the frontend (`src/lib/api.ts`) was built against. The backend
(`http://localhost:8000` in dev, configured via `VITE_API_BASE_URL`) needs to implement
these endpoints. All request/response bodies are JSON. Authenticated endpoints expect
`Authorization: Bearer <token>`.

Prices are numbers in € (Tunisian Dinar), e.g. `12.5`.

---

## Restaurants

### `GET /api/restaurants`
List every restaurant the owner runs, shown in the location-picker modal.

```json
[
  {
    "id": "rest_1",
    "name": "Da Lu — La Marsa",
    "address": "12 Avenue Habib Bourguiba",
    "city": "La Marsa",
    "phone": "+216 20 000 000",
    "image": "https://.../marsa.jpg",
    "isOpen": true,
    "openingHours": "Tue-Sun: 12:00 - 22:00",
    "deliveryAvailable": true,
    "pickupAvailable": true
  }
]
```

- `deliveryAvailable` / `pickupAvailable` (both optional, default `false` if omitted)
  drive which fulfillment options the checkout screen offers for this restaurant.
  Dine-in is always offered. If both are `false`, only dine-in is shown.

### `GET /api/restaurants/:id`
Single restaurant, same shape as above.

---

## Menu

### `GET /api/restaurants/:restaurantId/categories`
Menu categories/sections for tabs (e.g. Pizza, Pasta, Drinks).

```json
[
  { "id": "cat_1", "restaurantId": "rest_1", "name": "Pizza", "position": 1 },
  { "id": "cat_2", "restaurantId": "rest_1", "name": "Pasta", "position": 2 }
]
```

### `GET /api/restaurants/:restaurantId/products`
All products for that restaurant (frontend groups them by `categoryId`).

```json
[
  {
    "id": "prod_1",
    "categoryId": "cat_1",
    "restaurantId": "rest_1",
    "name": "Margherita",
    "description": "Tomato, mozzarella, basil",
    "price": 18.5,
    "image": "https://.../margherita.jpg",
    "isAvailable": true,
    "hasExtras": true
  }
]
```

---

## Extras

### `GET /api/products/:productId/extras`
Extra option groups for a product (e.g. "Do you need drinks?", "Choose a sauce").
Fetched when the customer opens the add-to-cart popup for that product.

```json
[
  {
    "id": "grp_drinks",
    "productId": "prod_1",
    "name": "Drinks",
    "selectionType": "single",
    "required": false,
    "minSelect": 0,
    "maxSelect": 1,
    "options": [
      { "id": "opt_coke", "name": "Coca-Cola 33cl", "price": 4.0 },
      { "id": "opt_water", "name": "Still water", "price": 2.0, "isDefault": true }
    ]
  },
  {
    "id": "grp_sauces",
    "productId": "prod_1",
    "name": "Sauces",
    "selectionType": "multiple",
    "required": false,
    "minSelect": 0,
    "maxSelect": 3,
    "options": [
      { "id": "opt_ketchup", "name": "Ketchup", "price": 0 },
      { "id": "opt_garlic", "name": "Garlic sauce", "price": 1.0 }
    ]
  }
]
```

- `selectionType: "single"` → rendered as radio buttons (e.g. size, drink choice).
- `selectionType: "multiple"` → rendered as checkboxes, capped at `maxSelect`.
- `required: true` blocks "Add to cart" until `minSelect` options are chosen.

---

## Auth

### `POST /api/auth/register`
Request: `{ "name": string, "email": string, "password": string }`

### `POST /api/auth/login`
Request: `{ "email": string, "password": string }`

### `POST /api/auth/google`
Request: `{ "idToken": string }` — the Google ID token from Google Identity Services
(frontend uses `@react-oauth/google`). Backend should verify it with Google and
create/find the matching user.

All three return:
```json
{
  "user": { "id": "u_1", "name": "Sami", "email": "sami@example.com", "phone": null },
  "token": "jwt-or-opaque-token"
}
```

### `GET /api/auth/me`
Authenticated. Returns the `user` object above, used to restore sessions on page load.
Should return `401` for an invalid/expired token (frontend logs the user out locally).

---

## Orders

### `POST /api/orders`
Authenticated. Places an order.

Request:
```json
{
  "restaurantId": "rest_1",
  "fulfillmentType": "delivery",
  "paymentMethod": "cash",
  "deliveryAddress": "12 Rue de Marseille, Tunis",
  "phone": "+216 20 000 000",
  "notes": "Ring the bell twice",
  "items": [
    {
      "productId": "prod_1",
      "quantity": 2,
      "extraOptionIds": ["opt_coke", "opt_garlic"],
      "notes": "No onions"
    }
  ]
}
```

`fulfillmentType` is one of `"dine_in"`, `"delivery"`, `"pickup"` — set by the checkout
screen based on what the customer picked (and constrained by the restaurant's
`deliveryAvailable` / `pickupAvailable` flags). `deliveryAddress` is only present for
`"delivery"`; `pickupTime` (either a specific time or `"asap"`) is only present for
`"pickup"`.

`paymentMethod` is `"cash"` or `"online"`. `"online"` is only sent after a PayPal
capture has already succeeded, so an order with `paymentMethod: "online"` is
guaranteed to be paid for.

Response:
```json
{
  "id": "ord_123",
  "restaurantId": "rest_1",
  "status": "pending",
  "paymentMethod": "cash",
  "total": 41.0,
  "createdAt": "2026-08-11T12:00:00Z"
}
```

---

## Notes for the frontend integration

- The frontend never computes prices server-side — it trusts `price` fields from
  `/products` and `/extras` to build cart totals. If the backend wants to be the
  source of truth for the final total (recommended before going live), it should
  validate/recompute `total` server-side on order creation and the frontend should
  be updated to display the returned total rather than its local one.
- CORS: the backend must allow the frontend's origin (`http://localhost:5173` in dev)
  with credentials for `Authorization` headers.
- All list endpoints returning `[]` are treated as "nothing here yet", not an error.
