# Restaurant App API Reference

## Conventions

- Base URL: `https://backend-production-4c40.up.railway.app/api`
- Protected endpoints require `Authorization: Bearer <Sanctum token>`.
- JSON requests should include `Content-Type: application/json`; image uploads use `multipart/form-data`.
- Success envelope: `{ "success": true, "data": ..., "message": "..." }`.
- Paginated responses also contain `meta: { page, per_page, total, last_page }`.
- Validation/error envelope: `{ "success": false, "message": "...", "errors": { ... } }`.
- Standard pagination is 15 records per page unless noted. Supply `page=N` to move through results.

## Authentication And Public Endpoints

| Method | Path | Auth | Request/query | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `name`, `email`, `password`, `password_confirmation`; optional `phone`, `role` | Roles: `customer` (default) or `delivery_partner`; delivery registration also requires `vehicle_type`, `vehicle_number`, `licence_number`. Returns user/token. |
| POST | `/auth/login` | Public | `email`, `password` | Returns user/token. |
| POST | `/auth/forgot-password` | Public | `email` | Sends reset link. |
| POST | `/auth/reset-password` | Public | `token`, `email`, `password`, `password_confirmation` | Revokes all prior tokens. |
| POST | `/auth/logout` | Any token | None | Revokes current token. |
| GET | `/auth/me` | Any token | None | Current user and role-specific profile relation. |
| PUT | `/auth/profile` | Any token | `name`, `phone`, `profile_image` | `profile_image` is JPEG/PNG/JPG/WebP, max 5 MB. |
| PUT | `/auth/password` | Any token | `current_password`, `new_password`, `new_password_confirmation` | Revokes other user tokens. |
| DELETE | `/auth/account` | Customer token | `current_password`, `confirmation` = `DELETE` | Revokes tokens, removes ephemeral customer data, anonymizes/deactivates account, and preserves transactional records. |
| GET | `/settings/public` | Public | None | Public settings including `tax_rate_pct`, loyalty rules, and feature flags. |
| GET | `/restaurants` | Public | `city`, `cuisine_type`, `is_veg`, `min_rating`, `sort`, `lat`, `lng` | Active restaurants; sort supports `rating`, `delivery_fee`, `distance`. |
| GET | `/restaurants/featured` | Public | None | Up to 10 featured restaurants. |
| GET | `/restaurants/search` | Public | `q` required | Paginated name/cuisine search. |
| GET | `/restaurants/autocomplete` | Public | `q` required | Up to 8 compact matches. |
| GET | `/restaurants/{slug}` | Public | Path slug | Active restaurant and computed opening state. |
| GET | `/restaurants/{id}/menu` | Public | Path ID | Active categories, available menu items, and variants. |
| GET | `/restaurants/{id}/reviews` | Public | Path ID | Paginated restaurant reviews. |
| POST | `/webhooks/razorpay` | Razorpay signature | Raw event body, `X-Razorpay-Signature` | Payment, refund, and payout webhook reconciliation. |

## Customer APIs

All routes below require the `customer` role.

### Addresses

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET | `/addresses` | None | Customer addresses, default first. |
| POST | `/addresses` | `label`, `address_line1`, `city`, `state`, `pincode`; optional `address_line2`, `latitude`, `longitude`, `is_default` | `label`: `Home`, `Work`, or `Other`; returns 201. |
| GET | `/addresses/{id}` | None | Customer-owned address only. |
| PUT | `/addresses/{id}` | Any address fields | Updates customer-owned address. |
| DELETE | `/addresses/{id}` | None | Removes customer-owned address. |
| PATCH | `/addresses/{id}/set-default` | None | Clears other defaults. |

### Cart, Coupons, And Favourites

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET | `/cart` | None | Cart plus base `pricing_preview`. |
| POST | `/cart/items` | `menu_item_id`, optional `variant_id`, `quantity` 1-20 | Adding another restaurant item replaces existing cart. |
| PUT | `/cart/items/{id}` | `quantity` 1-20 | Updates a cart item. |
| DELETE | `/cart/items/{id}` | None | Removes an item. |
| DELETE | `/cart` | None | Clears cart. |
| POST | `/coupons/validate` | `code` | Validates against current cart and returns discount. |
| GET | `/favourites` | `search` | Paginated restaurant favourites. |
| POST | `/favourites/{restaurantId}` | None | Idempotently creates favourite. |
| DELETE | `/favourites/{restaurantId}` | None | Idempotently removes favourite. |

