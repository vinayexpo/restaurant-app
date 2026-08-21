# Restaurant App — Development Tasks
> Derived from plan.md. Work top-to-bottom. Each task is self-contained and completable in one session.
> Mark `[x]` when done. Backend and Frontend phases can overlap once Phase 1 is complete.

---

## Phase 0 — Environment Setup

- [x] **0.1 MySQL database**
  - Create database `restaurant_db` (utf8mb4, unicode_ci)
  - Create user `restaurant_user` with full privileges on `restaurant_db`
  - Confirm MySQL 8.0.46 service is running on port 3306

- [x] **0.2 Laravel project scaffold**
  - `laravel new backend --no-interaction`
  - Set `APP_TIMEZONE=Asia/Kolkata` in `.env`
  - Fill all `.env` values per plan.md §Environment Setup (DB credentials, APP_URL, Sanctum domains)
  - `php artisan key:generate`
  - Confirm `php artisan serve` returns 200 on `/`

- [x] **0.3 React + Vite project scaffold**
  - `npm create vite@latest frontend -- --template react`
  - Install: `tailwindcss @tailwindcss/vite framer-motion @reduxjs/toolkit react-redux react-router-dom axios lucide-react react-hot-toast`
  - Configure Tailwind v4 via `@tailwindcss/vite` plugin in `vite.config.js`
  - Add Google Fonts (`Playfair Display`, `Inter`) to `index.html`
  - Add Razorpay CDN script to `index.html`
  - Confirm `npm run dev` serves on port 5173

- [x] **0.4 Install skills**
  - Run all 5 `npx skills add` commands from plan.md §Install Before Starting
  - Confirm `/impeccable`, `/react-vite-expert`, `/senior-fullstack` are available

---

## Phase 1 — Backend: Database & Foundation

- [x] **1.1 Migrations — create all tables in dependency order**
  - `users` (role ENUM, soft deletes, indexes)
  - `restaurants` (status ENUM, is_featured, slug UNIQUE, soft deletes)
  - `restaurant_hours` (day_of_week 0–6, is_closed, UNIQUE restaurant+day)
  - `categories`
  - `menu_items` (soft deletes)
  - `menu_item_variants`
  - `addresses`
  - `carts`
  - `cart_items`
  - `orders` (payment_method ENUM cod/razorpay, all amount columns, loyalty columns, razorpay columns)
  - `order_items` (snapshot: name + price at purchase time)
  - `order_status_history`
  - `delivery_partners`
  - `delivery_earnings`
  - `delivery_partner_ratings`
  - `reviews`
  - `coupons`
  - `coupon_usages`
  - `loyalty_tiers`
  - `loyalty_points`
  - `loyalty_transactions`
  - `favourites` (UNIQUE user_id + restaurant_id)
  - `notifications`
  - `platform_settings`
  - `platform_commissions`
  - `audit_logs`
  - Queue tables: `php artisan queue:table && php artisan queue:failed-table`
  - Run `php artisan migrate` — confirm zero errors

- [x] **1.2 Eloquent models**
  - `User` — SoftDeletes, role helpers, `hasOne Restaurant`, `hasOne DeliveryPartner`
  - `Restaurant` — `belongsTo User`, `hasMany MenuItem`, `hasMany RestaurantHour`, slug auto-generation
  - `RestaurantHour` — `isOpenNow()` static helper (per plan.md §Restaurant Weekly Operating Hours)
  - `MenuItem` — SoftDeletes, `HasRestaurantScope` trait, `belongsTo Category`
  - `MenuItemVariant` — `belongsTo MenuItem`
  - `Category` — `HasRestaurantScope` trait
  - `Cart` + `CartItem`
  - `Order` — `HasRestaurantScope` trait, `hasMany OrderItem`, `hasMany OrderStatusHistory`
  - `OrderItem`, `OrderStatusHistory`
  - `DeliveryPartner` — `belongsTo User`
  - `DeliveryEarning`, `DeliveryPartnerRating`
  - `Review` — `HasRestaurantScope` trait
  - `Coupon` — `HasRestaurantScope` trait, `CouponUsage`
  - `LoyaltyPoint`, `LoyaltyTransaction`, `LoyaltyTier`
  - `Favourite`
  - `Notification`
  - `PlatformSetting` — static `get(key, default)` helper
  - `PlatformCommission`, `AuditLog`

- [x] **1.3 Traits**
  - `app/Traits/ApiResponse.php` — `success()`, `error()`, `paginated()` methods (envelope: `{success, data, message, meta}`)
  - `app/Traits/HasRestaurantScope.php` — global scope via `app('currentRestaurant')->id`

