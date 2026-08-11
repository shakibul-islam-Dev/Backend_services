# Production-Ready REST API — Express + TypeScript + Prisma + PostgreSQL

A scalable, modular REST API backend with full authentication, CRUD modules, soft deletes, and consistent responses.

## Tech Stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Runtime     | Node.js + TypeScript                    |
| Framework   | Express 5                               |
| ORM         | Prisma 7 (driver adapter: `pg`)         |
| Database    | PostgreSQL                              |
| Auth        | bcrypt (hashing) + jose (JWT)           |
| Validation  | express-validator                       |

## Project Structure

```
src/
├── app.ts                  # Express app wiring
├── server.ts               # Bootstrap + graceful shutdown
├── config/env.ts           # Environment variable validation
├── lib/
│   ├── prisma.ts           # Prisma client + Decimal helper
│   ├── response.ts         # Consistent response helper
│   └── cookies.ts          # Refresh-token cookie helpers
├── utils/                  # ApiError, asyncHandler, token, password, pagination, slugify
├── middleware/
│   ├── auth.ts             # authenticate + authorize
│   ├── validate.ts         # express-validator result middleware
│   └── error-handler.ts    # 404 handler + global error handler
├── validation/             # Per-module request validation
├── services/               # Business logic (7 services)
├── controllers/            # HTTP layer (7 controllers)
├── routes/                 # Express routers (7 modules + index)
└── types/                  # Express Request augmentation
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Demo data
```

## Getting Started

```bash
npm install

# 1. Configure environment (see .env.example)
# 2. Run the migration against your PostgreSQL database
npm run db:deploy           # applies prisma/migrations

# 3. Generate the Prisma client
npm run db:generate

# 4. (Optional) Seed demo data
npm run seed

# 5. Start the server
npm run dev                 # development (tsx watch)
npm run build && npm start  # production
```

> Seed credentials: `admin@example.com / admin123`, `user@example.com / user123`

## Database Schema

7 models, 6 enums, all with `isDeleted` (soft delete), `createdAt` / `updatedAt`, and `@@map()`.

- **User** — `Role`, `UserStatus` enums; relations to products, reviews, orders, wishlist
- **Category** — self-relation `parent`/`children`; `CategoryStatus` enum
- **Product** — `ProductStatus` enum; relations to seller (User), Category, Review, OrderItem, Wishlist
- **Review** — `ReviewStatus` enum; unique per (user, product); relations to User & Product
- **Order** — `OrderStatus`, `PaymentStatus` enums; relation to User, items
- **OrderItem** — join between Order and Product
- **Wishlist** — join between User and Product

Prisma features used: **Client**, **Migrate**, **Studio** (`npm run db:studio`), **Relations**, **Enums**, **Indexes**, transactions, aggregations (`groupBy`/`_avg`).

## API Conventions

All endpoints are under `/api` and return a consistent envelope:

```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {}
}
```

Pagination adds `meta`:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

Errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "A valid email is required" }]
}
```

### Status Codes

| Code | Meaning                                        |
| ---- | ---------------------------------------------- |
| 200  | Success                                        |
| 201  | Created                                        |
| 400  | Bad request / validation failed                |
| 401  | Unauthenticated (missing/invalid token)        |
| 403  | Forbidden (insufficient role)                  |
| 404  | Not found                                      |
| 409  | Conflict (duplicate email/slug/review, etc.)   |
| 500  | Internal server error                          |

### Authentication

- Register/Login return an `accessToken` in the response body.
- The `refreshToken` is stored in an **httpOnly cookie** (`path=/api/auth`).
- Send protected requests with the header: `Authorization: Bearer <accessToken>`.
- Roles: `USER` (default), `MODERATOR`, `ADMIN`.

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint   | Description                            | Auth |
| ------ | ---------- | -------------------------------------- | ---- |
| POST   | `/register`| Register a new user                    | —    |
| POST   | `/login`   | Login and receive tokens               | —    |
| POST   | `/refresh` | Rotate tokens (cookie or body)         | —    |
| POST   | `/logout`  | Clear refresh-token cookie             | —    |
| GET    | `/me`      | Get the authenticated user's profile   | ✅   |

**POST `/api/auth/register`**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "john_doe",
  "password": "secret123",
  "phone": "+123456789",
  "address": "123 Main St"
}
```
→ `201` — `{ success, message, data: { user, accessToken } }`

**POST `/api/auth/login`**
```json
{ "emailOrUsername": "john@example.com", "password": "secret123" }
```
→ `200` — `{ success, message, data: { user, accessToken } }`

**POST `/api/auth/refresh`** — uses `refreshToken` cookie (or `{ "refreshToken": "..." }` body)
→ `200` — new `{ user, accessToken }`

---

### Users — `/api/users`

