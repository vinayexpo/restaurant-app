# Restaurant App Postman Guide

## Environment

Create a Postman environment with these variables:

| Variable | Initial value |
|---|---|
| `baseUrl` | `https://backend-production-4c40.up.railway.app` |
| `apiUrl` | `{{baseUrl}}/api` |
| `token` | Set after login |
| `customerToken` | Customer login token |
| `ownerToken` | Restaurant owner login token |
| `deliveryToken` | Delivery partner login token |
| `adminToken` | Admin login token |
| `superadminToken` | Superadmin login token |
| `restaurantId` | Restaurant ID |
| `orderId` | Order ID |
| `addressId` | Customer address ID |
| `menuItemId` | Menu item ID |

For protected requests, add the header:

```http
Authorization: Bearer {{token}}
Accept: application/json
```

Use the role token required by the request, for example `Bearer {{ownerToken}}`.

## Authentication Folder

### Register Customer

```http
POST {{apiUrl}}/auth/register
Content-Type: application/json

{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "phone": "9876543210",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "role": "customer"
}
```

In the Postman Tests tab, save the token:

```javascript
pm.environment.set('customerToken', pm.response.json().data.token);
```

### Login

```http
POST {{apiUrl}}/auth/login
Content-Type: application/json

{
  "email": "asha@example.com",
  "password": "Password123!"
}
```

### Current User

```http
GET {{apiUrl}}/auth/me
Authorization: Bearer {{customerToken}}
```

## Public Folder

```http
GET {{apiUrl}}/settings/public
```

The response includes `data.tax_rate_pct`, the percentage used for checkout tax calculations.

```http
GET {{apiUrl}}/restaurants?city=Delhi&is_veg=1&sort=rating&page=1
```

```http
GET {{apiUrl}}/restaurants/search?q=biryani&page=1
```

```http
GET {{apiUrl}}/restaurants/{{restaurantId}}/menu
```

## Customer Folder

### Create Address

```http
POST {{apiUrl}}/addresses
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "label": "Home",
  "address_line1": "12 Market Road",
  "address_line2": "Near Central Park",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "is_default": true
}
```

### Cart

```http
POST {{apiUrl}}/cart/items
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "menu_item_id": {{menuItemId}},
  "variant_id": null,
  "quantity": 2
}
```

```http
GET {{apiUrl}}/cart
Authorization: Bearer {{customerToken}}
```

```http
POST {{apiUrl}}/coupons/validate
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{ "code": "WELCOME20" }
```

### Loyalty

```http
GET {{apiUrl}}/loyalty
Authorization: Bearer {{customerToken}}
```

```http
POST {{apiUrl}}/loyalty/redeem
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{ "points": 100 }
```

### Razorpay Checkout

Initiate before opening Razorpay Checkout. Do not send an amount; the backend creates a trusted quote.

```http
POST {{apiUrl}}/payment/initiate
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "address_id": {{addressId}},
  "coupon_code": "WELCOME20",
  "loyalty_points": 0,
  "special_instructions": "Please avoid cutlery."
}
```

Save Razorpay order ID:

```javascript
pm.environment.set('rzp_order_id', pm.response.json().data.rzp_order_id);
```

After completing Razorpay Checkout in the frontend, submit the returned payment/signature values:

```http
POST {{apiUrl}}/payment/verify
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "payment_method": "razorpay",
  "rzp_order_id": "{{rzp_order_id}}",
  "rzp_payment_id": "{{rzp_payment_id}}",
  "rzp_signature": "{{rzp_signature}}",
  "address_id": {{addressId}},
  "coupon_code": "WELCOME20",
  "loyalty_points": 0
}
```

### Cash On Delivery

```http
POST {{apiUrl}}/payment/verify
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{
  "payment_method": "cod",
  "address_id": {{addressId}},
  "loyalty_points": 0
}
```

### Customer Order Management

```http
GET {{apiUrl}}/orders?status=confirmed&date_from=2026-09-01&date_to=2026-09-30&page=1
Authorization: Bearer {{customerToken}}
```

```http
PATCH {{apiUrl}}/orders/{{orderId}}/cancel
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{ "reason": "Changed my mind" }
```

### Edit Or Delete Customer Review

```http
PUT {{apiUrl}}/reviews/{{reviewId}}
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{ "rating": 5, "comment": "Updated review text." }
```

```http
DELETE {{apiUrl}}/reviews/{{reviewId}}
Authorization: Bearer {{customerToken}}
```

### Deactivate Customer Account

```http
DELETE {{apiUrl}}/auth/account
Authorization: Bearer {{customerToken}}
Content-Type: application/json

{ "current_password": "Password123!", "confirmation": "DELETE" }
```

## Owner Folder

### Create Restaurant

```http
POST {{apiUrl}}/owner/restaurant
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{
  "name": "Spice Route",
  "address": "12 Market Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "phone": "9876543210",
  "email": "owner@spiceroute.test",
  "cuisine_types": ["Indian", "North Indian"],
  "opening_time": "10:00",
  "closing_time": "23:00",
  "fssai_number": "12345678901234"
}
```

### Create Menu Item