### Orders, Reviews, And Ratings

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET | `/orders` | `status`, `date_from`, `date_to` | Paginated order history. |
| GET | `/orders/{id}` | None | Items, history, restaurant, delivery partner/address, review. |
| PATCH | `/orders/{id}/cancel` | `reason` required | Only `pending`/`confirmed`; paid Razorpay orders request a full refund. |
| POST | `/orders/{id}/reorder` | None | Replaces cart with available prior items. |
| POST | `/reviews` | `order_id`, `rating` 1-5; optional `comment`, `images` | One review for each delivered order. |
| PUT | `/reviews/{review}` | `rating` 1-5; optional `comment`, `images` | Updates customer-owned review and recalculates restaurant rating. |
| DELETE | `/reviews/{review}` | None | Deletes customer-owned review and recalculates restaurant rating. |
| POST | `/orders/{id}/rate-delivery` | `rating` 1-5; optional `comment` | One delivery rating per delivered order. |

### Loyalty

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET | `/loyalty` | None | Balance, current/next tier, expiry information. |
| GET | `/loyalty/transactions` | `type`, `date_from`, `date_to` | Paginated `earned`, `redeemed`, `expired`, `bonus`, or `adjusted` activity. |
| POST | `/loyalty/redeem` | `points` | Calculates cart discount; does not debit yet. |
| GET | `/loyalty/tiers` | None | Tier configuration. |

### Payments

| Method | Path | Body/query | Notes |
|---|---|---|---|
| POST | `/payment/initiate` | `address_id`; optional `coupon_code`, `loyalty_points`, `special_instructions` | Razorpay only. Server calculates a trusted quote and returns `rzp_order_id`, `amount_paise`, `currency`, `key_id`, `total_amount`. Quote expires after 15 minutes. |
| POST | `/payment/verify` | `payment_method`; `address_id`; optional checkout fields; Razorpay also requires `rzp_order_id`, `rzp_payment_id`, `rzp_signature` | Quote must be owned, unexpired, unused, exact, and match the recalculated cart total. Returns 201 order IDs. |

Pricing is calculated server-side from stored cart prices. Coupon and loyalty discounts are mutually exclusive. Tax applies after discount and before delivery fee. Cancellation/refund restores redeemed loyalty points and coupon usage exactly once.

## Notifications And Push

These routes require any authenticated role.

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET | `/notifications` | `read_status`, `date_from`, `date_to` | Paginated current-user notifications. |
| GET | `/notifications/unread-count` | None | `{ unread_count }`. |
| PATCH | `/notifications/{id}/read` | None | Marks a user-owned notification read. |
| PATCH | `/notifications/read-all` | None | Marks every unread notification read. |
| POST | `/push-subscriptions` | `endpoint`, `keys.p256dh`, `keys.auth` | Creates/updates device subscription. |
| DELETE | `/push-subscriptions` | `endpoint` | Removes device subscription. |

## Restaurant Owner APIs

All routes require `restaurant_owner`; routes after restaurant creation require an owned restaurant.

### Restaurant And Hours

| Method | Path | Body/query | Notes |
|---|---|---|---|
| POST | `/owner/restaurant` | Required: name/address/contact/cuisine/hours/FSSAI fields | Creates restaurant pending approval; `logo` is multipart image. |
| GET | `/owner/restaurant` | None | Current restaurant. |
| PUT | `/owner/restaurant` | Editable restaurant fields, `logo`, `cover_image` | Partial update; files multipart. |
| GET | `/owner/restaurant/hours` | None | Seven daily hour records. |
| PUT | `/owner/restaurant/hours` | `hours`: seven day objects | Upserts operating hours. |