| Method | Endpoint         | Description                              | Auth         |
| ------ | ---------------- | ---------------------------------------- | ------------ |
| GET    | `/`              | List users (paginated)                   | ✅ ADMIN     |
| GET    | `/:id`           | Get a user by id                         | ✅           |
| PUT    | `/:id`           | Update own profile                       | ✅           |
| PATCH  | `/:id/admin`     | Update user role/status                  | ✅ ADMIN     |
| DELETE | `/:id`           | Soft-delete a user (self or admin)       | ✅           |

---

### Categories — `/api/categories`

| Method | Endpoint  | Description                  | Auth                  |
| ------ | --------- | ---------------------------- | --------------------- |
| GET    | `/`       | List categories (paginated)  | —                     |
| GET    | `/:id`    | Get category + children      | —                     |
| POST   | `/`       | Create category              | ✅ ADMIN/MODERATOR    |
| PUT    | `/:id`    | Update category              | ✅ ADMIN/MODERATOR    |
| DELETE | `/:id`    | Soft-delete category         | ✅ ADMIN              |

**POST `/api/categories`**
```json
{
  "name": "Electronics",
  "slug": "electronics",
  "description": "Devices & gadgets",
  "parentId": null,
  "status": "ACTIVE"
}
```
`slug` auto-generated from `name` if omitted. Supports a `parentId` for a category hierarchy.

---

### Products — `/api/products`

| Method | Endpoint  | Description                  | Auth        |
| ------ | --------- | ---------------------------- | ----------- |
| GET    | `/`       | List products (paginated + filters) | —     |
| GET    | `/:id`    | Get product (avg rating, reviews)   | —     |
| POST   | `/`       | Create product (seller = auth user) | ✅    |
| PUT    | `/:id`    | Update product (owner or admin)     | ✅    |
| DELETE | `/:id`    | Soft-delete product (owner or admin)| ✅    |

**GET `/api/products`** query filters: `page`, `limit`, `categoryId`, `sellerId`, `status`, `search`, `minPrice`, `maxPrice`

**POST `/api/products`**
```json
{
  "title": "Wireless Headphones",
  "description": "Noise cancelling headphones",
  "shortDescription": "Great sound",
  "quantity": 100,
  "stock": 50,
  "listPrice": 199.99,
  "salePrice": 149.99,
  "currency": "USD",
  "discountPercent": 25,
  "categoryId": "<uuid>",
  "status": "ACTIVE"
}
```
`slug` auto-generated from `title`. Money uses `Decimal` (serialized as string).

---

### Reviews — `/api/reviews`

| Method | Endpoint        | Description                          | Auth               |
| ------ | --------------- | ------------------------------------ | ------------------ |
| GET    | `/`             | List reviews (paginated + filters)   | —                  |
| GET    | `/:id`          | Get a review                         | —                  |
| POST   | `/`             | Create a review (one per user/product) | ✅               |
| PUT    | `/:id`          | Update own review                    | ✅                 |
| PATCH  | `/:id/status`   | Approve/reject review                | ✅ ADMIN/MODERATOR |
| DELETE | `/:id`          | Soft-delete review (owner or admin)  | ✅                 |

**POST `/api/reviews`**
```json
{
  "rating": 5,
  "title": "Amazing",
  "comment": "Highly recommended!",
  "productId": "<uuid>"
}
```
New reviews start as `PENDING` until approved.

---

### Orders — `/api/orders`

| Method | Endpoint      | Description                          | Auth            |
| ------ | ------------- | ------------------------------------ | --------------- |
| POST   | `/`           | Create an order (transactional)      | ✅              |
| GET    | `/`           | List orders (own, or all if admin)   | ✅              |
| GET    | `/:id`        | Get an order + items                 | ✅              |
| PATCH  | `/:id`        | Update status/payment                | ✅ ADMIN        |
| POST   | `/:id/cancel` | Cancel order (restores stock)        | ✅              |
| DELETE | `/:id`        | Soft-delete order                    | ✅ ADMIN        |

**POST `/api/orders`**
```json
{
  "items": [{ "productId": "<uuid>", "quantity": 2 }],
  "shippingAddress": "123 Main St",
  "paymentMethod": "credit_card",
  "notes": "Leave at the door"
}
```
Created inside a transaction: validates stock, computes totals, decrements stock. `orderNumber` is auto-incremented.

---

### Wishlist — `/api/wishlist`

| Method | Endpoint  | Description                | Auth |
| ------ | --------- | -------------------------- | ---- |
| POST   | `/`       | Add a product to wishlist  | ✅   |
| GET    | `/`       | List own wishlist          | ✅   |
| DELETE | `/:id`    | Remove a wishlist item     | ✅   |

**POST `/api/wishlist`**
```json
{ "productId": "<uuid>" }
```

---

## Prisma Commands

```bash
npm run db:generate   # regenerate client
npm run db:migrate    # create & apply a migration (dev)
npm run db:deploy     # apply migrations (prod)
npm run db:studio     # open Prisma Studio
```

## Scripts

```bash
npm run dev        # tsx watch
npm run build      # tsc
npm run start      # node dist/server.js
npm run typecheck  # tsc --noEmit
npm run seed       # seed demo data
```