```http
POST {{apiUrl}}/owner/menu-items
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{
  "category_id": 1,
  "name": "Paneer Butter Masala",
  "price": 280,
  "discounted_price": 250,
  "is_veg": true,
  "is_available": true,
  "preparation_time": 20,
  "tags": ["popular", "spicy"]
}
```

For images, change Postman Body to `form-data`, enter the same fields, and select a file for `image`.

### Orders And Refunds

```http
GET {{apiUrl}}/owner/orders?status=pending&search=ORD-&payment_method=razorpay&page=1
Authorization: Bearer {{ownerToken}}
```

```http
PATCH {{apiUrl}}/owner/orders/{{orderId}}/status
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{ "status": "confirmed", "note": "Order accepted." }
```

```http
PATCH {{apiUrl}}/owner/orders/{{orderId}}/status
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{ "status": "cancelled", "reason": "An ingredient is unavailable." }
```

Cancellation triggers a full refund for an eligible paid Razorpay order.

```http
DELETE {{apiUrl}}/owner/reviews/{{reviewId}}/reply
Authorization: Bearer {{ownerToken}}
```

```http
POST {{apiUrl}}/owner/orders/{{orderId}}/refund
Authorization: Bearer {{ownerToken}}
Idempotency-Key: {{$guid}}
Content-Type: application/json

{
  "amount": 100.00,
  "reason": "Partial refund for unavailable item"
}
```

## Delivery Folder

```http
PATCH {{apiUrl}}/delivery/availability
Authorization: Bearer {{deliveryToken}}
```

```http
PATCH {{apiUrl}}/delivery/location
Authorization: Bearer {{deliveryToken}}
Content-Type: application/json

{ "latitude": 12.9716, "longitude": 77.5946 }
```

```http
GET {{apiUrl}}/delivery/orders/available?search=ORD-&page=1
Authorization: Bearer {{deliveryToken}}
```

```http
DELETE {{apiUrl}}/delivery/payout-account
Authorization: Bearer {{deliveryToken}}
```

```http
POST {{apiUrl}}/delivery/orders/{{orderId}}/accept
Authorization: Bearer {{deliveryToken}}
```

```http
PATCH {{apiUrl}}/delivery/orders/{{orderId}}/status
Authorization: Bearer {{deliveryToken}}
Content-Type: application/json

{ "status": "picked_up" }
```

## Admin Folder

```http
GET {{apiUrl}}/admin/orders?status=delivered&payment_method=razorpay&date_from=2026-09-01&date_to=2026-09-30
Authorization: Bearer {{adminToken}}
```

```http
PATCH {{apiUrl}}/admin/users/{{userId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{ "name": "Updated Owner", "phone": "9876543210" }
```

```http
PATCH {{apiUrl}}/admin/restaurants/{{restaurantId}}/reject
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{ "rejection_reason": "Please provide a valid food license document." }
```

```http
POST {{apiUrl}}/admin/loyalty/tiers
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "name": "Gold",
  "min_lifetime_points": 1000,
  "points_multiplier": 1.5,
  "free_delivery": true,
  "free_delivery_min": 299,
  "badge_color": "#D4AF37",
  "perks": ["1.5x points", "Free delivery over INR 299"]
}
```

```http
GET {{apiUrl}}/admin/reports/revenue?date_from=2026-09-01&date_to=2026-09-30
Authorization: Bearer {{adminToken}}
```

### Update Tax Rate

```http
PUT {{apiUrl}}/superadmin/settings/tax_rate_pct
Authorization: Bearer {{superadminToken}}
Content-Type: application/json

{ "value": 5, "cast": "float" }
```

## Superadmin Folder

```http
POST {{apiUrl}}/superadmin/bootstrap
Content-Type: application/json

{
  "name": "Platform Owner",
  "email": "owner@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

```http
POST {{apiUrl}}/superadmin/commissions
Authorization: Bearer {{superadminToken}}
Content-Type: application/json

{
  "restaurant_id": {{restaurantId}},
  "rate_pct": 12.5,
  "effective_from": "2026-10-01",
  "notes": "Negotiated rate for Q4"
}
```

```http
GET {{apiUrl}}/superadmin/financials?date_from=2026-09-01&date_to=2026-09-30
Authorization: Bearer {{superadminToken}}
```

```http
POST {{apiUrl}}/superadmin/impersonate/{{userId}}
Authorization: Bearer {{superadminToken}}
```

## Useful Collection Tests

Use these tests in protected requests to fail fast when authentication or validation fails:

```javascript
pm.test('Request succeeded', () => pm.expect(pm.response.code).to.be.within(200, 299));
pm.test('API returned a success envelope', () => pm.expect(pm.response.json().success).to.eql(true));
```

For paginated requests:

```javascript
pm.test('Pagination metadata is present', () => {
  const body = pm.response.json();
  pm.expect(body.meta).to.have.property('page');
  pm.expect(body.meta).to.have.property('last_page');
});
```

## Important Payment Notes

- Never set an order total from Postman or browser code. The server creates the Razorpay amount from the cart.
- Do not reuse an `rzp_order_id`; checkout quotes are single-use and expire in 15 minutes.
- Use a unique `Idempotency-Key` for every owner refund request. Retrying the same request with the same key is safe.
- Razorpay webhooks require the exact raw request body and valid `X-Razorpay-Signature`; use Razorpay Dashboard webhooks rather than manually replaying unsigned events.