- [x] **1.4 Seeders**
  - `LoyaltyTierSeeder` — Bronze/Silver/Gold/Platinum tiers with point thresholds and multipliers
  - `PlatformSettingsSeeder` — all keys from plan.md §platform_settings table (loyalty rates, tax rate, commission, feature flags)
  - `SuperadminSeeder` — reads `SUPERADMIN_PASSWORD` from env, creates superadmin user
  - `DatabaseSeeder` — calls all three in order
  - Run `php artisan db:seed` — confirm zero errors

- [x] **1.5 Factories (dev-only)**
  - `UserFactory` — all 5 roles
  - `RestaurantFactory` — approved restaurants with realistic data
  - `MenuItemFactory` — veg + non-veg, prices, images
  - `OrderFactory` — various statuses

---

## Phase 2 — Backend: Auth & Middleware

- [x] **2.1 Sanctum setup**
  - `php artisan reverb:install` (installs Reverb config and Sanctum)
  - Set token expiry: `createToken(..., ['*'], now()->addDays(30))` in `AuthController`
  - Configure `config/sanctum.php` stateful domains for localhost:5173

- [x] **2.2 Auth controllers**
  - `AuthController` — `register()`, `login()`, `logout()`, `me()`, `updateProfile()`, `changePassword()`
    - `register()`: validates role param (customer/delivery_partner only; owner flow is separate), creates `delivery_partners` row if role is delivery_partner (is_verified=false, is_available=false)
    - `changePassword()`: verifies current password via `Hash::check`, revokes other tokens on success
  - `PasswordResetController` — `send()` (throttle:3,1), `reset()`
  - `EmailVerificationController` — `verify()` (signed URL), `resend()` (throttle:3,1)

- [x] **2.3 Middleware**
  - `EnsureRole` — array of allowed roles; superadmin bypasses all checks; registers as `role` in `bootstrap/app.php`
  - `CheckRestaurantOwner` — binds `currentRestaurant` to service container; `firstOrFail` aborts 404 if no restaurant

- [x] **2.4 Policies (register in AuthServiceProvider)**
  - `MenuItemPolicy` — view/create/update/delete check `restaurant_id` match
  - `CategoryPolicy` — same pattern
  - `OrderPolicy` — owner can view/update only their restaurant's orders
  - `ReviewPolicy` — owner can reply only to their restaurant's reviews
  - `CouponPolicy` — owner can manage only their restaurant's coupons

- [x] **2.5 Rate limiting (AppServiceProvider)**
  - Named limiters: `api` (60/min by user or IP), `auth` (10/min by IP), `payment` (5/min by user), `forgot-password` (3/min by IP)

- [x] **2.6 CORS**
  - `config/cors.php` — allowed origins from `FRONTEND_URL` env, allow credentials, all standard headers

- [x] **2.7 AuditObserver**
  - Watches `User`, `Restaurant`, `PlatformSetting`, `PlatformCommission` models
  - Writes to `audit_logs` on created/updated/deleted
  - Register in `AppServiceProvider::boot()`

---

## Phase 3 — Backend: Core APIs

- [x] **3.1 Public routes**
  - `GET /api/restaurants` — paginated (15/page), filters: city, cuisine_type, is_veg, min_rating, sort (rating, delivery_fee, distance)
  - `GET /api/restaurants/featured`
  - `GET /api/restaurants/search?q=` — name + cuisine LIKE search
  - `GET /api/restaurants/autocomplete?q=` — returns `[{id, name, slug, logo_path, cuisine_type, avg_rating}]`, limit 8
  - `GET /api/restaurants/{slug}` — includes `is_open` (from `RestaurantHour::isOpenNow()`)
  - `GET /api/restaurants/{id}/menu` — grouped by category
  - `GET /api/restaurants/{id}/reviews` — paginated
  - `GET /api/settings/public` — feature flags + loyalty rates for frontend boot

- [x] **3.2 Address API** (`role:customer`)
  - Full `apiResource` CRUD + `PATCH /addresses/{id}/set-default`

- [x] **3.3 Cart API** (`role:customer`)
  - `GET /api/cart` — cart with items, restaurant info, pricing preview
  - `POST /api/cart/items` — add item (validates same restaurant, clears if different restaurant)
  - `PUT /api/cart/items/{id}` — update quantity
  - `DELETE /api/cart/items/{id}` — remove item
  - `DELETE /api/cart` — clear entire cart

- [x] **3.4 Coupon validation** (`role:customer`)
  - `POST /api/coupons/validate` — checks code, expiry, usage limit, min_order, per-user limit; returns discount amount