### Categories And Menu

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET/POST | `/owner/categories` | Category: `name`; optional `image`, `sort_order`, `is_active` | List or create category. |
| GET/PUT/DELETE | `/owner/categories/{id}` | Category fields | Restaurant-scoped CRUD. |
| GET | `/owner/menu-items` | `page`, `per_page`, `search`, `category_id`, `is_available`, `is_veg` | Paginated menu including category/variants. |
| POST | `/owner/menu-items` | `category_id`, `name`, `price`; optional description/discount/flags/tags/image | Creates restaurant-scoped menu item. |
| GET/PUT/DELETE | `/owner/menu-items/{id}` | Menu fields | Restaurant-scoped item CRUD. |
| POST | `/owner/menu-items/{id}/variants` | `name`, `price` | Creates variant. |
| PUT/DELETE | `/owner/menu-items/{id}/variants/{variantId}` | Variant fields | Updates/removes item-owned variant. |

### Owner Orders And Refunds

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET | `/owner/orders` | `status`, `search`, `customer`, `payment_method`, `date_from`, `date_to` | Paginated owner orders. |
| GET | `/owner/orders/status-counts` | None | Counts keyed by status. |
| GET | `/owner/orders/{id}` | None | Full order detail. |
| PATCH | `/owner/orders/{id}/status` | `status`; `reason` required for cancel; optional `note` | Valid state transitions only. Paid Razorpay cancellation triggers full refund. |
| POST | `/owner/orders/{id}/refund` | Optional `amount`, `reason`; optional `Idempotency-Key` header | Only cancelled paid Razorpay orders. Supports partial refunds without over-refunding. |

### Reviews, Coupons, And Revenue

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET | `/owner/reviews` | `rating`, `replied`, `search`, `date_from`, `date_to` | Paginated reviews. |
| PATCH | `/owner/reviews/{id}/reply` | `owner_reply` | Adds/replaces reply. |
| DELETE | `/owner/reviews/{id}/reply` | None | Clears a reply for a review on the owner's restaurant. |
| GET/POST | `/owner/coupons` | List filters `code`, `active`, `validity`; coupon create fields | Paginated coupon list/create. |
| GET/PUT/DELETE | `/owner/coupons/{id}` | Coupon fields | Restaurant-scoped CRUD. |
| GET | `/owner/revenue` | `period`: daily/weekly/monthly | Delivered-order revenue and top items. |

## Delivery Partner APIs

All routes require `delivery_partner`.

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET/PUT | `/delivery/profile` | Vehicle/user profile fields | Current partner profile/update. |
| PATCH | `/delivery/availability` | None | Toggles verified partner availability. |
| PATCH | `/delivery/location` | `latitude`, `longitude` | Updates and broadcasts active-delivery location. |
| GET | `/delivery/orders/available` | `search`, `page` | Available ready-for-pickup orders; nearest first when location exists. |
| POST | `/delivery/orders/{id}/accept` | None | Atomically claims an unassigned order. |
| GET | `/delivery/orders/{id}` | None | Assigned order details. |
| PATCH | `/delivery/orders/{id}/status` | `status`: picked_up/on_the_way/delivered | Enforces state transition and ownership. |
| PATCH | `/delivery/orders/{id}/payment` | None | Marks eligible delivered COD payment paid. |
| GET | `/delivery/history` | `status`, `search`, `date_from`, `date_to` | Paginated history. |
| GET | `/delivery/earnings` | `status`, `search`, `date_from`, `date_to` | Paginated earnings/totals. |
| GET | `/delivery/earnings/summary` | None | Today/week/month aggregates. |
| GET/POST/DELETE | `/delivery/payout-account` | Account body; delete has no body | Gets, replaces, or removes active bank/UPI account. Accounts with payout history are deactivated rather than deleted. |
| GET/POST | `/delivery/payouts` | List filters or `payout_account_id`, `earning_ids` | Paginated payouts/request payout. |

## Admin APIs

All `/admin/*` routes require `admin` or `superadmin`.