- [x] **3.5 Payment & Order APIs** (`role:customer`)
  - `POST /api/payment/initiate` — creates Razorpay order via SDK (amount in paise), returns `{rzp_order_id, amount_paise, currency, key_id}`
  - `POST /api/payment/verify` (middleware: `verified`) — `OrderService::createFromCart()` (see plan.md §Order Total Formula); HMAC signature check for Razorpay; COD skips signature
  - `POST /api/webhooks/razorpay` — no auth, X-Razorpay-Signature verified
  - `GET /api/orders` — customer's order history (paginated)
  - `GET /api/orders/{id}` — includes `status_history`, `items`, `restaurant`
  - `PATCH /api/orders/{id}/cancel` — only if status is pending/confirmed
  - `POST /api/orders/{id}/reorder` — clears cart, repopulates, returns `{cart, conflict: bool}`
  - `POST /api/orders/{id}/rate-delivery` — `DeliveryRatingController` (one per order, post-delivered only)

- [x] **3.6 Favourites API** (`role:customer`)
  - `GET /api/favourites`, `POST /api/favourites/{restaurantId}`, `DELETE /api/favourites/{restaurantId}`

- [x] **3.7 Review API** (`role:customer`)
  - `POST /api/reviews` — validates order is delivered and belongs to customer, one review per order

- [x] **3.8 Notification API** (authenticated)
  - `GET /api/notifications` (paginated), `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all`

- [x] **3.9 Loyalty API** (`role:customer`)
  - `GET /api/loyalty` — summary (balance, tier, points to next tier, expiry date)
  - `GET /api/loyalty/transactions` — paginated history
  - `POST /api/loyalty/redeem` — validates against platform settings rules; mutually exclusive with coupon
  - `GET /api/loyalty/tiers` — all tiers with multipliers