| Method | Path | Body/query | Notes |
|---|---|---|---|
| GET | `/admin/dashboard` | None | Operational dashboard statistics. |
| POST/GET | `/admin/users` | Create user; filters `role`, `is_active`, `search` | Owner account creation and paginated user management. |
| GET | `/admin/users/{id}` | None | User with restaurant/delivery relations. |
| PATCH | `/admin/users/{id}` | Optional `name`, `email`, `phone` | Role-safe contact/profile update; role cannot be changed. |
| PATCH | `/admin/users/{id}/activate` or `/deactivate` | None | Account state. |
| GET | `/admin/restaurants` | `status`, `search` | Paginated approval queue. |
| GET | `/admin/restaurants/{id}` | None | Restaurant/owner detail. |
| PATCH | `/admin/restaurants/{id}/approve`, `/reject`, `/suspend`, `/feature` | Reject needs `rejection_reason`; suspend optional `reason` | Approval and visibility controls. |
| GET | `/admin/orders` | `status`, `restaurant_id`, `payment_method`, `search`, `customer`, dates | Paginated all orders. |
| GET | `/admin/orders/{id}` | None | Full order detail. |
| GET | `/admin/delivery-partners` | `is_verified`, `search` | Paginated delivery partners. |
| PATCH | `/admin/delivery-partners/{id}/verify` or `/suspend` | None | Verification status. |
| GET | `/admin/delivery-payouts` | `status` | Paginated payouts. |
| PATCH | `/admin/delivery-payouts/{id}/approve` or `/reject` | Reject needs `reason` | Payout processing. |
| GET/POST | `/admin/coupons` | `search`, `is_active`; coupon body | Platform coupon list/create. |
| PUT/DELETE | `/admin/coupons/{id}` | Coupon fields | Platform coupon update/delete. |
| GET/PUT | `/admin/loyalty/config` | Loyalty config fields | Loyalty rules. |
| GET/POST | `/admin/loyalty/tiers` | Tier fields | List/create tiers. |
| PUT/DELETE | `/admin/loyalty/tiers/{id}` | Tier fields | Update/delete safe tier. |
| POST | `/admin/loyalty/bonus` | `user_id`, `points`, `reason` | Grants bonus points. |
| POST | `/admin/notifications/broadcast` | `title`, `body`, `target`; optional `user_id`, `data` | Sends broadcast notifications. |
| GET | `/admin/settings` | None | Non-superadmin settings; excludes `tax_rate_pct`, `maintenance_mode`, and `default_commission_pct`. |
| PUT | `/admin/settings/{key}` | `value`, optional `cast` | Updates permitted setting. |
| GET | `/admin/reports/revenue` or `/orders` | `date_from`, `date_to` | Date range max 366 days; includes refund/cancellation metrics. |

## Superadmin APIs

| Method | Path | Auth | Body/query | Notes |
|---|---|---|---|---|
| GET/POST | `/superadmin/bootstrap-status`, `/superadmin/bootstrap` | Public bootstrap only | First account body | Creates first superadmin only when none exists. |
| GET/POST | `/superadmin/admins` | Superadmin | `search`, `is_active`; admin create body | Paginated admin accounts/create. |
| PUT/DELETE | `/superadmin/admins/{id}` | Superadmin | Admin fields | Update/delete admin account. |
| GET/POST | `/superadmin/commissions` | Superadmin | Filters or `restaurant_id`, `rate_pct`, `effective_from` | Paginated overrides/create. |
| PUT/DELETE | `/superadmin/commissions/{id}` | Superadmin | Commission fields | Update/delete override. |
| GET | `/superadmin/audit-logs` | Superadmin | action/search/target/user/date filters | Paginated audit log (25/page). |
| GET | `/superadmin/financials` | Superadmin | `date_from`, `date_to` | GMV, refunds, cancellations, commissions; 366-day max. |
| GET/PUT | `/superadmin/feature-flags`, `/superadmin/feature-flags/{key}` | Superadmin | Boolean `value` for update | Supported feature flags only. |
| GET/PUT | `/superadmin/settings`, `/superadmin/settings/{key}` | Superadmin | Setting `value`, optional `cast` | Full platform settings, including `tax_rate_pct`. |
| POST | `/superadmin/impersonate/{userId}` | Superadmin | None | Issues 15-minute user token. |
| DELETE | `/superadmin/impersonate` | Impersonation token | None | Revokes current impersonation session. |

## Realtime Channels

The frontend connects to Reverb using `VITE_REVERB_*` variables. Authenticated private channels include `user.{id}`, `restaurant.{id}`, `delivery.{id}`, and order-specific channels defined in `routes/channels.php`. Events include new orders, order status changes, delivery location updates, and notifications.