- [x] **3.10 Restaurant Owner APIs** (`role:restaurant_owner`, prefix: `/owner`)
  - Restaurant: `GET /restaurant`, `POST /restaurant` (creates with status=pending, elevates role), `PUT /restaurant`, `GET /restaurant/hours`, `PUT /restaurant/hours`
  - Categories: full `apiResource` (scoped to owner's restaurant via `HasRestaurantScope`)
  - Menu Items: full `apiResource` + image upload via `ImageService::storeWebP()`
  - Menu Variants: `POST /menu-items/{id}/variants`, `PUT /menu-items/{id}/variants/{variantId}`, `DELETE`
  - Orders: `GET /orders` (filtered by status), `PATCH /orders/{id}/status`, `GET /orders/{id}`
  - Reviews: `GET /reviews`, `PATCH /reviews/{id}/reply`
  - Coupons: full `apiResource` (restaurant-scoped)
  - Revenue: `GET /revenue` — daily/weekly/monthly breakdown, top items, commission deducted

- [x] **3.11 Delivery Partner APIs** (prefix: `/delivery`)
  - `GET /profile`, `PUT /profile`
  - `PATCH /availability` — toggle is_available (only if is_verified=true)
  - `PATCH /location` — update current lat/lng (broadcast to active order channel)
  - `GET /orders/available` — pending orders near partner's location (is_available=true only)
  - `POST /orders/{id}/accept` — sets delivery_partner_id, status → out_for_delivery
  - `PATCH /orders/{id}/status` — advance status: picked_up → delivered; triggers `OrderService::updateStatus()`
  - `GET /earnings` — per-order earnings history, total earned, pending payout
  - `GET /earnings/summary` — today/week/month totals

- [x] **3.12 Admin APIs** (`role:admin,superadmin`, prefix: `/admin`)
  - Dashboard: `GET /dashboard` — stats (orders today, revenue, active restaurants, active partners)
  - Users: `GET /users`, `GET /users/{id}`, `PATCH /users/{id}/activate`, `PATCH /users/{id}/deactivate`, `DELETE /users/{id}` (soft)
  - Restaurants: `GET /restaurants`, `PATCH /restaurants/{id}/approve`, `PATCH /restaurants/{id}/reject` (requires rejection_reason), `PATCH /restaurants/{id}/suspend`, `PATCH /restaurants/{id}/feature`
  - Orders: `GET /orders` (all restaurants, filters), `GET /orders/{id}`
  - Delivery Partners: `GET /delivery-partners`, `PATCH /delivery-partners/{id}/verify`, `PATCH /delivery-partners/{id}/suspend`
  - Coupons: platform-wide CRUD (`GET /coupons`, `POST /coupons`, `PUT /coupons/{id}`, `DELETE /coupons/{id}`)
  - Loyalty: `GET /loyalty/config`, `PUT /loyalty/config` (updates platform_settings), `GET /loyalty/tiers`, `PUT /loyalty/tiers/{id}`, `POST /loyalty/bonus` (manual grant to user)
  - Notifications broadcast: `POST /notifications/broadcast` (sends to all or role-filtered users)
  - Settings: `GET /settings`, `PUT /settings/{key}`
  - Reports: `GET /reports/revenue`, `GET /reports/orders`

- [x] **3.13 Superadmin APIs** (`role:superadmin`, prefix: `/superadmin`)
  - Admin accounts: `GET /admins`, `POST /admins`, `PUT /admins/{id}`, `DELETE /admins/{id}`
  - Commissions: `GET /commissions`, `POST /commissions` (per-restaurant override), `PUT /commissions/{id}`, `DELETE /commissions/{id}`
  - Audit logs: `GET /audit-logs` (read-only, paginated, filters: action, target_type, user_id, date range)
  - Impersonation: `POST /impersonate/{userId}` (issues scoped token), `DELETE /impersonate` (revoke)
  - Financials: `GET /financials` — gross order value, total commission, delivery revenue, net P&L
  - Feature flags: `GET /feature-flags`, `PUT /feature-flags/{key}`
  - Platform settings: `GET /settings`, `PUT /settings/{key}` (superadmin-only keys: tax rate, maintenance mode)

---

## Phase 4 — Backend: Services & Infrastructure

- [x] **4.1 Services**
  - `OrderService` — `createFromCart()` (full implementation per plan.md), `updateStatus()`, `generateOrderNumber()`
  - `PaymentService` — `initiateRazorpay()`, `verifyRazorpay()` (HMAC), `refundRazorpay()`, `handleCaptured()`, `handleFailed()`, `handleRefund()`
  - `LoyaltyService` — `credit()` (on delivered), `debit()`, `calculateRedemption()`, `recalculateTier()`
  - `EarningsService` — `recordDeliveryEarning()` (snapshots partner_share_pct per order)
  - `ImageService` — `storeWebP()` via Intervention Image; convert all uploads to WebP
  - `NotificationService` — creates `notifications` row + broadcasts via Reverb

- [x] **4.2 Razorpay SDK**
  - `composer require razorpay/razorpay`
  - Add `razorpay` block to `config/services.php`
  - Webhook route: `POST /api/webhooks/razorpay` (outside Sanctum auth, X-Razorpay-Signature verified)

- [x] **4.3 Intervention Image**
  - `composer require intervention/image-laravel`
  - Publish config: `php artisan vendor:publish --provider="Intervention\Image\Laravel\ServiceProvider"`
  - `php artisan storage:link`
  - `ImageService::storeWebP()` — resize to max 1200px wide, quality 85, save to `storage/app/public/{folder}/`

- [x] **4.4 Laravel Reverb** (backend events + server; frontend Echo listeners wired alongside their features in Phase 6-8)
  - `php artisan reverb:install`
  - Set REVERB env vars in `.env`
  - Events:
    - `OrderStatusChanged` — broadcasts on `orders.{orderId}` (private)
    - `NewOrderReceived` — broadcasts on `restaurant.{restaurantId}.orders` (private)
    - Delivery location update — broadcasts on `delivery.{partnerId}` (private)
  - Frontend: Echo + Reverb client listening on all three channels

- [x] **4.5 Queue & Mail**
  - Mail classes: `WelcomeEmail`, `OrderConfirmed`, `OrderStatusUpdated`, `RestaurantApproved`, `RestaurantRejected`
  - Blade templates for each mail in `resources/views/mail/`
  - Jobs: `SendOrderConfirmationEmail`, `SendOrderStatusEmail` (dispatched via `Mail::to()->queue()`)
  - Scheduler: `ExpireLoyaltyPoints` command runs daily at 00:05 — expires points where `expires_at < now()`
  - Add cron entry for `php artisan schedule:run`

---

## Phase 5 — Frontend: Foundation

- [x] **5.1 Design tokens**
  - CSS custom properties from plan.md §Design System into `src/index.css`
  - Colors: brand (orange), accent (green), danger (red), warning (amber), neutrals
  - Typography: Playfair Display (display), Inter (UI), full type scale
  - Spacing, radius, shadow tokens
  - Update `tailwind.config.js` to extend with all token values

- [x] **5.2 Redux store**
  - 10 slices: `auth`, `cart`, `order`, `restaurant`, `loyalty`, `favourite`, `owner`, `delivery`, `admin`, `superadmin`, `ui`
  - `authSlice`: `{user, token, isAuthenticated, isLoading}`
  - `cartSlice`: `{items, restaurantId, subtotal, totalItems, pagination}`
  - `orderSlice`: `{currentOrder, orders, pagination}`
  - `loyaltySlice`: `{balance, tier, nextTier, pointsToNextTier, expiresAt, transactions}`
  - `uiSlice`: `{cartOpen, mobileNavOpen, toasts}`
  - Persist `auth` + `cart` slices to localStorage via `redux-persist`

- [x] **5.3 Axios instance**
  - Base URL from `VITE_API_URL`
  - Request interceptor: attach `Authorization: Bearer {token}` header
  - Response interceptor: on 401 → dispatch logout + redirect to login; on 422 → parse Laravel validation errors
  - Named service modules: `authService.js`, `restaurantService.js`, `orderService.js`, `cartService.js`, `loyaltyService.js`, `adminService.js`

- [x] **5.4 Route setup (App.jsx)**
  - Import `PrivateRoute`, `PublicOnlyRoute` from `src/components/PrivateRoute.jsx`
  - All pages lazy-loaded with `React.lazy()` + `Suspense` skeleton fallback
  - Full route tree per plan.md §Frontend Routing:
    - Public: `/`, `/restaurants`, `/restaurants/:slug`, `/search`, `/auth/*`
    - Customer (role:customer): `/cart`, `/checkout`, `/orders/*`, `/profile/*`
    - Owner (role:restaurant_owner): `/owner/*`
    - Delivery (role:delivery_partner): `/delivery/*`
    - Admin (role:admin,superadmin): `/admin/*`
    - Superadmin (role:superadmin): `/superadmin/*`

- [x] **5.5 Layout components**
  - `CustomerLayout` — sticky top nav (desktop) + bottom tab bar (mobile), cart drawer outlet
  - `OwnerLayout` — fixed sidebar (collapsible on mobile), top bar with notification bell
  - `DeliveryLayout` — mobile-first, minimal top bar
  - `AdminLayout` — fixed sidebar (dark accent), top bar
  - `SuperadminLayout` — sidebar with purple accent + "Superadmin" badge, impersonation warning banner

- [x] **5.6 Shared components**
  - `PrivateRoute.jsx` + `PublicOnlyRoute.jsx` — full implementations per plan.md §Route Guards
  - `ErrorBoundary.jsx`
  - `Button` — primary, secondary, ghost, danger variants; loading spinner state
  - `Input`, `Select`, `Textarea` — label always visible, error state (red border + message below)
  - `Modal` — spring animation bottom sheet on mobile, centered on desktop
  - `Skeleton` — shimmer animation, shape-matching variants (card, list row, stat)
  - `EmptyState` — SVG illustration + heading + primary action (per impeccable rules)
  - `Badge` — status pill (color-matched to order status)
  - `VegBadge`, `NonVegBadge` — per component signature in plan.md
  - `RatingChip` — green bg, star icon, bold text
  - `RestaurantCard` — cover image (aspect-video), veg/nonveg, rating chip, delivery info, heart icon
  - `Toast` — via `react-hot-toast` configured with brand colors

- [x] **5.7 Framer Motion tokens**
  - `src/lib/motion.js` — export all animation variants: `drawerVariants`, `cardHoverVariants`, `pageTransitionVariants`, `badgePulseVariants`, `skeletonShimmer`

---

## Phase 6 — Frontend: Customer Panel

- [x] **6.1 Auth pages**
  - `/auth/login` — email + password, "Forgot password?" link, redirect to panel home on success
  - `/auth/register` — name, email, phone, password, role selector (Customer / Delivery Partner)
  - `/auth/forgot-password` — email input, success state
  - `/auth/reset-password` — new password + confirm, reads token from URL params
  - All forms: inline field-level validation errors (not just toast)

- [x] **6.2 Home page** (`/`)
  - Hero section: brand headline, search bar (location + dish/restaurant), CTA
  - Cuisine quick-filter carousel (Indian, Chinese, Pizza, Biryani, Burgers, Desserts) — horizontal scroll, filter chips
  - Featured restaurants carousel — horizontal scroll, `RestaurantCard` component
  - Offers/deals banner section
  - Recently ordered (if logged in) — horizontal scroll
  - Framer Motion: page fade+slide in, carousel spring scroll

- [x] **6.3 Restaurant listing** (`/restaurants`)
  - Sticky filter bar: cuisine type, veg-only toggle, min rating, sort (rating / delivery fee / distance)
  - Grid of `RestaurantCard` (3-col desktop, 2-col tablet, 1-col mobile)
  - Infinite scroll (15 per load) — intersection observer
  - Debounced search bar at top — uses `/restaurants/autocomplete` for dropdown suggestions, `/restaurants/search` on submit
  - Open/Closed badge on each card (derived from `is_open` in API response)
  - Skeleton grid while loading

- [x] **6.4 Restaurant detail** (`/restaurants/:slug`)
  - Sticky info bar: name, avg_rating, cuisine, delivery time, delivery fee, min order, open/closed
  - Category sidebar (desktop sticky) / horizontal scroll tabs (mobile) — smooth scroll to section
  - Menu items grid per category — item card: image, name, description, veg/nonveg badge, price, variants
  - Variant selector modal (Framer Motion bottom sheet on mobile)
  - Add to cart — optimistic update + quantity badge pulse
  - Cart float button (mobile) showing item count + total

- [x] **6.5 Cart** (`/cart`)
  - Cart drawer (slide from right on desktop, bottom sheet on mobile)
  - Item list with quantity +/− controls
  - Coupon code input — calls `/coupons/validate`, shows discount amount
  - Loyalty redemption toggle (if enabled + user has points) — mutually exclusive with coupon
  - Pricing breakdown: subtotal, delivery fee, discount, loyalty discount, GST (tax_rate_pct%), total
  - Empty cart state with illustration + "Browse Restaurants" CTA
  - Proceed to Checkout button (disabled if cart empty or below min_order)

- [x] **6.6 Checkout** (`/checkout`)
  - Address selector: list saved addresses, "Add new" modal, set-as-default option
  - Order summary sidebar (sticky desktop)
  - Payment method: Razorpay (card/UPI/netbanking/wallet) vs Cash on Delivery toggle
  - Razorpay: `useRazorpay` hook opens modal with `theme.color: #F97316`
  - COD: direct POST to `/payment/verify`
  - Loading + success redirect to `/orders/{id}`

- [x] **6.7 Order tracking** (`/orders/:id`)
  - Animated vertical timeline — connector line fills progressively on status advance
  - Statuses: pending → confirmed → preparing → out_for_delivery → delivered
  - Status history timestamps from `order_status_history`
  - Delivery partner info card (name, vehicle, avg_rating) when `delivery_partner_id` is set
  - Real-time updates via Reverb `orders.{orderId}` channel — status auto-updates without refresh
  - Rate delivery partner button (appears after delivered, disappears after rated)

- [x] **6.8 Order history** (`/orders`)
  - Paginated list — order number, restaurant, status badge, total, date
  - "Reorder" button → calls `/orders/{id}/reorder`, shows conflict warning if items unavailable
  - "Write a review" button on delivered orders without review

- [x] **6.9 Profile** (`/profile`)
  - Edit name, phone, profile image (upload → backend WebP conversion)
  - Change password form (current + new + confirm)
  - Saved addresses tab — CRUD with default address toggle
  - Favourites tab — list of saved restaurants, un-heart to remove
  - Notifications tab — paginated list, mark read, mark all read

- [x] **6.10 Loyalty page** (`/profile/loyalty`)
  - Tier badge (Bronze/Silver/Gold/Platinum) with icon and color
  - Points balance (large display number)
  - Progress bar toward next tier — shows exact points remaining
  - Points earned this month / all time
  - Expiry notice ("N points expire on DD MMM YYYY")
  - Paginated transaction history — date, description (order number), +/− points, running balance

---

## Phase 7 — Frontend: Owner Panel

- [x] **7.1 Owner registration flow**
  - After login as new user: prompt to submit restaurant details
  - Restaurant submission form: name, description, address, city, lat/lng, phone, cuisine type, delivery radius, min order, delivery fee, logo upload
  - "Pending approval" status screen after submission

- [x] **7.2 Owner dashboard** (`/owner/dashboard`)
  - KPI cards: today's orders, today's revenue, pending orders, avg rating
  - Live order feed (Reverb `restaurant.{id}.orders`) — new orders slide in from top
  - Weekly revenue bar chart (Chart.js or Recharts — real data)
  - Recent reviews mini-list

- [x] **7.3 Order management** (`/owner/orders`)
  - Tab bar: Pending / Confirmed / Preparing / Out for Delivery / Delivered / Cancelled
  - Order cards: customer name, items list, total, time elapsed
  - Status advance buttons (Confirm → Preparing → Ready)
  - Order detail modal: full item list, address, payment method, notes

- [x] **7.4 Menu management**
  - Categories page (`/owner/menu/categories`): CRUD cards, drag-to-reorder
  - Items page (`/owner/menu/items`): list grouped by category, toggle availability inline
  - Add/Edit item form (`/owner/menu/items/new`, `/owner/menu/items/:id/edit`): name, description, price, category, veg/non-veg toggle, image upload, variants section
  - Variants: add/edit/delete price variants (e.g. Small/Medium/Large) inline

- [x] **7.5 Restaurant settings** (`/owner/settings`)
  - Edit all restaurant info fields
  - Weekly hours sub-section — 7 rows (Sun–Sat), time pickers + "Closed all day" toggle
  - Toggle restaurant active/inactive
  - Delivery fee, min order amount, avg delivery time

- [x] **7.6 Reviews** (`/owner/reviews`)
  - List of all reviews with star rating, customer name, comment, date
  - Reply input inline — POST to `/owner/reviews/{id}/reply`
  - Filter by rating (1–5 stars)

- [x] **7.7 Coupons** (`/owner/coupons`)
  - Table of coupons: code, type, value, usage count, expiry, active toggle
  - Create/Edit coupon modal: all fields (type, value, min order, max discount, usage limit, per-user limit, date range)

- [x] **7.8 Revenue reports** (`/owner/revenue`)
  - Daily/weekly/monthly toggle
  - Revenue line/bar chart
  - Top selling items table
  - Commission deducted breakdown (platform % shown)

---

## Phase 8 — Frontend: Delivery Partner Panel

- [x] **8.1 Delivery dashboard** (`/delivery/dashboard`)
  - Availability toggle — large, prominent; disabled if not verified
  - "Not verified yet" banner if is_verified=false
  - Active order card (if assigned): restaurant address, customer address, item count, order total
  - Today's earnings + deliveries count

- [x] **8.2 Available orders** (`/delivery/orders`)
  - List of pending orders nearby (refreshes every 30s or via Reverb)
  - Order card: restaurant name, distance, payout amount, items count
  - "Accept" button — POST `/delivery/orders/{id}/accept`

- [x] **8.3 Active delivery flow**
  - Step indicators: Picking up → Picked up → Delivering
  - Customer name, delivery address, contact (call button)
  - Map placeholder (static lat/lng display; full map integration is optional)
  - `PATCH /delivery/orders/{id}/status` buttons at each step
  - Status update broadcasts to customer's tracking page in real time

- [x] **8.4 Earnings** (`/delivery/earnings`)
  - Summary: today / this week / this month
  - Per-order list: order number, restaurant, delivery fee earned, date
  - Total deliveries count

- [x] **8.5 Partner profile** (`/delivery/profile`)
  - Edit name, phone, vehicle type, vehicle number
  - Profile image upload
  - Current avg_rating display

---

## Phase 9 — Frontend: Admin Panel

- [x] **9.1 Admin dashboard** (`/admin/dashboard`)
  - Stat cards: total orders today, gross revenue today, active restaurants, registered delivery partners, pending approvals
  - Platform health: order success rate %, avg delivery time
  - Recent orders table (last 20)

- [x] **9.2 User management** (`/admin/users`)
  - Searchable table: name, email, role badge, status (active/inactive), registered date
  - Row actions: view orders, activate/deactivate, soft delete
  - Filter by role, status

- [x] **9.3 Restaurant management** (`/admin/restaurants`)
  - Tabs: Pending Approval / Approved / Suspended
  - Pending tab: restaurant details, approve button, reject button (rejection reason textarea required)
  - Feature toggle on approved restaurants
  - Suspend / unsuspend action

- [x] **9.4 Order management** (`/admin/orders`)
  - All-restaurant orders table: order number, restaurant, customer, status badge, payment method, total
  - Filter: status, date range, restaurant, payment method
  - Order detail modal

- [x] **9.5 Delivery partner management** (`/admin/delivery-partners`)
  - Table: name, phone, is_verified, is_available, total deliveries, avg_rating
  - Verify / suspend actions

- [x] **9.6 Coupon management** (`/admin/coupons`)
  - Platform-wide coupons (not restaurant-scoped)
  - Full CRUD table + create/edit modal

- [x] **9.7 Loyalty management** (`/admin/loyalty`)
  - Config cards: earn rate, redeem rate, min redeem, max redeem %, expiry months, loyalty enabled toggle
  - Inline edit each setting (PUT `/admin/loyalty/config`)
  - Loyalty tiers table: edit points threshold, multiplier per tier
  - Manual bonus grant form: user search, points amount, reason

- [x] **9.8 Notification broadcaster** (`/admin/notifications`)
  - Compose form: title, message, target (all users / role filter / specific user)
  - Send button → POST `/admin/notifications/broadcast`
  - Sent notifications log

- [x] **9.9 Platform settings** (`/admin/settings`)
  - Settings table: key, current value, type (boolean/integer/float/string), description
  - Inline edit with confirm dialog

- [x] **9.10 Revenue reports** (`/admin/reports`)
  - Date range picker
  - Gross order volume, total commission earned, delivery revenue
  - Bar/line chart by day
  - Export CSV button (frontend-generated from API data)

---

## Phase 10 — Frontend: Superadmin Panel

- [x] **10.1 Superadmin dashboard** (`/superadmin/dashboard`)
  - Platform-wide KPIs: total restaurants, total users, GMV (gross merchandise value), total commissions, platform revenue
  - 30-day revenue trend chart

- [x] **10.2 Admin account management** (`/superadmin/admins`)
  - Create new admin (name, email, password)
  - List with deactivate/delete actions
  - Change admin password

- [x] **10.3 Commission management** (`/superadmin/commissions`)
  - Default commission rate display (from platform_settings)
  - Per-restaurant override table: restaurant name, rate_pct, effective date
  - Add/edit/delete override modal

- [x] **10.4 Audit logs** (`/superadmin/audit-logs`)
  - Read-only paginated table: timestamp, actor (user name + role), action (created/updated/deleted), target (model name + ID), changed fields diff
  - Filters: action type, target model, actor, date range

- [x] **10.5 Financials / P&L** (`/superadmin/financials`)
  - Date range picker
  - Gross Order Value: sum of `orders.total_amount` (delivered)
  - Platform Commission: sum of `subtotal × commission_rate` per delivered order
  - Delivery Revenue: sum of `delivery_fee − partner_earned` per order
  - Expenses (manual input, stored in platform_settings)
  - Net P&L = Commission + Delivery Revenue − Expenses
  - Tabular breakdown by restaurant

- [x] **10.6 Feature flags** (`/superadmin/feature-flags`)
  - Toggle cards for: reviews_enabled, coupons_enabled, loyalty_enabled, delivery_partner_enabled, maintenance_mode
  - Each toggle updates `platform_settings` via PUT

- [x] **10.7 User impersonation** (`/superadmin/impersonation`)
  - User search input
  - "Impersonate" button → POST `/superadmin/impersonate/{userId}` → redirects to that user's panel
  - Persistent warning banner across all pages while impersonating
  - "Exit impersonation" button

- [x] **10.8 Platform settings** (`/superadmin/settings`)
  - Same UI as admin settings but shows superadmin-only keys too (tax_rate_pct, maintenance_mode)

---

## Phase 11 — Polish & QA

- [x] **11.1 Mobile-first responsive pass (all 5 panels)**
  - Customer: bottom tab bar navigation, touch-friendly cart drawer, mobile search overlay
  - Owner: sidebar → hamburger + slide-in drawer, full-width tables → horizontal scroll
  - Delivery: already mobile-first, verify all touch targets ≥ 44×44px
  - Admin/Superadmin: sidebar collapses, table → card stack on mobile

- [x] **11.2 Framer Motion animations pass**
  - Page transitions: fade + 12px upward slide, 250ms (all route changes)
  - Cart drawer: spring slide-in from right (desktop) / bottom (mobile), backdrop blur
  - Cart item add: quantity badge pulse
  - Restaurant card hover: y: -4px lift + shadow intensify, 200ms
  - Order timeline: connector line animated fill on status change
  - Bottom sheet/modal: spring open, backdrop fade
  - Skeleton shimmer: left-to-right gradient sweep, 1.5s loop

- [x] **11.3 Icon audit**
  - Run `/suggest-lucide-icons` on every panel
  - Verify icon map from plan.md §Icon System is applied consistently
  - Loyalty icons: `Gem` (tier badge), `Trophy` (leaderboard), `Sparkles` (earn), `BadgePercent` (redeem)
  - No inconsistent icon usage across panels

- [x] **11.4 Empty states**
  - Every list/grid that can be empty has: inline SVG illustration + heading + primary action button
  - Cart empty, order history empty, favourites empty, notifications empty, search no results, reviews empty

- [x] **11.5 Loading states**
  - Every data-fetching component has a skeleton (shape-matching, not generic spinner)
  - Forms have button loading state (spinner replaces text, button disabled)

- [x] **11.6 Error states**
  - All form fields: red border + error icon + message below on validation failure
  - API errors: toast for server errors, inline for field errors
  - Full-page error boundary for unexpected crashes

- [x] **11.7 Performance pass**
  - All images: WebP format (enforced by `ImageService` on upload)
  - All images: explicit `width` + `height` attributes (no layout shift)
  - All route pages: `React.lazy()` + `Suspense`
  - Bundle analysis: `npm run build && npx vite-bundle-visualizer` — check for large chunks
  - Debounce all search inputs (300ms)

- [x] **11.8 End-to-end flow test (all 5 roles)**
  - **Customer**: register → browse → add to cart → checkout (Razorpay test mode) → track order → rate delivery → view loyalty points
  - **Customer COD**: same flow with COD payment
  - **Owner**: register → submit restaurant → (admin approve) → manage menu → receive real-time order → advance status
  - **Delivery Partner**: register → admin verify → go available → accept order → advance through steps → check earnings
  - **Admin**: approve restaurant, suspend user, configure loyalty rates, broadcast notification
  - **Superadmin**: create admin, set commission override, view audit log, impersonate user

- [x] **11.9 Security checklist**
  - Confirm all owner routes are behind `CheckRestaurantOwner` middleware
  - Confirm all policies throw 403 on cross-tenant access attempts
  - Confirm superadmin-only routes reject admin role (test with admin token)
  - Confirm Razorpay HMAC verification rejects tampered signatures
  - Confirm order total is recalculated server-side (never trusting client-sent price)
  - Confirm `verified` middleware blocks payment from unverified emails
  - Confirm all file uploads reject non-image MIME types

---

## Ongoing / Throughout

- [ ] Use `/impeccable` skill before writing any new UI component
- [ ] Use `/senior-fullstack` for backend implementations
- [ ] Use `/mobile-responsiveness` after completing each panel
- [ ] Use `/framer-motion-animator` for all animated components
- [ ] Every API response uses `ApiResponse` trait envelope
- [ ] Every list endpoint is paginated (`meta.page`, `meta.per_page`, `meta.total`)
- [ ] No hardcoded strings — all configurable values read from `platform_settings`

---

**Total estimated effort:** ~66 developer-days (see plan.md §Development Sequence for per-task breakdown)
