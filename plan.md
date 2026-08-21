# Restaurant Web Application — Full-Stack Development Plan
> Production-grade food delivery platform (Swiggy / Zomato class)
> Design authority: **Impeccable** skill — award-winning design director standard

---

## Verified Tech Stack

| Layer | Technology | Verified Version |
|---|---|---|
| Frontend Framework | React + Vite | react-scripts 5.0.1 / Node 26.5.1 |
| Styling | Tailwind CSS v4 | via @tailwindcss/vite |
| Animation | Framer Motion | npm install |
| State | Redux Toolkit | npm install |
| Backend | Laravel | 13 (installer 5.30.0) |
| Language | PHP | 8.5.1 |
| Database | MySQL Community | 8.0.46 |
| Package Manager | Composer | 2.10.2 |
| JS Runtime | Node.js | v26.5.1 |
| Version Control | Git | 2.50.1 |

---

## Skills to Use During Development

### Already Installed (use via `/skill-name`)
| Skill | When to Use |
|---|---|
| `impeccable` | Every UI component — craft-floor quality standard |
| `frontend-design` | Building new pages and component shells |
| `ui-design` | Component-level design decisions |
| `tailwind-design-system` | Token setup, Tailwind config, utility patterns |
| `mobile-responsiveness` | Every screen — mobile-first pass |
| `framer-motion-animator` | Order tracking, cart drawer, page transitions |
| `react-vite-expert` | Project init, Vite config, code splitting |
| `sleek-design-mobile-apps` | Mobile nav, bottom tabs, touch targets |
| `icons-badges` | Icon selection and badge design |
| `suggest-lucide-icons` | Icon decisions throughout UI |

### Install Before Starting (verified quality)
```bash
# React Vite Dashboard patterns (1.7K installs)
npx skills add google-labs-code/stitch-skills@react-vite-dashboard -g -y

# Tailwind Design System (2.8K installs)
npx skills add giuseppe-trisciuoglio/developer-kit@tailwind-design-system -g -y

# Responsive Design (16.8K installs)
npx skills add wshobson/agents@responsive-design -g -y

# Tailwind Mobile-First (1.9K installs)
npx skills add josiahsiegel/claude-plugin-marketplace@tailwindcss-mobile-first -g -y

# Senior Fullstack patterns (1.2K installs)
npx skills add alirezarezvani/claude-skills@senior-fullstack -g -y
```

---

## Panel Roles — Complete Breakdown

The application has **five distinct authenticated panels**, each with its own layout, navigation, permissions, and feature set.

### Role 1 — Customer Panel
### Role 2 — Restaurant Owner Panel
### Role 3 — Delivery Partner Panel
### Role 4 — Admin Panel
### Role 5 — Superadmin Panel

---

## Design System (Impeccable Standard)

> Design mode per surface:
> - **Home / Landing**: `Persuade` — earn attention and action
> - **Browse / Search / Menu**: `Persuade` — convert to order
> - **Cart / Checkout**: `Operate` — remove friction, complete task
> - **Order Tracking / History**: `Operate` — clarity and confidence
> - **All Dashboards**: `Operate` — scanability, real usage scene
> - **Auth pages**: `Operate` — focused, frictionless

### Color Palette

```css
:root {
  /* Brand — Saffron Fire (appetizing, energetic, premium) */
  --color-brand-50:  #FFF7ED;
  --color-brand-100: #FFEDD5;
  --color-brand-200: #FED7AA;
  --color-brand-300: #FDBA74;
  --color-brand-400: #FB923C;
  --color-brand-500: #F97316;   /* PRIMARY — CTAs, active states */
  --color-brand-600: #EA580C;   /* Hover */
  --color-brand-700: #C2410C;   /* Pressed */
  --color-brand-800: #9A3412;
  --color-brand-900: #7C2D12;

  /* Accent — Forest Emerald (fresh, organic, veg indicator) */
  --color-accent-400: #34D399;
  --color-accent-500: #10B981;  /* Veg badge, success, available */
  --color-accent-600: #059669;

  /* Danger — Non-veg indicator, errors, cancel */
  --color-danger-500: #EF4444;
  --color-danger-600: #DC2626;

  /* Warning — Delivery time badge, pending status */
  --color-warning-400: #FBBF24;
  --color-warning-500: #F59E0B;

  /* Neutrals — UI chrome */
  --color-neutral-0:   #FFFFFF;
  --color-neutral-50:  #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-200: #E5E7EB;
  --color-neutral-300: #D1D5DB;
  --color-neutral-400: #9CA3AF;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1F2937;
  --color-neutral-900: #111827;

  /* Surface layers */
  --surface-base:      #FFFFFF;
  --surface-raised:    #F9FAFB;
  --surface-overlay:   rgba(0, 0, 0, 0.5);
  --surface-glass:     rgba(255, 255, 255, 0.85);
}
```

### Typography

```css
/* Font stack — import in index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

:root {
  /* Display — brand moments, hero headings */
  --font-display: 'Playfair Display', Georgia, serif;

  /* UI — all interface text */
  --font-ui: 'Inter', system-ui, -apple-system, sans-serif;

  /* Scale */
  --text-xs:   0.75rem;   /* 12px — labels, badges */
  --text-sm:   0.875rem;  /* 14px — secondary text, captions */
  --text-base: 1rem;      /* 16px — body copy */
  --text-lg:   1.125rem;  /* 18px — card titles */
  --text-xl:   1.25rem;   /* 20px — section headings */
  --text-2xl:  1.5rem;    /* 24px — page headings */
  --text-3xl:  1.875rem;  /* 30px — hero sub */
  --text-4xl:  2.25rem;   /* 36px — hero primary */
  --text-5xl:  3rem;      /* 48px — display only */

  /* Weight */
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semibold: 600;
  --weight-bold:    700;
  --weight-extrabold: 800;
}
```

### Spacing & Radius

```css
:root {
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  --radius-sm:   0.375rem;  /* 6px — inputs, chips */
  --radius-md:   0.625rem;  /* 10px — cards */
  --radius-lg:   1rem;      /* 16px — drawers, modals bottom */
  --radius-xl:   1.5rem;    /* 24px — feature cards */
  --radius-full: 9999px;    /* pills, avatars */
}
```

### Shadow System

```css
:root {
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
  --shadow-card: 0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04);
  --shadow-brand: 0 4px 14px rgba(249,115,22,0.35);  /* orange glow on CTAs */
}
```

### Tailwind Config (tailwind.config.js)

```js
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { 50:'#FFF7ED', 100:'#FFEDD5', 200:'#FED7AA', 300:'#FDBA74',
                   400:'#FB923C', 500:'#F97316', 600:'#EA580C', 700:'#C2410C',
                   800:'#9A3412', 900:'#7C2D12' },
        accent:  { 400:'#34D399', 500:'#10B981', 600:'#059669' },
        neutral: { 0:'#FFFFFF', 50:'#F9FAFB', 100:'#F3F4F6', 200:'#E5E7EB',
                   300:'#D1D5DB', 400:'#9CA3AF', 500:'#6B7280', 600:'#4B5563',
                   700:'#374151', 800:'#1F2937', 900:'#111827' },
      },
      fontFamily: {
        display: ['Playfair Display', ...defaultTheme.fontFamily.serif],
        ui:      ['Inter', ...defaultTheme.fontFamily.sans],
        sans:    ['Inter', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        sm: '0.375rem', md: '0.625rem', lg: '1rem',
        xl: '1.5rem',  '2xl': '2rem',
      },
      boxShadow: {
        card:  '0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04)',
        brand: '0 4px 14px rgba(249,115,22,0.35)',
      },
      screens: {
        xs: '390px', sm: '640px', md: '768px',
        lg: '1024px', xl: '1280px', '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
```

### Animation Tokens (Framer Motion)

```js
// src/lib/motion.js
export const easing = {
  smooth:  [0.4, 0, 0.2, 1],
  spring:  { type: 'spring', stiffness: 400, damping: 30 },
  bounce:  { type: 'spring', stiffness: 500, damping: 20 },
  snappy:  [0.2, 0, 0, 1],
}

export const duration = {
  instant: 0.1,
  fast:    0.15,
  normal:  0.25,
  slow:    0.4,
}

export const transitions = {
  pageEnter:  { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, ease: easing.smooth } },
  cardHover:  { whileHover: { y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }, transition: { duration: 0.2 } },
  cartItem:   { layout: true, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9, height: 0 } },
  drawer:     { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' }, transition: { ease: easing.smooth, duration: 0.3 } },
  bottomSheet:{ initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { ease: easing.smooth, duration: 0.3 } },
  badge:      { initial: { scale: 0 }, animate: { scale: 1 }, transition: easing.bounce },
}
```

### Icon System (Lucide React)

```bash
npm install lucide-react
```

| Context | Icon Name |
|---|---|
| Search | `Search` |
| Location | `MapPin` |
| Cart | `ShoppingCart` |
| Order | `ClipboardList` |
| Delivery | `Bike` |
| Timer | `Clock` |
| Star / Rating | `Star` |
| Veg | `Leaf` |
| Non-Veg | `Drumstick` |
| Filter | `SlidersHorizontal` |
| Heart / Favourite | `Heart` |
| User | `User`, `UserCircle` |
| Restaurant | `UtensilsCrossed` |
| Menu | `Menu` |
| Plus / Minus | `Plus`, `Minus` |
| Coupon | `Tag` |
| Loyalty Points | `Gem` |
| Tier Badge | `Trophy` |
| Points Earn | `Sparkles` |
| Points Redeem | `BadgePercent` |
| Payment | `CreditCard`, `Wallet` |
| Notification | `Bell` |
| Settings | `Settings` |
| Logout | `LogOut` |
| Admin | `ShieldCheck` |
| Revenue | `TrendingUp` |
| Dashboard | `LayoutDashboard` |
| Check / Confirm | `CheckCircle2` |
| Cancel | `XCircle` |
| Preparing | `ChefHat` |
| Picked Up | `PackageCheck` |

---

## Project Structure

```
restaurant-app/
├── backend/                          # Laravel 13 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── PasswordResetController.php
│   │   │   │   │   └── EmailVerificationController.php
│   │   │   │   ├── PublicSettingsController.php
│   │   │   │   ├── Customer/
│   │   │   │   │   ├── RestaurantController.php
│   │   │   │   │   ├── MenuController.php
│   │   │   │   │   ├── CartController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   ├── ReviewController.php
│   │   │   │   │   ├── CouponController.php
│   │   │   │   │   ├── AddressController.php
│   │   │   │   │   ├── FavouriteController.php
│   │   │   │   │   ├── DeliveryRatingController.php
│   │   │   │   │   └── NotificationController.php
│   │   │   │   ├── Owner/
│   │   │   │   │   ├── RestaurantManageController.php
│   │   │   │   │   ├── CategoryController.php
│   │   │   │   │   ├── MenuItemController.php
│   │   │   │   │   ├── OrderManageController.php
│   │   │   │   │   ├── ReviewManageController.php
│   │   │   │   │   ├── OwnerCouponController.php
│   │   │   │   │   └── RevenueController.php
│   │   │   │   ├── Delivery/
│   │   │   │   │   ├── DeliveryController.php        ← profile, availability, PATCH /location
│   │   │   │   │   └── DeliveryOrderController.php   ← available orders, accept, status transitions
│   │   │   │   ├── Payment/
│   │   │   │   │   └── PaymentController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── DashboardController.php
│   │   │   │       ├── UserManageController.php
│   │   │   │       ├── RestaurantApprovalController.php
│   │   │   │       ├── AdminOrderController.php
│   │   │   │       ├── AdminDeliveryController.php
│   │   │   │       ├── AdminNotificationController.php
│   │   │   │       ├── SettingsController.php
│   │   │   │       ├── CouponManageController.php
│   │   │   │       ├── LoyaltyManageController.php
│   │   │   │       └── ReportController.php
│   │   │   │   │   └── LoyaltyController.php
│   │   │   │   ├── Superadmin/
│   │   │   │   │   ├── SuperAdminController.php
│   │   │   │   │   ├── CommissionController.php
│   │   │   │   │   ├── AuditLogController.php
│   │   │   │   │   ├── ImpersonationController.php
│   │   │   │   │   ├── FinancialsController.php
│   │   │   │   │   ├── FeatureFlagController.php
│   │   │   │   │   └── PlatformSettingsController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── EnsureRole.php
│   │   │   │   └── CheckRestaurantOwner.php
│   │   │   └── Requests/
│   │   │       ├── Auth/
│   │   │       │   ├── RegisterRequest.php
│   │   │       │   └── LoginRequest.php
│   │   │       ├── Order/
│   │   │       │   └── PlaceOrderRequest.php
│   │   │       ├── Menu/
│   │   │       │   └── MenuItemRequest.php
│   │   │       └── Payment/
│   │   │           └── VerifyPaymentRequest.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Restaurant.php
│   │   │   ├── Category.php
│   │   │   ├── MenuItem.php
│   │   │   ├── MenuItemVariant.php
│   │   │   ├── Address.php
│   │   │   ├── Cart.php
│   │   │   ├── CartItem.php
│   │   │   ├── Order.php
│   │   │   ├── OrderItem.php
│   │   │   ├── Review.php
│   │   │   ├── Coupon.php
│   │   │   ├── LoyaltyPoint.php
│   │   │   ├── LoyaltyTransaction.php
│   │   │   ├── LoyaltyTier.php
│   │   │   ├── Favourite.php
│   │   │   ├── DeliveryEarning.php
│   │   │   ├── DeliveryPartnerRating.php
│   │   │   ├── RestaurantHour.php
│   │   │   ├── OrderStatusHistory.php
│   │   │   ├── PlatformSetting.php
│   │   │   ├── AuditLog.php
│   │   │   ├── PlatformCommission.php
│   │   │   ├── DeliveryPartner.php
│   │   │   └── Notification.php
│   │   ├── Services/
│   │   │   ├── OrderService.php
│   │   │   ├── PaymentService.php
│   │   │   ├── PricingService.php
│   │   │   ├── LoyaltyService.php
│   │   │   ├── EarningsService.php
│   │   │   ├── ImageService.php
│   │   │   └── NotificationService.php
│   │   ├── Policies/
│   │   │   ├── MenuItemPolicy.php
│   │   │   ├── CategoryPolicy.php
│   │   │   ├── OrderPolicy.php
│   │   │   ├── ReviewPolicy.php
│   │   │   └── CouponPolicy.php
│   │   ├── Traits/
│   │   │   ├── HasRestaurantScope.php
│   │   │   └── ApiResponse.php
│   │   ├── Events/
│   │   │   ├── OrderStatusChanged.php
│   │   │   └── NewOrderReceived.php
│   │   ├── Jobs/
│   │   │   ├── SendOrderConfirmationEmail.php
│   │   │   ├── SendOrderStatusEmail.php
│   │   │   └── ExpireLoyaltyPoints.php
│   │   ├── Mail/
│   │   │   ├── OrderConfirmed.php
│   │   │   ├── OrderStatusUpdated.php
│   │   │   ├── RestaurantApproved.php
│   │   │   ├── RestaurantRejected.php
│   │   │   └── WelcomeEmail.php
│   │   └── Observers/
│   │       └── AuditObserver.php
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   │   ├── UserFactory.php
│   │   │   ├── RestaurantFactory.php
│   │   │   ├── MenuItemFactory.php
│   │   │   └── OrderFactory.php
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       ├── LoyaltyTierSeeder.php
│   │       ├── PlatformSettingsSeeder.php
│   │       └── SuperadminSeeder.php
│   └── routes/api.php
└── frontend/                         # React SPA
    ├── src/
    │   ├── app/                      # Redux store setup
    │   ├── assets/                   # SVGs, illustrations
    │   ├── components/               # Shared components
    │   ├── features/                 # Feature-scoped components + slices
    │   │   ├── auth/
    │   │   ├── customer/
    │   │   ├── owner/
    │   │   ├── delivery/
    │   │   ├── admin/
    │   │   └── superadmin/
    │   ├── hooks/                    # Custom React hooks
    │   ├── layouts/                  # Per-role layout wrappers
    │   ├── lib/                      # motion.js, axios.js, utils.js
    │   ├── pages/                    # Route-level pages
    │   └── services/                 # API service modules
    └── vite.config.js
```

---

## Database Schema — Complete

### `users`
```sql
CREATE TABLE users (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,
  phone            VARCHAR(15),
  email_verified_at TIMESTAMP NULL,
  password         VARCHAR(255) NOT NULL,
  role             ENUM('customer','restaurant_owner','delivery_partner','admin','superadmin') NOT NULL DEFAULT 'customer',
  profile_image    VARCHAR(500),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at       TIMESTAMP NULL COMMENT 'Soft delete — Illuminate\Database\Eloquent\SoftDeletes',
  INDEX idx_email (email),
  INDEX idx_role  (role)
);
```

### `restaurants`
```sql
CREATE TABLE restaurants (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(255) NOT NULL UNIQUE,
  description         TEXT,
  address             VARCHAR(500) NOT NULL,
  city                VARCHAR(100) NOT NULL,
  state               VARCHAR(100) NOT NULL,
  pincode             VARCHAR(10) NOT NULL,
  latitude            DECIMAL(10,8),
  longitude           DECIMAL(11,8),
  phone               VARCHAR(15) NOT NULL,
  email               VARCHAR(255) NOT NULL,
  logo                VARCHAR(500),
  cover_image         VARCHAR(500),
  cuisine_types       JSON NOT NULL COMMENT 'e.g. ["Indian","Chinese","Pizza"]',
  opening_time        TIME NOT NULL,
  closing_time        TIME NOT NULL,
  is_open             BOOLEAN NOT NULL DEFAULT TRUE,
  min_order_amount    DECIMAL(8,2) NOT NULL DEFAULT 0,
  delivery_fee        DECIMAL(8,2) NOT NULL DEFAULT 0,
  avg_delivery_time   TINYINT UNSIGNED NOT NULL DEFAULT 30,
  avg_rating          DECIMAL(3,2) NOT NULL DEFAULT 0,
  total_reviews       INT UNSIGNED NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Admin must approve',
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Admin sets — shown on home page',
  rejection_reason    VARCHAR(500) COMMENT 'Set when admin rejects application',
  fssai_number        VARCHAR(50) NOT NULL,
  gst_number          VARCHAR(20),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMP NULL COMMENT 'Soft delete',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_city      (city),
  INDEX idx_slug      (slug),
  FULLTEXT idx_name   (name)
);
```

### `categories`
```sql
CREATE TABLE categories (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(100) NOT NULL,
  image         VARCHAR(500),
  sort_order    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant (restaurant_id)
);
```

### `menu_items`
```sql
CREATE TABLE menu_items (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id     BIGINT UNSIGNED NOT NULL,
  category_id       BIGINT UNSIGNED NOT NULL,
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) NOT NULL,
  description       TEXT,
  price             DECIMAL(8,2) NOT NULL,
  discounted_price  DECIMAL(8,2),
  image             VARCHAR(500),
  is_veg            BOOLEAN NOT NULL DEFAULT TRUE,
  is_available      BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  preparation_time  TINYINT UNSIGNED NOT NULL DEFAULT 15,
  calories          SMALLINT UNSIGNED,
  tags              JSON COMMENT 'e.g. ["bestseller","spicy","new"]',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id)   REFERENCES categories(id)  ON DELETE CASCADE,
  deleted_at        TIMESTAMP NULL COMMENT 'Soft delete — removed items still show in past orders',
  FULLTEXT idx_name (name),
  INDEX idx_restaurant_cat (restaurant_id, category_id)
);
```

### `menu_item_variants`
```sql
CREATE TABLE menu_item_variants (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  menu_item_id BIGINT UNSIGNED NOT NULL,
  name         VARCHAR(100) NOT NULL,
  price        DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);
```

### `addresses`
```sql
CREATE TABLE addresses (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  label         ENUM('Home','Work','Other') NOT NULL DEFAULT 'Home',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100) NOT NULL,
  pincode       VARCHAR(10) NOT NULL,
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `carts`
```sql
CREATE TABLE carts (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

### `cart_items`
```sql
CREATE TABLE cart_items (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id      BIGINT UNSIGNED NOT NULL,
  menu_item_id BIGINT UNSIGNED NOT NULL,
  variant_id   BIGINT UNSIGNED,
  quantity     TINYINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price   DECIMAL(8,2) NOT NULL COMMENT 'Snapshot at time of add',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id)      REFERENCES carts(id)              ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)         ON DELETE CASCADE,
  FOREIGN KEY (variant_id)   REFERENCES menu_item_variants(id) ON DELETE SET NULL
);
```

### `orders`
```sql
CREATE TABLE orders (
  id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number         VARCHAR(25) NOT NULL UNIQUE,
  user_id              BIGINT UNSIGNED NOT NULL,
  restaurant_id        BIGINT UNSIGNED NOT NULL,
  delivery_partner_id  BIGINT UNSIGNED,
  delivery_address_id  BIGINT UNSIGNED NOT NULL,
  status               ENUM('pending','confirmed','preparing','ready_for_pickup',
                            'picked_up','on_the_way','delivered','cancelled') NOT NULL DEFAULT 'pending',
  payment_status       ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  payment_method         ENUM('cod','razorpay') NOT NULL,
  razorpay_order_id      VARCHAR(255) COMMENT 'Razorpay order ID created before checkout',
  razorpay_payment_id    VARCHAR(255) COMMENT 'Razorpay payment ID returned after success',
  razorpay_signature     VARCHAR(512) COMMENT 'HMAC signature verified server-side',
  subtotal             DECIMAL(10,2) NOT NULL,
  delivery_fee         DECIMAL(8,2) NOT NULL,
  discount_amount      DECIMAL(8,2) NOT NULL DEFAULT 0,
  tax_amount           DECIMAL(8,2) NOT NULL,
  total_amount         DECIMAL(10,2) NOT NULL,
  coupon_code              VARCHAR(50),
  loyalty_points_redeemed  INT UNSIGNED NOT NULL DEFAULT 0,
  loyalty_discount_amount  DECIMAL(8,2) NOT NULL DEFAULT 0,
  special_instructions TEXT,
  estimated_delivery_at TIMESTAMP,
  delivered_at         TIMESTAMP,
  cancelled_at         TIMESTAMP,
  cancel_reason        VARCHAR(255),
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)             REFERENCES users(id)             ON DELETE RESTRICT,
  FOREIGN KEY (restaurant_id)       REFERENCES restaurants(id)       ON DELETE RESTRICT,
  FOREIGN KEY (delivery_partner_id) REFERENCES users(id)             ON DELETE SET NULL,
  FOREIGN KEY (delivery_address_id) REFERENCES addresses(id)         ON DELETE RESTRICT,
  INDEX idx_user       (user_id),
  INDEX idx_restaurant (restaurant_id),
  INDEX idx_status     (status),
  INDEX idx_delivery   (delivery_partner_id)
);
```

### `order_items`
```sql
CREATE TABLE order_items (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id       BIGINT UNSIGNED NOT NULL,
  menu_item_id   BIGINT UNSIGNED NOT NULL,
  menu_item_name VARCHAR(255) NOT NULL COMMENT 'Snapshot — item may be deleted later',
  variant_name   VARCHAR(100) COMMENT 'Snapshot',
  quantity       TINYINT UNSIGNED NOT NULL,
  unit_price     DECIMAL(8,2) NOT NULL,
  total_price    DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (order_id)     REFERENCES orders(id)     ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);
```

### `order_status_history`
```sql
CREATE TABLE order_status_history (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id   BIGINT UNSIGNED NOT NULL,
  status     ENUM('pending','confirmed','preparing','ready_for_pickup',
                  'picked_up','on_the_way','delivered','cancelled') NOT NULL,
  changed_by BIGINT UNSIGNED COMMENT 'user_id who triggered the change',
  note       VARCHAR(255) COMMENT 'e.g. reject reason, cancel reason',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)  ON DELETE SET NULL,
  INDEX idx_order (order_id)
);
-- Every status change appends a row here — order tracking timeline reads from this table
```

### `delivery_partners`
```sql
CREATE TABLE delivery_partners (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL UNIQUE,
  vehicle_type      ENUM('bicycle','motorcycle','scooter') NOT NULL,
  vehicle_number    VARCHAR(20) NOT NULL,
  licence_number    VARCHAR(30) NOT NULL,
  current_latitude  DECIMAL(10,8),
  current_longitude DECIMAL(11,8),
  is_available      BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  total_deliveries  INT UNSIGNED NOT NULL DEFAULT 0,
  avg_rating        DECIMAL(3,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `reviews`
```sql
CREATE TABLE reviews (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      BIGINT UNSIGNED NOT NULL UNIQUE,
  user_id       BIGINT UNSIGNED NOT NULL,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  rating        TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  images        JSON,
  owner_reply   TEXT,
  owner_replied_at TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)     REFERENCES orders(id)      ON DELETE CASCADE,
  FOREIGN KEY (user_id)      REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

### `delivery_partner_ratings`
```sql
CREATE TABLE delivery_partner_ratings (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id            BIGINT UNSIGNED NOT NULL UNIQUE,  -- one rating per order
  user_id             BIGINT UNSIGNED NOT NULL,
  delivery_partner_id BIGINT UNSIGNED NOT NULL,         -- FK to delivery_partners.id
  rating              TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment             TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)            REFERENCES orders(id)            ON DELETE CASCADE,
  FOREIGN KEY (user_id)             REFERENCES users(id)             ON DELETE CASCADE,
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE
);
-- After insert, UPDATE delivery_partners SET avg_rating = (SELECT AVG(rating) FROM delivery_partner_ratings WHERE delivery_partner_id = NEW.delivery_partner_id) WHERE id = NEW.delivery_partner_id;
-- Implemented as a DB trigger or as an Observer on DeliveryPartnerRating model.
```

### `coupons`
```sql
CREATE TABLE coupons (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(50) NOT NULL UNIQUE,
  title            VARCHAR(100) NOT NULL,
  description      TEXT,
  type             ENUM('percentage','fixed') NOT NULL,
  value            DECIMAL(8,2) NOT NULL,
  min_order_amount DECIMAL(8,2) NOT NULL DEFAULT 0,
  max_discount     DECIMAL(8,2) COMMENT 'Cap for percentage coupons',
  usage_limit      INT UNSIGNED COMMENT 'NULL = unlimited',
  per_user_limit   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  used_count       INT UNSIGNED NOT NULL DEFAULT 0,
  valid_from       TIMESTAMP NOT NULL,
  valid_until      TIMESTAMP NOT NULL,
  restaurant_id    BIGINT UNSIGNED COMMENT 'NULL = platform-wide',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

### `coupon_usages`
```sql
CREATE TABLE coupon_usages (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id  BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  order_id   BIGINT UNSIGNED NOT NULL,
  used_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (order_id)  REFERENCES orders(id)  ON DELETE CASCADE,
  UNIQUE KEY unique_coupon_user_order (coupon_id, user_id, order_id)
);
```

### `loyalty_tiers`
```sql
CREATE TABLE loyalty_tiers (
  id                 TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(50) NOT NULL COMMENT 'Bronze|Silver|Gold|Platinum',
  min_lifetime_points INT UNSIGNED NOT NULL,
  points_multiplier  DECIMAL(3,2) NOT NULL DEFAULT 1.00 COMMENT '1x, 1.25x, 1.5x, 2x',
  free_delivery      BOOLEAN NOT NULL DEFAULT FALSE,
  free_delivery_min  DECIMAL(8,2) COMMENT 'NULL = always free; value = min order for free delivery',
  badge_color        VARCHAR(7) NOT NULL COMMENT 'hex color e.g. #CD7F32',
  perks              JSON COMMENT 'Array of perk description strings',
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed data (run in seeder, not migration)
-- INSERT INTO loyalty_tiers VALUES
-- (1, 'Bronze',   0,     1.00, FALSE, NULL,   '#CD7F32', '["1x points on every order"]'),
-- (2, 'Silver',   1000,  1.25, TRUE,  300.00, '#C0C0C0', '["1.25x points","Free delivery on orders over ₹300"]'),
-- (3, 'Gold',     5000,  1.50, TRUE,  NULL,   '#FFD700', '["1.5x points","Free delivery always","Priority support"]'),
-- (4, 'Platinum', 10000, 2.00, TRUE,  NULL,   '#E5E4E2', '["2x points","Free delivery always","Exclusive offers","Birthday bonus 500 pts"]');
```

### `loyalty_points`
```sql
CREATE TABLE loyalty_points (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT UNSIGNED NOT NULL UNIQUE,
  balance          INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Redeemable points currently held',
  lifetime_earned  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total ever earned — used for tier calculation',
  tier_id              TINYINT UNSIGNED NOT NULL DEFAULT 1,
  tier_updated_at      TIMESTAMP,
  tier_manually_set    BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'When TRUE auto-recalculation skips this user',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)         ON DELETE CASCADE,
  FOREIGN KEY (tier_id)  REFERENCES loyalty_tiers(id) ON UPDATE CASCADE
);
```

### `loyalty_transactions`
```sql
CREATE TABLE loyalty_transactions (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  order_id     BIGINT UNSIGNED COMMENT 'NULL for manual/bonus transactions',
  type         ENUM('earned','redeemed','expired','bonus','adjusted') NOT NULL,
  points       INT NOT NULL COMMENT 'Positive = credit, negative = debit',
  balance_after INT UNSIGNED NOT NULL COMMENT 'Snapshot of balance after this transaction',
  description  VARCHAR(255) NOT NULL COMMENT 'Human-readable e.g. "Earned on order #ORD-001"',
  expires_at   TIMESTAMP COMMENT 'For earned points — 12 months from credit date',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id)  ON DELETE SET NULL,
  INDEX idx_user     (user_id),
  INDEX idx_type     (type),
  INDEX idx_expires  (expires_at)
);
```

### `favourites`
```sql
CREATE TABLE favourites (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_fav (user_id, restaurant_id)
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT NOT NULL,
  type       VARCHAR(50) NOT NULL COMMENT 'order_update|promo|system|review_reply',
  data       JSON,
  read_at    TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, read_at)
);
```

---

## Role 1 — Customer Panel

### Routes
```
/                          Home (hero, featured restaurants, cuisines)
/restaurants               Browse + filter restaurants
/restaurants/:slug         Restaurant detail + full menu
/search                    Search results (restaurants + dishes)
/cart                      Cart review
/checkout                  Checkout (address + payment)
/orders                    Order history
/orders/:id                Order detail + live status tracking
/profile                   Account info + preferences
/profile/addresses         Saved addresses CRUD
/profile/loyalty           Points balance, tier, transaction history
/profile/favourites        Saved restaurants
/notifications             All notifications
/auth/login                Login
/auth/register             Registration
/auth/forgot-password      Password reset request
/auth/reset-password       Password reset form
```

### Features — Customer

#### Home Page
- Location selector (city dropdown or browser geolocation)
- Hero search bar: search by restaurant name or dish
- Cuisine quick-filter carousel: Indian, Chinese, Pizza, Burgers, Biryani, Desserts, etc.
- Featured restaurants grid (is_featured flag from admin)
- Offers section: active coupons displayed as visual cards
- "Order Again" section: last 3 restaurants ordered from (authenticated users)

#### Restaurant Browsing
- Grid of restaurant cards showing: logo, cover, name, cuisine types, avg_rating (with star fill), avg_delivery_time, delivery_fee, min_order_amount, open/closed badge
- Veg-only toggle filter
- Sort by: Relevance | Rating | Delivery Time | Price Low-High
- Filter by: Cuisine type | Rating ≥ 4 | Fast Delivery (≤ 30 min) | Free Delivery | Under ₹100 delivery
- Infinite scroll pagination (15 per load)
- Sticky filter bar on scroll

#### Restaurant Detail + Menu
- Full-bleed cover image header with logo overlay
- Sticky info bar: name, rating, timing, delivery fee, min order
- Category sidebar (desktop) / horizontal scroll tabs (mobile) — smooth scroll to section
- Menu item cards: image, name, description, price, discounted price (strikethrough), veg/non-veg dot badge, add/remove stepper
- Variant selector modal for items with variants
- Bestseller / New / Spicy tags on items
- Search within menu (client-side filter)
- Item availability badge when is_available = false

#### Cart
- Slide-in drawer on desktop, full-screen on mobile
- Item list with quantity steppers
- Remove item with slide-to-delete gesture on mobile
- Coupon code input with real API validation
- Pricing breakdown: subtotal, delivery fee, discount, GST (5%), total
- Restaurant switch warning modal if cart belongs to different restaurant
- Persist to localStorage + sync to server cart

#### Checkout
- Saved address list with labels (Home/Work/Other), ability to add new address
- Google Maps or OpenStreetMap iframe showing delivery pin
- Payment method selection: **Razorpay** (card, UPI, netbanking, wallet — all inside Razorpay modal) or **Cash on Delivery**
- Razorpay: one button "Pay with Razorpay" → opens Razorpay checkout modal (loaded from Razorpay CDN) — customer selects their preferred sub-method inside the modal
- COD: no gateway call — order placed directly, `payment_status = pending` until delivery
- Order summary sidebar (sticky on desktop)
- Place order → POST /api/orders → redirect to tracking page

#### Order Tracking
- Status timeline: Pending → Confirmed → Preparing → Ready → Picked Up → On the Way → Delivered
- Each step shows timestamp when reached
- Estimated delivery countdown timer
- Delivery partner info card (name, vehicle, rating) when assigned
- Cancel button (only in Pending/Confirmed status)
- Rate & Review button after Delivered status

#### Profile
- Edit name, phone, profile image
- Change password (current + new)
- Address book: add/edit/delete/set-default
- Order history with reorder button

#### Loyalty Points (`/profile/loyalty`)
- **Points summary card**: current balance (large number), lifetime earned, current tier badge with color
- **Tier progress bar**: points earned toward next tier with exact points remaining label
- **Tiers overview**: Bronze → Silver → Gold → Platinum, each showing multiplier and perks
- **Transaction history**: paginated list — date, description (e.g. "Earned on #ORD-20260817-0001"), points change (green +/red −), running balance
- **Expiry warning**: banner if any points expire within 30 days with exact date and count

#### Loyalty at Checkout
- Points available to redeem shown below payment methods
- Toggle: "Use X points — save ₹Y" — value calculated using `loyalty_redeem_rate` fetched from `/api/loyalty/tiers` on page load
- Redemption cap: enforced by `loyalty_max_redeem_pct` — UI shows max saveable amount based on current subtotal; both values set by admin
- Cannot combine with coupon code (mutually exclusive, UI enforces with clear message)
- After toggle applied, total updates in real time in order summary

#### Loyalty on Restaurant & Order Cards
- "Earn X pts on this order" chip on restaurant cards — estimated from `restaurant.min_order_amount` ÷ `loyalty_earn_rate` (setting fetched once on app load, cached in Redux)
- After order placed: confirmation toast shows exact points about to be earned
- Points credited only after `delivered` status (not on pending/preparing)
- Order detail page shows: "X points earned" (green badge) or "Pending — earned on delivery"

---

## Role 2 — Restaurant Owner Panel

### Routes
```
/owner/dashboard           Overview stats + recent orders
/owner/orders              Incoming orders live feed
/owner/orders/:id          Order detail + status controls
/owner/menu                Menu overview by category
/owner/menu/categories     Category CRUD
/owner/menu/items          All items with search/filter
/owner/menu/items/new      Add new item
/owner/menu/items/:id/edit Edit item
/owner/restaurant          Restaurant profile settings
/owner/restaurant/hours    Opening hours management
/owner/reviews             All reviews + reply interface
/owner/coupons             Own restaurant coupon management
/owner/revenue             Revenue reports + charts
/owner/notifications       Owner-specific notifications
```

### Features — Owner

#### Dashboard
- Stat cards: Today's Orders, Today's Revenue, Pending Orders, Avg Rating
- Live order feed: real-time incoming orders (Laravel Reverb WebSocket or polling)
- Weekly revenue bar chart (Chart.js or Recharts — real data from orders table)
- Top 5 selling items by quantity (this week)
- Restaurant open/closed toggle switch (patches is_open)

#### Order Management
- Tabs: New | Preparing | Ready | All
- Each order card: order number, customer name, items summary, total, time elapsed, action buttons
- Actions per status:
  - Pending → Accept | Reject (with reason)
  - Confirmed → Mark Preparing
  - Preparing → Mark Ready for Pickup
- Sound alert for new orders (browser Notification API)
- Print receipt button (window.print() with receipt layout)

#### Menu Management
- Category list with drag-to-reorder (sort_order field)
- Add/edit/delete categories
- Item table: image thumbnail, name, category, price, veg badge, availability toggle, featured toggle, edit/delete actions
- Image upload: accepts JPG/PNG/WebP, max 2MB, stored in Laravel storage
- Item form: all fields required/optional per schema — name, description, category, price, discounted_price, is_veg, preparation_time, calories, tags, variants

#### Restaurant Settings
- Edit: name, description, address, phone, email, cuisines
- Upload logo and cover image
- Set min_order_amount, delivery_fee, avg_delivery_time
- Set opening/closing time
- Update FSSAI number, GST number

#### Review Management
- All reviews listed with customer name, rating stars, comment, order info
- Reply text area per review (PATCH /api/reviews/:id/reply)
- Filter by: rating, replied/unreplied

#### Revenue Reports
- Date range picker (today / this week / this month / custom)
- Total revenue, total orders, average order value, top items
- Line chart: daily revenue over selected period
- Revenue breakdown table by day
- CSV export button (generate from API)

#### Owner Coupon Management
- Create restaurant-specific coupons
- Form: code, title, type (percentage/fixed), value, min_order_amount, max_discount, valid_from, valid_until, usage_limit, per_user_limit
- Toggle active/inactive
- Usage stats per coupon

---

## Role 3 — Delivery Partner Panel

### Routes
```
/delivery/dashboard         Partner home: availability toggle + active order
/delivery/orders            Available orders to accept
/delivery/orders/:id        Active delivery detail + status controls
/delivery/history           Past deliveries + earnings
/delivery/earnings          Earnings breakdown by period
/delivery/profile           Personal info + vehicle details
```

### Features — Delivery Partner

#### Dashboard
- Availability toggle (is_available in delivery_partners table) — green when ON
- Active order card (if currently assigned): restaurant name + address, customer address, items count, order amount
- Today's stats: deliveries completed, earnings, avg delivery time

#### Order Acceptance
- List of ready_for_pickup orders near partner's last known location
- Each card: restaurant name, pickup address, delivery address, estimated distance, delivery fee share
- Accept button → order assigned (delivery_partner_id set)

#### Active Delivery Flow
- Full-screen delivery card
- Step buttons: Reached Restaurant → Picked Up → Reached Customer → Delivered
- Each step fires PATCH /api/delivery/orders/:id/status → triggers broadcast to customer
- Customer info: name, phone (masked), delivery address
- Restaurant address with map link
- Special instructions from order

#### Earnings
- Daily/Weekly/Monthly earnings total
- Per-delivery breakdown table: date, order number, restaurant, customer area, amount earned
- Pending payout vs paid breakdown

#### Partner Profile
- Edit name, phone
- Vehicle type, vehicle number, licence number
- Upload profile image

---

## Role 4 — Admin Panel

### Routes
```
/admin/dashboard            Platform overview stats
/admin/users                All users with role filter
/admin/users/:id            User detail + actions
/admin/restaurants          All restaurants: pending/active/suspended
/admin/restaurants/:id      Restaurant detail + approval controls
/admin/orders               Platform-wide order list
/admin/orders/:id           Order detail with full timeline
/admin/delivery-partners    All delivery partners
/admin/coupons              Platform-wide coupon management
/admin/revenue              Platform revenue reports
/admin/notifications        Broadcast notification sender
/admin/loyalty              Loyalty config, tier management, bonus grants
/admin/settings             Platform settings (tax rate, delivery config)
```

### Features — Admin

#### Dashboard
- Stat cards: Total Users, Total Restaurants (active/pending), Today's Orders, Today's Revenue, Active Delivery Partners
- 30-day revenue area chart
- Recent restaurant approval requests
- Recent support flags / cancelled orders
- Platform health: order success rate %, avg delivery time

#### User Management
- Table: name, email, phone, role, joined date, status
- Filter by role, status
- Actions: activate/deactivate, change role, view orders, reset password email
- Search by name or email

#### Restaurant Management
- Tabs: Pending Approval | Active | Suspended
- Pending: restaurant detail preview, FSSAI number, owner info, Approve / Reject buttons
- Active: view, suspend, edit delivery fee cap
- Rejected: view reason, allow reapplication

#### Order Management
- All orders across platform
- Filter by: status, date range, restaurant, payment method
- Order detail: full timeline, customer info, restaurant info, delivery partner, payment transaction ID
- Refund initiation via PaymentService

#### Delivery Partner Management
- Table: name, vehicle, verified status, total deliveries, avg rating
- Verify / Suspend actions
- View earnings history

#### Platform Coupon Management
- Create global coupons (restaurant_id = NULL)
- Full CRUD, same fields as owner coupon form
- Usage analytics per coupon

#### Revenue Reports
- Platform total revenue (sum of all order totals)
- Revenue by restaurant (leaderboard)
- Revenue by city
- Date-range line chart
- CSV export

#### Loyalty Management (`/admin/loyalty`)

**Tab 1 — Program Config**
Every rule the loyalty system enforces is set here. Saved to `platform_settings` table. Takes effect immediately on next request — no redeploy needed.

| Setting | Key | What it controls |
|---|---|---|
| Earn Rate (₹ per point) | `loyalty_earn_rate` | How many ₹ a customer must spend to earn 1 point |
| Redeem Rate (₹ per point) | `loyalty_redeem_rate` | Monetary value of 1 point when redeeming |
| Minimum Points to Redeem | `loyalty_min_redeem` | Smallest balance allowed for redemption at checkout |
| Max Redemption per Order (%) | `loyalty_max_redeem_pct` | Ceiling on how much of subtotal can be paid with points |
| Points Expiry (months) | `loyalty_expiry_months` | Months from earning date before points expire (0 = never) |
| Enable Loyalty System | `loyalty_enabled` | Global on/off toggle — disables earning, redemption, and display sitewide |

**Tab 2 — Tier Editor**
Full CRUD for all tiers. Changes apply immediately to all users (tier recalculation runs on next order delivery or via on-demand recalculate-all button).

Each tier row is editable:
- Name (text)
- Min Lifetime Points threshold (integer) — when user's `lifetime_earned` crosses this, tier upgrades
- Points Multiplier (decimal, e.g. 1.50 = 1.5×) — multiplied against base earn rate
- Free Delivery toggle
- Free Delivery Minimum Order (₹) — 0 or blank = always free when toggle is on
- Perks (multi-line text list — displayed on loyalty profile page and tier overview)
- Badge Color (color picker → hex stored)

Order of tiers is determined by `min_lifetime_points` ascending. Admin can add new tiers or delete existing ones (with confirmation that affected users will be recalculated).

**Tab 3 — Platform Stats**
- Total active points in circulation (sum of all `loyalty_points.balance`)
- Total points ever issued (sum of all earned transactions)
- Total points redeemed (sum of all redeemed transactions)
- Total points expired (sum of all expired transactions)
- Estimated liability (balance × `loyalty_redeem_rate` = ₹ owed to customers)
- Points issued this month vs last month (trend)
- Users per tier (count breakdown)

**Tab 4 — User Lookup & Adjustments**
- Search customer by name or email
- View: current balance, tier, lifetime earned, points expiring within 30 days
- Full transaction log for that user (paginated)
- **Grant Bonus**: enter points amount + description → creates `loyalty_transactions` row (type=`bonus`), optional custom expiry date
- **Deduct Points**: enter points amount + reason → creates `loyalty_transactions` row (type=`adjusted`, negative), cannot go below 0
- **Manual Tier Override**: force a user to a specific tier (sets tier_id directly, flagged with `manually_overridden = true` so auto-recalculation skips them)

**Tab 5 — Leaderboard**
- Top 50 customers by `lifetime_earned` points
- Columns: rank, name, email, tier badge, lifetime earned, current balance
- Export to CSV button

#### Notification Broadcaster
- Send push notification to:
  - All users
  - All customers
  - All owners
  - All delivery partners
  - Single user by email/ID
- Form: title, body, type, optional deep-link data (JSON)
- Stored in notifications table

#### Platform Settings
- GST/tax rate (stored in config or settings table)
- Platform delivery fee override capability
- Maintenance mode toggle

---

## Role 5 — Superadmin Panel

> The platform owner. Has every admin capability plus exclusive control over: admin accounts, per-restaurant commission rates, audit logs, user impersonation, financial P&L, feature flags, and gateway/SMTP credentials. Only a superadmin can create other superadmins or admins.

### Routes
```
/superadmin/dashboard          Platform P&L + health overview
/superadmin/admins             Admin account management
/superadmin/commissions        Per-restaurant commission rates
/superadmin/audit-logs         Full audit trail of all admin actions
/superadmin/financials         Gross revenue, commission earned, net P&L
/superadmin/feature-flags      Enable/disable platform features
/superadmin/impersonate        User impersonation tool
/superadmin/settings           Gateway credentials, SMTP, SMS provider config
```

### Features — Superadmin

#### Dashboard
- Platform P&L card: Gross Order Value (all orders), Total Commission Earned (sum of commission_pct × subtotal per order), Net Revenue
- Active admins count, restaurants count by status, total users
- 30-day commission revenue chart (separate from total order revenue)
- Recent audit log entries (last 10 actions by admins)
- Feature flags quick-toggle panel

#### Admin Account Management
- Table: name, email, created date, last login, active status
- Create admin: name, email, password — role set to `admin` automatically
- Deactivate/reactivate admin (soft disable — they cannot log in but records preserved)
- Delete admin (only if no audit log entries — otherwise deactivate only)
- Superadmin cannot delete themselves

#### Commission Management
- Default rate card: shows `platform_settings['default_commission_pct']` — editable
- Per-restaurant overrides table: restaurant name, custom rate %, effective from date, notes, set-by
- Set custom rate for any restaurant: rate %, effective date, reason note
- Reset restaurant to default rate (deletes `platform_commissions` row)
- Commission impact preview: at X% rate, restaurant Y earned ₹Z last month → platform earned ₹W
- Commission is calculated on `orders.subtotal` (excluding delivery fee and tax) at order delivery time

#### Audit Logs
- Full tamper-evident log of every action performed by any `admin` or `superadmin`
- Columns: timestamp, actor name + role, action, affected record (type + ID), old value (JSON), new value (JSON), IP address
- Filter by: actor, action type, date range, target model
- Export to CSV
- Cannot be deleted by anyone — append-only table

#### Financials (P&L)
- **Gross Order Volume**: total `orders.total_amount` across all delivered orders
- **Platform Commission Earned**: sum of `(subtotal × commission_rate)` per delivered order
- **Delivery Fee Revenue**: if platform collects delivery fees (configurable)
- **Refunds Issued**: total refunded amounts
- **Net Platform Revenue**: commission + delivery fees − refunds
- Date range selector, breakdown by month
- Per-restaurant commission table: restaurant name, GMV, commission rate, commission earned
- Export to CSV / PDF

#### Feature Flags
Each flag stored as a `platform_settings` key with `cast = boolean`. Superadmin toggles on/off with immediate effect:

| Flag Key | What it controls |
|---|---|
| `loyalty_enabled` | Entire loyalty points system |
| `reviews_enabled` | Customer review submission |
| `coupons_enabled` | Coupon code redemption at checkout |
| `delivery_partner_enabled` | Delivery partner role and assignment |
| `registration_enabled` | New customer registrations open/closed |
| `restaurant_registration_enabled` | New restaurant applications open/closed |
| `maintenance_mode` | Puts frontend in read-only maintenance banner |

#### User Impersonation
- Search any user by email
- Click "Impersonate" → server generates a short-lived impersonation token (15 min TTL, stored in `personal_access_tokens` with `impersonated_by` metadata)
- Frontend receives token, loads that user's session — header banner: "Impersonating [name] — Exit"
- Every action taken while impersonating is written to `audit_logs` with both the superadmin's ID and the impersonated user's ID
- `POST /api/superadmin/impersonate/stop` revokes token and restores superadmin session

#### Platform Settings (Superadmin-Only Keys)
Admin-accessible settings (loyalty rates, tax) are in Tab 1 of `/admin/loyalty` and `/admin/settings`. Superadmin settings are a separate group — credentials that must never be visible to operational admins:

| Setting Key | What it configures |
|---|---|
| `razorpay_key_id` | Razorpay Key ID — public, returned in `/payment/initiate` response |
| `razorpay_key_secret` | Razorpay Key Secret — encrypted at rest, used only in `PaymentService` |
| `razorpay_webhook_secret` | Razorpay webhook secret — used to verify `X-Razorpay-Signature` header |
| `default_commission_pct` | Platform-wide default commission rate |
| `tax_rate_pct` | GST/VAT rate applied to all orders |
| `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass` | Transactional email provider |
| `sms_provider`, `sms_api_key` | SMS OTP provider credentials |

Sensitive keys (`razorpay_key_secret`, `razorpay_webhook_secret`, `smtp_pass`, `sms_api_key`) are encrypted using Laravel's `encrypt()` before DB storage and decrypted only inside service classes — never returned in API responses. `razorpay_key_id` is public and safe to expose to the frontend.

---

## Multi-Tenancy Architecture

This application uses a **shared database, shared schema** multi-tenancy model. The platform is the landlord; each restaurant owner is a tenant. Every tenant's data lives in the same tables, isolated at the query level — the same pattern used by Swiggy, Zomato, and Uber Eats.

### Tenancy Model
- **One owner → one restaurant** (enforced by DB unique constraint and middleware)
- Tenant identity = `restaurants.id` resolved from `auth()->user()->restaurant->id`
- Admin sees all tenants; owner sees only their own restaurant's data
- Customer sees only public data (listings, menus); no cross-tenant risk

---

### Middleware Stack

#### `EnsureRole.php`
Checks `users.role` against the required roles for the route group. Rejects with 403 if not matched. Superadmin implicitly passes every role check — they have full access everywhere.

```php
// app/Http/Middleware/EnsureRole.php
public function handle(Request $request, Closure $next, string ...$roles): Response
{
    $user = $request->user();

    // Superadmin passes all role checks
    if ($user?->role === 'superadmin') {
        return $next($request);
    }

    if (!in_array($user?->role, $roles)) {
        abort(403, 'Unauthorized.');
    }

    return $next($request);
}
```

#### `CheckRestaurantOwner.php` — Tenant Resolver
Resolves the authenticated owner's restaurant and binds it to the request. Every owner route runs through this. Prevents an owner from accessing a restaurant they don't own.

```php
// app/Http/Middleware/CheckRestaurantOwner.php
public function handle(Request $request, Closure $next): Response
{
    $restaurant = Restaurant::where('user_id', $request->user()->id)->first();

    if (!$restaurant) {
        abort(403, 'No restaurant found for this account. Register your restaurant first.');
    }

    // Bind to request so all controllers access via $request->restaurant
    $request->merge(['restaurant' => $restaurant]);
    app()->instance('currentRestaurant', $restaurant);

    return $next($request);
}
```

All owner routes are wrapped:
```php
Route::middleware(['auth:sanctum', 'role:restaurant_owner', 'check.restaurant.owner'])
     ->prefix('owner')->group(...)
```

---

### Global Query Scopes — Tenant Isolation

Every model that belongs to a restaurant applies a `RestaurantScope` automatically so no controller can accidentally query another tenant's data.

#### `HasRestaurantScope` trait (shared by tenant-scoped models)

```php
// app/Traits/HasRestaurantScope.php
trait HasRestaurantScope
{
    public static function bootHasRestaurantScope(): void
    {
        // Applied automatically on all queries from owner routes
        if (app()->has('currentRestaurant')) {
            static::addGlobalScope('restaurant', function (Builder $builder) {
                $builder->where(
                    (new static)->getTable() . '.restaurant_id',
                    app('currentRestaurant')->id
                );
            });
        }
    }
}
```

#### Models that use this trait
```php
class Category    extends Model { use HasRestaurantScope; }
class MenuItem    extends Model { use HasRestaurantScope; }
class Order       extends Model { use HasRestaurantScope; } // owner-side queries only
class Review      extends Model { use HasRestaurantScope; }
class Coupon      extends Model { use HasRestaurantScope; }
```

Customer-side controllers query these models **without** the scope active (no `currentRestaurant` bound), so they see all restaurants normally.

---

### Laravel Policies — Authorization Layer

Policies are the second line of defence: even if a route isn't covered by the global scope, an explicit policy check blocks the access.

```
app/Policies/
├── MenuItemPolicy.php
├── CategoryPolicy.php
├── OrderPolicy.php
├── ReviewPolicy.php
└── CouponPolicy.php
```

```php
// app/Policies/MenuItemPolicy.php
public function view(User $user, MenuItem $item): bool
{
    return $user->restaurant?->id === $item->restaurant_id;
}

public function update(User $user, MenuItem $item): bool
{
    return $user->restaurant?->id === $item->restaurant_id;
}

public function delete(User $user, MenuItem $item): bool
{
    return $user->restaurant?->id === $item->restaurant_id;
}
```

Usage in controllers:
```php
// MenuItemController.php (owner)
public function update(Request $request, MenuItem $item): JsonResponse
{
    $this->authorize('update', $item);  // throws 403 if different restaurant

    $validated = $request->validate([
        'name'        => 'sometimes|string|max:120',
        'description' => 'sometimes|string|max:500',
        'price'       => 'sometimes|numeric|min:0',
        'category_id' => 'sometimes|exists:categories,id',
        'is_veg'      => 'sometimes|boolean',
        'is_available'=> 'sometimes|boolean',
        'image'       => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
        $validated['image_path'] = app(ImageService::class)->storeWebP(
            $request->file('image'), 'menu-items'
        );
    }

    $item->update($validated);

    return $this->success($item->load('variants'), 'Menu item updated.');
}
```

Register all policies in `AuthServiceProvider`:
```php
protected $policies = [
    MenuItem::class => MenuItemPolicy::class,
    Category::class => CategoryPolicy::class,
    Order::class    => OrderPolicy::class,
    Review::class   => ReviewPolicy::class,
    Coupon::class   => CouponPolicy::class,
];
```

---

### One-Owner-One-Restaurant Enforcement

```sql
-- Enforced at DB level (in migration)
ALTER TABLE restaurants ADD UNIQUE KEY unique_owner (user_id);
```

```php
// RestaurantManageController::store()
public function store(Request $request): JsonResponse
{
    if (Restaurant::where('user_id', $request->user()->id)->exists()) {
        return response()->json(['message' => 'You already have a registered restaurant.'], 422);
    }

    $validated = $request->validate([
        'name'             => 'required|string|max:120',
        'description'      => 'nullable|string|max:1000',
        'address'          => 'required|string|max:255',
        'city'             => 'required|string|max:80',
        'latitude'         => 'required|numeric|between:-90,90',
        'longitude'        => 'required|numeric|between:-180,180',
        'phone'            => 'required|string|max:15',
        'cuisine_type'     => 'required|string|max:100',
        'opening_time'     => 'required|date_format:H:i',
        'closing_time'     => 'required|date_format:H:i',
        'delivery_radius'  => 'required|numeric|min:1|max:50',
        'min_order_amount' => 'required|numeric|min:0',
        'delivery_fee'     => 'required|numeric|min:0',
        'logo'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    if ($request->hasFile('logo')) {
        $validated['logo_path'] = app(ImageService::class)->storeWebP(
            $request->file('logo'), 'restaurants/logos'
        );
    }

    $restaurant = Restaurant::create([
        ...$validated,
        'user_id'    => $request->user()->id,
        'status'     => 'pending',
        'is_active'  => false,
        'is_featured'=> false,
    ]);

    // Elevate role from customer → restaurant_owner
    $request->user()->update(['role' => 'restaurant_owner']);

    return $this->success($restaurant, 'Restaurant submitted for approval.', 201);
}
```

---

### Frontend Tenant Context

The owner dashboard reads the restaurant context from the authenticated user's profile response. `GET /api/auth/me` returns:

```json
{
  "id": 5,
  "name": "Ravi Kumar",
  "role": "restaurant_owner",
  "restaurant": {
    "id": 12,
    "name": "Spice Garden",
    "slug": "spice-garden",
    "is_open": true,
    "is_active": true,
    "is_verified": false
  }
}
```

This is stored in `authSlice.user.restaurant`. All owner API calls use no restaurant ID in the URL — the server resolves it from the auth token via `CheckRestaurantOwner` middleware. No tenant ID is ever passed from the frontend — it cannot be spoofed.

```js
// Owner API calls — no restaurant ID in URL, scoped server-side
GET  /api/owner/orders          // returns only this owner's orders
GET  /api/owner/menu-items      // returns only this owner's items
```

---

### Cross-Tenant Leak Prevention Checklist

| Risk | Prevention |
|---|---|
| Owner queries another restaurant's orders | `HasRestaurantScope` + `OrderPolicy` |
| Owner edits another restaurant's menu item | `MenuItemPolicy::update()` + policy check in controller |
| Owner reads another restaurant's revenue | `RevenueController` scopes all aggregates to `currentRestaurant->id` |
| URL manipulation (`/api/owner/menu-items/999`) | Route model binding resolves item → policy check fails if restaurant mismatch |
| Admin API accessed by owner | `role:admin,superadmin` middleware on all `/admin/*` routes |
| Admin accessing superadmin routes | `role:superadmin` middleware on all `/superadmin/*` routes — `EnsureRole` does NOT grant admin superadmin access |
| Admin creating another admin | No route exists in `/admin/*` group — only `/superadmin/admins` allows this |
| Impersonation without audit trail | `ImpersonationController` writes to `audit_logs` before issuing token — no bypass |
| Customer accessing owner routes | `role:restaurant_owner` middleware on all `/owner/*` routes |
| Delivery partner accessing customer cart | `role:delivery_partner` middleware — no cart routes in that group |
| Unauthenticated access to protected routes | `auth:sanctum` on all non-public routes |

---

### Audit Log — Auto-recording

Every mutating action by an `admin` or `superadmin` is written to `audit_logs` automatically via a Laravel observer registered on the relevant models, plus explicit log calls in controllers for actions that don't map to a single model change.

```php
// app/Observers/AuditObserver.php
// Registered for: Restaurant, User, Coupon, MenuItem, LoyaltyTier, PlatformCommission
public function updated(Model $model): void
{
    if (!in_array(auth()->user()?->role, ['admin', 'superadmin'])) return;

    AuditLog::create([
        'user_id'      => auth()->id(),
        'user_role'    => auth()->user()->role,
        'action'       => class_basename($model) . '.updated',
        'target_type'  => get_class($model),
        'target_id'    => $model->getKey(),
        'old_values'   => $model->getOriginal(),
        'new_values'   => $model->getChanges(),
        'ip_address'   => request()->ip(),
        'user_agent'   => request()->userAgent(),
    ]);
}
// Same pattern for created(), deleted()
```

---

### Route Model Binding with Tenant Scope

Laravel's route model binding is configured to always respect the tenant scope for owner routes:

```php
// app/Providers/RouteServiceProvider.php
Route::bind('menuItem', function (string $value, Route $route) {
    if (request()->routeIs('owner.*')) {
        return MenuItem::where('id', $value)
            ->where('restaurant_id', app('currentRestaurant')->id)
            ->firstOrFail();  // returns 404 (not 403) to avoid confirming existence
    }
    return MenuItem::findOrFail($value);
});
```

Same pattern applied for `category`, `order` (owner side), `review`, `coupon`.

---

### Multi-Restaurant Owner (Future-Proof Schema)

The current schema enforces one restaurant per owner (`UNIQUE KEY unique_owner` on `user_id`). If the platform later allows chain restaurants / multiple outlets, only two changes are needed:
1. Drop the unique constraint on `restaurants.user_id`
2. Change `CheckRestaurantOwner` to accept a `restaurant_id` query param and verify ownership via `Restaurant::where('user_id', ...)->where('id', ...)->firstOrFail()`

No other code changes required — the `HasRestaurantScope` and policies already use `restaurant_id`, not `user_id`.

---

## Complete API Routes (routes/api.php)

```php
// ─── PUBLIC ───────────────────────────────────────────────────────────────
Route::post('/auth/register',        [AuthController::class, 'register']);
Route::post('/auth/login',           [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [PasswordResetController::class, 'send']);
Route::post('/auth/reset-password',  [PasswordResetController::class, 'reset']);
Route::get ('/auth/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed'])->name('verification.verify'); // signed URL from Laravel's email verification notification
Route::get ('/settings/public',      [PublicSettingsController::class, 'index']); // feature flags + loyalty rates for frontend boot

// Public restaurant browsing
Route::get('/restaurants',           [RestaurantController::class, 'index']);
Route::get('/restaurants/featured',  [RestaurantController::class, 'featured']);
Route::get('/restaurants/search',       [RestaurantController::class, 'search']);
Route::get('/restaurants/autocomplete', [RestaurantController::class, 'autocomplete']); // ?q= debounced typeahead, returns [{id,name,slug,logo_path}]
Route::get('/restaurants/{slug}',    [RestaurantController::class, 'show']);
Route::get('/restaurants/{id}/menu', [MenuController::class, 'byRestaurant']);
Route::get('/restaurants/{id}/reviews', [ReviewController::class, 'index']);

// ─── AUTHENTICATED (Sanctum) ───────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

  Route::post('/auth/logout',          [AuthController::class, 'logout']);
  Route::get ('/auth/me',              [AuthController::class, 'me']);
  Route::put ('/auth/profile',         [AuthController::class, 'updateProfile']);
  Route::put ('/auth/password',        [AuthController::class, 'changePassword']);  // requires current_password + new_password

  // Addresses
  Route::apiResource('/addresses', AddressController::class);
  Route::patch('/addresses/{id}/set-default', [AddressController::class, 'setDefault']);

  // Notifications
  Route::get ('/notifications',           [NotificationController::class, 'index']);
  Route::patch('/notifications/{id}/read',[NotificationController::class, 'markRead']);
  Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);

  // ─── CUSTOMER ─────────────────────────────────────────────────────────────
  Route::middleware('role:customer')->group(function () {

    // Cart
    Route::get   ('/cart',              [CartController::class, 'show']);
    Route::post  ('/cart/add',          [CartController::class, 'add']);
    Route::patch ('/cart/items/{id}',   [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{id}',   [CartController::class, 'removeItem']);
    Route::delete('/cart',              [CartController::class, 'clear']);

    // Coupons
    Route::post('/coupons/validate',    [CouponController::class, 'validate']);

    // Orders
    Route::post('/orders',              [OrderController::class, 'store']);
    Route::get ('/orders',              [OrderController::class, 'index']);
    Route::get ('/orders/{id}',         [OrderController::class, 'show']);
    Route::patch('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Payment
    Route::post('/payment/initiate',    [PaymentController::class, 'initiate']);
    Route::post('/payment/verify',      [PaymentController::class, 'verify']);

    // Reviews (after delivery)
    Route::post('/reviews',                         [ReviewController::class, 'store']);

    // Delivery Partner Rating (after delivery, one per order)
    Route::post('/orders/{id}/rate-delivery',       [DeliveryRatingController::class, 'store']);

    // Favourites
    Route::get   ('/favourites',                  [FavouriteController::class, 'index']);
    Route::post  ('/favourites/{restaurantId}',   [FavouriteController::class, 'store']);
    Route::delete('/favourites/{restaurantId}',   [FavouriteController::class, 'destroy']);

    // Reorder
    Route::post('/orders/{id}/reorder',           [OrderController::class, 'reorder']);

    // Loyalty Points
    Route::get ('/loyalty',                    [LoyaltyController::class, 'summary']);
    Route::get ('/loyalty/transactions',       [LoyaltyController::class, 'transactions']);
    Route::post('/loyalty/redeem',             [LoyaltyController::class, 'redeem']);
    Route::get ('/loyalty/tiers',              [LoyaltyController::class, 'tiers']);
  });

  // ─── RESTAURANT OWNER ─────────────────────────────────────────────────────
  Route::middleware('role:restaurant_owner')->prefix('owner')->group(function () {

    // Restaurant
    Route::get  ('/restaurant',         [RestaurantManageController::class, 'show']);
    Route::post ('/restaurant',         [RestaurantManageController::class, 'store']);
    Route::put  ('/restaurant',         [RestaurantManageController::class, 'update']);
    Route::patch('/restaurant/toggle',  [RestaurantManageController::class, 'toggleOpen']);

    // Categories
    Route::apiResource('/categories', CategoryController::class);
    Route::patch('/categories/reorder', [CategoryController::class, 'reorder']);

    // Menu Items
    Route::apiResource('/menu-items', MenuItemController::class);
    Route::patch('/menu-items/{id}/toggle-availability', [MenuItemController::class, 'toggleAvailability']);
    Route::patch('/menu-items/{id}/toggle-featured',     [MenuItemController::class, 'toggleFeatured']);

    // Menu Item Variants (managed as sub-resource of menu item)
    Route::get   ('/menu-items/{id}/variants',     [MenuItemController::class, 'variants']);
    Route::post  ('/menu-items/{id}/variants',     [MenuItemController::class, 'addVariant']);
    Route::put   ('/menu-items/{id}/variants/{vid}', [MenuItemController::class, 'updateVariant']);
    Route::delete('/menu-items/{id}/variants/{vid}', [MenuItemController::class, 'deleteVariant']);

    // Orders
    Route::get  ('/orders',                   [OrderManageController::class, 'index']);
    Route::get  ('/orders/{id}',              [OrderManageController::class, 'show']);
    Route::patch('/orders/{id}/status',       [OrderManageController::class, 'updateStatus']);

    // Reviews
    Route::get  ('/reviews',                  [ReviewManageController::class, 'index']);
    Route::patch('/reviews/{id}/reply',       [ReviewManageController::class, 'reply']);

    // Coupons
    Route::apiResource('/coupons', OwnerCouponController::class);

    // Revenue
    Route::get('/revenue',                    [RevenueController::class, 'index']);
    Route::get('/revenue/export',             [RevenueController::class, 'export']);
    Route::get('/revenue/top-items',          [RevenueController::class, 'topItems']);
  });

  // ─── DELIVERY PARTNER ─────────────────────────────────────────────────────
  Route::middleware('role:delivery_partner')->prefix('delivery')->group(function () {

    Route::get  ('/profile',             [DeliveryController::class, 'profile']);
    Route::put  ('/profile',             [DeliveryController::class, 'updateProfile']);
    Route::patch('/availability',        [DeliveryController::class, 'toggleAvailability']);
    Route::patch('/location',            [DeliveryController::class, 'updateLocation']);

    Route::get  ('/orders/available',    [DeliveryOrderController::class, 'available']);
    Route::post ('/orders/{id}/accept',  [DeliveryOrderController::class, 'accept']);
    Route::patch('/orders/{id}/status',  [DeliveryOrderController::class, 'updateStatus']);
    Route::get  ('/orders/{id}',         [DeliveryOrderController::class, 'show']);

    Route::get  ('/history',             [DeliveryOrderController::class, 'history']);
    Route::get  ('/earnings',            [DeliveryOrderController::class, 'earnings']);
  });

  // ─── ADMIN (admin + superadmin both access these) ─────────────────────────
  Route::middleware('role:admin,superadmin')->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard/stats',       [DashboardController::class, 'stats']);
    Route::get('/dashboard/revenue',     [DashboardController::class, 'revenue']);

    // Users
    Route::get  ('/users',               [UserManageController::class, 'index']);
    Route::get  ('/users/{id}',          [UserManageController::class, 'show']);
    Route::patch('/users/{id}/status',   [UserManageController::class, 'updateStatus']);
    Route::patch('/users/{id}/role',     [UserManageController::class, 'updateRole']);

    // Restaurants
    Route::get  ('/restaurants',                    [RestaurantApprovalController::class, 'index']);
    Route::get  ('/restaurants/{id}',               [RestaurantApprovalController::class, 'show']);
    Route::patch('/restaurants/{id}/approve',       [RestaurantApprovalController::class, 'approve']);
    Route::patch('/restaurants/{id}/reject',        [RestaurantApprovalController::class, 'reject']);
    Route::patch('/restaurants/{id}/suspend',        [RestaurantApprovalController::class, 'suspend']);
    Route::patch('/restaurants/{id}/feature',        [RestaurantApprovalController::class, 'toggleFeatured']);

    // Orders
    Route::get  ('/orders',              [AdminOrderController::class, 'index']);
    Route::get  ('/orders/{id}',         [AdminOrderController::class, 'show']);
    Route::post ('/orders/{id}/refund',  [AdminOrderController::class, 'refund']);

    // Delivery Partners
    Route::get  ('/delivery-partners',           [AdminDeliveryController::class, 'index']);
    Route::patch('/delivery-partners/{id}/verify', [AdminDeliveryController::class, 'verify']);
    Route::patch('/delivery-partners/{id}/suspend',[AdminDeliveryController::class, 'suspend']);

    // Coupons
    Route::apiResource('/coupons', AdminCouponController::class);

    // Revenue
    Route::get('/revenue',               [ReportController::class, 'revenue']);
    Route::get('/revenue/by-restaurant', [ReportController::class, 'byRestaurant']);
    Route::get('/revenue/export',        [ReportController::class, 'export']);

    // Loyalty (Admin)
    Route::get  ('/loyalty/stats',                [LoyaltyManageController::class, 'stats']);
    Route::get  ('/loyalty/transactions',         [LoyaltyManageController::class, 'allTransactions']);
    Route::post ('/loyalty/bonus',                [LoyaltyManageController::class, 'grantBonus']);
    Route::patch('/loyalty/tiers/{id}',           [LoyaltyManageController::class, 'updateTier']);
    Route::patch('/loyalty/config',               [LoyaltyManageController::class, 'updateConfig']);

    // Notifications (broadcast)
    Route::post('/notifications/broadcast', [AdminNotificationController::class, 'broadcast']);

    // Settings
    Route::get ('/settings',             [SettingsController::class, 'index']);
    Route::put ('/settings',             [SettingsController::class, 'update']);
  });
});

// ─── SUPERADMIN ONLY ──────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:superadmin'])->prefix('superadmin')->group(function () {

  // Admin account management
  Route::get  ('/admins',                    [SuperAdminController::class, 'listAdmins']);
  Route::post ('/admins',                    [SuperAdminController::class, 'createAdmin']);
  Route::patch('/admins/{id}/status',        [SuperAdminController::class, 'toggleAdminStatus']);
  Route::delete('/admins/{id}',              [SuperAdminController::class, 'deleteAdmin']);

  // Platform commission
  Route::get  ('/commissions',               [CommissionController::class, 'index']);
  Route::get  ('/commissions/default',       [CommissionController::class, 'getDefault']);
  Route::patch('/commissions/default',       [CommissionController::class, 'setDefault']);
  Route::post ('/commissions/{restaurantId}',[CommissionController::class, 'setForRestaurant']);
  Route::delete('/commissions/{restaurantId}',[CommissionController::class, 'resetToDefault']);

  // Audit logs
  Route::get  ('/audit-logs',                [AuditLogController::class, 'index']);
  Route::get  ('/audit-logs/export',         [AuditLogController::class, 'export']);

  // User impersonation
  Route::post ('/impersonate/{userId}',      [ImpersonationController::class, 'start']);
  Route::post ('/impersonate/stop',          [ImpersonationController::class, 'stop']);

  // Platform financial P&L
  Route::get  ('/financials',                [FinancialsController::class, 'summary']);
  Route::get  ('/financials/commission-earned', [FinancialsController::class, 'commissionEarned']);
  Route::get  ('/financials/export',         [FinancialsController::class, 'export']);

  // Feature flags (superadmin controls what features are live)
  Route::get  ('/feature-flags',             [FeatureFlagController::class, 'index']);
  Route::patch('/feature-flags/{key}',       [FeatureFlagController::class, 'update']);

  // Platform settings (superadmin-only keys: gateway credentials, SMTP, SMS)
  Route::get  ('/settings',                  [PlatformSettingsController::class, 'superadminIndex']);
  Route::patch('/settings',                  [PlatformSettingsController::class, 'superadminUpdate']);
});

// Payment webhooks (no auth — verified by gateway signature headers)
Route::post('/webhooks/razorpay', [PaymentController::class, 'razorpayWebhook']);
```

---

## Frontend — Redux Store

```js
// src/app/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer         from '../features/auth/authSlice'
import cartReducer         from '../features/customer/cartSlice'
import orderReducer        from '../features/customer/orderSlice'
import restaurantReducer   from '../features/customer/restaurantSlice'
import loyaltyReducer      from '../features/customer/loyaltySlice'
import favouriteReducer    from '../features/customer/favouriteSlice'
import ownerReducer        from '../features/owner/ownerSlice'
import deliveryReducer     from '../features/delivery/deliverySlice'
import adminReducer        from '../features/admin/adminSlice'
import superadminReducer   from '../features/superadmin/superadminSlice'
import uiReducer           from './uiSlice'

export const store = configureStore({
  reducer: {
    auth:        authReducer,
    cart:        cartReducer,
    order:       orderReducer,
    restaurant:  restaurantReducer,
    loyalty:     loyaltyReducer,
    favourite:   favouriteReducer,
    owner:       ownerReducer,
    delivery:    deliveryReducer,
    admin:       adminReducer,
    superadmin:  superadminReducer,
    ui:          uiReducer,
  },
})
```

### authSlice state shape
```js
{
  user: { id, name, email, phone, role, profile_image },
  token: 'string|null',
  isAuthenticated: false,
  isLoading: false,
  error: null,
}
```

### cartSlice state shape
```js
{
  restaurantId: null,
  restaurantName: '',
  items: [{ id, menuItemId, name, image, price, quantity, variantName }],
  coupon: { code: '', discount: 0, type: '' },
  isCartOpen: false,
}
```

### orderSlice state shape
```js
{
  activeOrder: { id, orderNumber, status, estimatedDeliveryAt, deliveryPartner },
  history: [],
  pagination: { currentPage: 1, total: 0, perPage: 15 },
  isLoading: false,
}
```

### uiSlice state shape
```js
{
  settings: {               // loaded from GET /api/settings/public on app boot
    loyalty_enabled: true,
    loyalty_earn_rate: 10,
    loyalty_redeem_rate: 0.10,
    loyalty_min_redeem: 100,
    reviews_enabled: true,
    coupons_enabled: true,
    delivery_partner_enabled: true,
    registration_enabled: true,
    restaurant_registration_enabled: true,
    maintenance_mode: false,
  },
  isCartOpen: false,
  activeModal: null,
}
```

### loyaltySlice state shape
```js
{
  balance: 0,               // current redeemable points
  lifetimeEarned: 0,        // for tier calculation
  tier: {
    id: 1,
    name: 'Bronze',
    badgeColor: '#CD7F32',
    multiplier: 1.00,
    freeDelivery: false,
    perks: [],
  },
  nextTier: {               // null if Platinum
    name: 'Silver',
    pointsRequired: 1000,
    pointsRemaining: 1000,
  },
  redemption: {
    isApplied: false,
    pointsToRedeem: 0,
    discountAmount: 0,
  },
  transactions: [],
  pagination: { currentPage: 1, total: 0, perPage: 20 },
  isLoading: false,
}
```

---

## Frontend — Routing & Protected Routes

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Route guards — implementations in src/components/PrivateRoute.jsx (see Route Guards section below)
import { PrivateRoute, PublicOnlyRoute } from './components/PrivateRoute'

// Lazy-loaded pages (all real, no placeholders)
const Home             = lazy(() => import('./pages/customer/Home'))
const Restaurants      = lazy(() => import('./pages/customer/Restaurants'))
const RestaurantDetail = lazy(() => import('./pages/customer/RestaurantDetail'))
const Search           = lazy(() => import('./pages/customer/Search'))
const Cart             = lazy(() => import('./pages/customer/Cart'))
const Checkout         = lazy(() => import('./pages/customer/Checkout'))
const OrderHistory     = lazy(() => import('./pages/customer/OrderHistory'))
const OrderTracking    = lazy(() => import('./pages/customer/OrderTracking'))
const Profile          = lazy(() => import('./pages/customer/Profile'))
const Addresses        = lazy(() => import('./pages/customer/Addresses'))
const Notifications    = lazy(() => import('./pages/Notifications'))

const Login            = lazy(() => import('./pages/auth/Login'))
const Register         = lazy(() => import('./pages/auth/Register'))
const ForgotPassword   = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword    = lazy(() => import('./pages/auth/ResetPassword'))

const OwnerDashboard   = lazy(() => import('./pages/owner/Dashboard'))
const OwnerOrders      = lazy(() => import('./pages/owner/Orders'))
const OwnerOrderDetail = lazy(() => import('./pages/owner/OrderDetail'))
const MenuManager      = lazy(() => import('./pages/owner/MenuManager'))
const CategoryManager  = lazy(() => import('./pages/owner/CategoryManager'))
const ItemForm         = lazy(() => import('./pages/owner/ItemForm'))
const RestaurantSettings = lazy(() => import('./pages/owner/RestaurantSettings'))
const OwnerReviews     = lazy(() => import('./pages/owner/Reviews'))
const OwnerCoupons     = lazy(() => import('./pages/owner/Coupons'))
const OwnerRevenue     = lazy(() => import('./pages/owner/Revenue'))

const DeliveryDashboard = lazy(() => import('./pages/delivery/Dashboard'))
const DeliveryOrders    = lazy(() => import('./pages/delivery/Orders'))
const ActiveDelivery    = lazy(() => import('./pages/delivery/ActiveDelivery'))
const DeliveryHistory   = lazy(() => import('./pages/delivery/History'))
const DeliveryEarnings  = lazy(() => import('./pages/delivery/Earnings'))
const DeliveryProfile   = lazy(() => import('./pages/delivery/Profile'))

const AdminDashboard    = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers        = lazy(() => import('./pages/admin/Users'))
const AdminRestaurants  = lazy(() => import('./pages/admin/Restaurants'))
const AdminOrders       = lazy(() => import('./pages/admin/Orders'))
const AdminDelivery     = lazy(() => import('./pages/admin/DeliveryPartners'))
const AdminCoupons      = lazy(() => import('./pages/admin/Coupons'))
const AdminRevenue      = lazy(() => import('./pages/admin/Revenue'))
const AdminSettings     = lazy(() => import('./pages/admin/Settings'))
const AdminNotifications= lazy(() => import('./pages/admin/Notifications'))
const AdminLoyalty      = lazy(() => import('./pages/admin/Loyalty'))
const LoyaltyProfile    = lazy(() => import('./pages/customer/LoyaltyProfile'))
const Favourites        = lazy(() => import('./pages/customer/Favourites'))

const SuperAdminDashboard   = lazy(() => import('./pages/superadmin/Dashboard'))
const SuperAdminAdmins      = lazy(() => import('./pages/superadmin/Admins'))
const SuperAdminCommissions = lazy(() => import('./pages/superadmin/Commissions'))
const SuperAdminAuditLogs   = lazy(() => import('./pages/superadmin/AuditLogs'))
const SuperAdminFinancials  = lazy(() => import('./pages/superadmin/Financials'))
const SuperAdminFeatureFlags= lazy(() => import('./pages/superadmin/FeatureFlags'))
const SuperAdminImpersonate = lazy(() => import('./pages/superadmin/Impersonate'))
const SuperAdminSettings    = lazy(() => import('./pages/superadmin/Settings'))
```

---

## Frontend — Layout System

### Customer Layout
```
┌─────────────────────────────────────────────────────────┐
│ Navbar: Logo | Location | Search | Cart(badge) | Avatar │  ← sticky
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    <Page Content>                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Footer: Links | App stores | Social                     │
└─────────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────────┐
│ Logo        Cart  Avatar │  ← top bar (sticky)
├──────────────────────────┤
│ 🔍 Search location...    │
├──────────────────────────┤
│    <Page Content>        │
├──────────────────────────┤
│ Home | Browse | Orders | Profile │  ← bottom tab bar
└──────────────────────────┘
```

### Owner Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar: Logo | Nav items | Restaurant toggle | Logout  │
├──────────┬──────────────────────────────────────────────┤
│          │ Topbar: Page title | Notification bell       │
│          ├──────────────────────────────────────────────┤
│  Sidebar │                                              │
│  (fixed) │         <Dashboard Content>                  │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘

Mobile: sidebar collapses to hamburger → slide-in drawer
```

### Delivery Partner Layout
```
┌──────────────────────────┐
│ DeliverEase | Bell | Menu│  ← top bar
├──────────────────────────┤
│    <Page Content>        │
├──────────────────────────┤
│ Home | Orders | Earnings | Profile │  ← bottom tabs
└──────────────────────────┘
```

### Admin Layout
```
Same pattern as owner: fixed sidebar + main content area
Sidebar accent color: neutral-900 (dark) vs brand-50 (owner)
```

### Superadmin Layout
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar: Logo + "Superadmin" badge | Nav | Logout       │  ← sidebar-900 + purple accent
├──────────┬──────────────────────────────────────────────┤
│          │ Topbar: Page title | Impersonation banner?   │
│ Sidebar  ├──────────────────────────────────────────────┤
│ (fixed)  │         <Dashboard Content>                  │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
Impersonation active banner: full-width warning bar at very top
"⚠ Impersonating [name] (customer) — Exit Impersonation"
Sidebar nav items: Dashboard | Admins | Commissions | Financials |
                   Audit Logs | Feature Flags | Impersonate | Settings
```

---

## Responsive Breakpoints

| Breakpoint | Min Width | Key Layout Changes |
|---|---|---|
| Mobile (base) | 0 | Single col, bottom nav, stacked forms, full-screen modals |
| xs | 390px | Touch targets ≥ 44px, larger font base |
| sm | 640px | 2-col restaurant grid, sidebar cart hint |
| md | 768px | Sidebar filters visible, 2-col checkout layout |
| lg | 1024px | 3-col restaurant grid, sticky cart sidebar, owner side-nav |
| xl | 1280px | 4-col grid, wider dashboard tables |
| 2xl | 1536px | Max content width 1400px, centered layout |

---

## Loyalty Points — Backend Logic (LoyaltyService.php)

### Points Earning Rules
All values below are read at runtime from `platform_settings` — no hardcoding in service or controller.

- **Earn rate** → `platform_settings['loyalty_earn_rate']` (default seed: 10, meaning ₹10 = 1 point; admin can set to any integer)
- **Tier multiplier** → `loyalty_tiers.points_multiplier` for the user's current tier (admin edits tiers)
- **When credited** → only when `orders.status` transitions to `delivered`; triggered inside `OrderService::markDelivered()`
- **Formula** → `floor((subtotal / settings('loyalty_earn_rate')) * tier->points_multiplier)`
- **Expiry** → credited points expire after `platform_settings['loyalty_expiry_months']` months from credit date (admin sets this)
- **On credit** → insert `loyalty_transactions` row (type=`earned`), increment `loyalty_points.balance` + `lifetime_earned`, call `recalculateTier()`

### Points Redemption Rules
All values below are read at runtime from `platform_settings` — no hardcoding.

- **Redeem rate** → `platform_settings['loyalty_redeem_rate']` (default seed: 0.10, meaning 1 point = ₹0.10; admin can change)
- **Minimum points to redeem** → `platform_settings['loyalty_min_redeem']` (admin sets; default seed: 100)
- **Max discount per order** → `platform_settings['loyalty_max_redeem_pct']` % of `subtotal` (admin sets; default seed: 20%)
- **Mutual exclusion** → cannot combine with coupon code; enforced in `PricingService::applyDiscounts()` and in checkout UI
- **On redeem** → points deducted immediately at order placement, `loyalty_transactions` row type=`redeemed` inserted, `balance` decremented
- **Cancellation policy** → redeemed points are NOT refunded on order cancel (platform policy; admin can override per-case via bonus grant)

### Tier Recalculation
```php
// LoyaltyService::recalculateTier(User $user)
$lifetimeEarned = $user->loyaltyPoint->lifetime_earned;
$tier = LoyaltyTier::where('min_lifetime_points', '<=', $lifetimeEarned)
          ->orderByDesc('min_lifetime_points')->first();
if ($tier->id !== $user->loyaltyPoint->tier_id) {
    $user->loyaltyPoint->update(['tier_id' => $tier->id, 'tier_updated_at' => now()]);
    // Notify user of tier upgrade via notification
    NotificationService::send($user, 'tier_upgrade', [
        'new_tier' => $tier->name,
        'badge_color' => $tier->badge_color,
    ]);
}
```

### Expiry Job (Scheduled Command)
```php
// app/Console/Commands/ExpireLoyaltyPoints.php
// Runs: daily at 00:05 via Laravel scheduler
// Finds transactions where expires_at <= now() and points not yet expired
// Deducts expired points from balance (cannot go below 0)
// Inserts loyalty_transactions row: type=expired, points=negative, description="Points expired"
```

### platform_settings table (add to migrations)
```sql
CREATE TABLE platform_settings (
  `key`       VARCHAR(100) PRIMARY KEY,
  `value`     TEXT NOT NULL,
  `cast`      ENUM('string','integer','float','boolean','json') NOT NULL DEFAULT 'string',
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Loyalty default seed values (admin changes these at runtime via /admin/loyalty — Tab 1)
INSERT INTO platform_settings VALUES
  ('loyalty_earn_rate',        '10',   'integer', NOW()),  -- admin sets: ₹X per 1 point earned
  ('loyalty_redeem_rate',      '0.10', 'float',   NOW()),  -- admin sets: ₹ value of 1 point redeemed
  ('loyalty_min_redeem',       '100',  'integer', NOW()),  -- admin sets: minimum points required to redeem
  ('loyalty_max_redeem_pct',   '20',   'integer', NOW()),  -- admin sets: max % of subtotal payable by points
  ('loyalty_expiry_months',    '12',   'integer', NOW()),  -- admin sets: 0 = never expire
  ('loyalty_enabled',          'true', 'boolean', NOW()),  -- admin sets: global on/off
  ('default_commission_pct',       '10', 'float',   NOW()),  -- superadmin: platform cut % of subtotal
  ('tax_rate_pct',                 '5',  'float',   NOW()),  -- superadmin: GST applied to orders
  ('delivery_partner_share_pct',  '80', 'integer', NOW());  -- superadmin: % of delivery fee paid to partner
```

### `audit_logs` (superadmin read-only)
```sql
CREATE TABLE audit_logs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT 'Who performed the action (admin or superadmin)',
  user_role     ENUM('admin','superadmin') NOT NULL,
  action        VARCHAR(100) NOT NULL COMMENT 'e.g. restaurant.approve, user.deactivate, coupon.delete',
  target_type   VARCHAR(100) COMMENT 'Model class e.g. App\\Models\\Restaurant',
  target_id     BIGINT UNSIGNED COMMENT 'ID of the affected record',
  old_values    JSON COMMENT 'State before change',
  new_values    JSON COMMENT 'State after change',
  ip_address    VARCHAR(45),
  user_agent    VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user   (user_id),
  INDEX idx_action (action),
  INDEX idx_target (target_type, target_id)
);
```

### `platform_commissions`
```sql
CREATE TABLE platform_commissions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id   BIGINT UNSIGNED NOT NULL UNIQUE,
  rate_pct        DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT 'Platform cut % of order subtotal; set by superadmin',
  effective_from  DATE NOT NULL,
  notes           TEXT COMMENT 'Reason for custom rate if different from platform default',
  created_by      BIGINT UNSIGNED NOT NULL COMMENT 'superadmin user id',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by)    REFERENCES users(id)        ON DELETE RESTRICT
);
-- If no row exists for a restaurant, use platform_settings['default_commission_pct']
```

---

## Real-Time Features (Laravel Reverb)

```bash
# Install Laravel Reverb (WebSocket server, no Pusher needed)
composer require laravel/reverb
php artisan reverb:install

# Frontend (Echo)
npm install laravel-echo pusher-js
```

### Channels
- `orders.{orderId}` — Customer listens: order status updates
- `restaurant.{restaurantId}.orders` — Owner listens: new incoming orders
- `delivery.{partnerId}` — Delivery partner listens: new order assignments

### Events
```php
class OrderStatusChanged implements ShouldBroadcast {
  public Order $order;
  public function broadcastOn() { return new PrivateChannel("orders.{$this->order->id}"); }
  public function broadcastAs() { return 'order.status.changed'; }
}

class NewOrderReceived implements ShouldBroadcast {
  public Order $order;
  public function broadcastOn() { return new PrivateChannel("restaurant.{$this->order->restaurant_id}.orders"); }
}
```

---

## Payment Integration

### Supported Methods

| Method | Handled by | Sub-methods |
|---|---|---|
| Razorpay | Razorpay gateway | Credit/Debit card, UPI, Net banking, Wallets (Paytm, PhonePe, etc.) |
| Cash on Delivery | No gateway | Payment collected at door by delivery partner |

---

### Razorpay Setup

```bash
# Backend
composer require razorpay/razorpay

# Frontend — NO npm package needed
# Razorpay checkout.js is loaded from CDN at runtime:
# <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
# Add to index.html <head>
```

### Razorpay Flow (step by step)

```
Customer                  Frontend               Laravel Backend           Razorpay API
    |                        |                         |                        |
    |-- clicks "Pay" ------> |                         |                        |
    |                        |-- POST /payment/initiate|                        |
    |                        |                         |-- create Order ------> |
    |                        |                         |<-- {order_id, amount}--|
    |                        |<-- {rzp_order_id,       |                        |
    |                        |     amount_paise,        |                        |
    |                        |     key_id, prefill} ----|                        |
    |                        |                         |                        |
    |                        |-- opens Razorpay modal  |                        |
    |<-- modal shown --------|                         |                        |
    |-- selects UPI/card/    |                         |                        |
    |   netbanking/wallet    |                         |                        |
    |-- pays -------------> Razorpay modal             |                        |
    |                        |<-- {payment_id,         |                        |
    |                        |     order_id, signature}|                        |
    |                        |-- POST /payment/verify  |                        |
    |                        |                         |-- HMAC verify sig      |
    |                        |                         |-- create Order record  |
    |                        |                         |-- broadcast status     |
    |                        |<-- {order_id, status} --|                        |
    |<-- redirect tracking --|                         |                        |
```

### Backend: `PaymentService.php`

```php
// 1. Initiate — called before checkout confirmation
public function initiateRazorpay(float $amount, string $currency = 'INR'): array
{
    $api = new Api(config('services.razorpay.key_id'), config('services.razorpay.key_secret'));

    $order = $api->order->create([
        'amount'          => (int)($amount * 100),  // paise — no decimals
        'currency'        => $currency,
        'payment_capture' => 1,                     // auto-capture on success
    ]);

    return [
        'rzp_order_id' => $order['id'],
        'amount_paise' => $order['amount'],
        'currency'     => $order['currency'],
        'key_id'       => config('services.razorpay.key_id'),  // public key — safe to expose
    ];
}

// 2. Verify — called after Razorpay modal returns
public function verifyRazorpay(string $orderId, string $paymentId, string $signature): bool
{
    $expected = hash_hmac('sha256', $orderId . '|' . $paymentId,
                          config('services.razorpay.key_secret'));
    return hash_equals($expected, $signature);
}

// 3. Refund
public function refundRazorpay(string $paymentId, float $amount): array
{
    $api = new Api(config('services.razorpay.key_id'), config('services.razorpay.key_secret'));
    return $api->payment->fetch($paymentId)->refund(['amount' => (int)($amount * 100)]);
}
```

### Backend: `PaymentController.php`

```php
// POST /api/payment/initiate
public function initiate(Request $request): JsonResponse
{
    $request->validate(['amount' => 'required|numeric|min:1']);
    $data = $this->paymentService->initiateRazorpay($request->amount);
    return response()->json($data);
}

// POST /api/payment/verify
public function verify(Request $request): JsonResponse
{
    $request->validate([
        'rzp_order_id'   => 'required|string',
        'rzp_payment_id' => 'required|string',
        'rzp_signature'  => 'required|string',
        'cart_snapshot'  => 'required|array',   // full cart at time of payment
        'address_id'     => 'required|integer',
        'coupon_code'    => 'nullable|string',
        'loyalty_points' => 'nullable|integer',
        'payment_method' => 'required|in:razorpay,cod',
    ]);

    if ($request->payment_method === 'razorpay') {
        $valid = $this->paymentService->verifyRazorpay(
            $request->rzp_order_id,
            $request->rzp_payment_id,
            $request->rzp_signature
        );
        if (!$valid) return response()->json(['message' => 'Payment verification failed.'], 422);
    }

    $order = $this->orderService->createFromCart($request);
    return response()->json(['order_id' => $order->id, 'order_number' => $order->order_number], 201);
}

// POST /api/webhooks/razorpay  (no auth — verified by header)
public function razorpayWebhook(Request $request): Response
{
    $signature = $request->header('X-Razorpay-Signature');
    $body      = $request->getContent();
    $expected  = hash_hmac('sha256', $body, config('services.razorpay.webhook_secret'));

    if (!hash_equals($expected, $signature)) abort(400, 'Invalid webhook signature.');

    $event = $request->json('event');

    match ($event) {
        'payment.captured' => $this->paymentService->handleCaptured($request->json('payload')),
        'payment.failed'   => $this->paymentService->handleFailed($request->json('payload')),
        'refund.created'   => $this->paymentService->handleRefund($request->json('payload')),
        default            => null,
    };

    return response()->noContent();
}
```

### Frontend: Razorpay Checkout

```jsx
// src/features/customer/useRazorpay.js
export function useRazorpay() {
  const openCheckout = ({ rzpOrderId, amountPaise, currency, keyId, prefill, onSuccess, onFailure }) => {
    const options = {
      key:         keyId,
      amount:      amountPaise,
      currency,
      order_id:    rzpOrderId,
      name:        'RestaurantApp',
      description: 'Order Payment',
      prefill: {
        name:    prefill.name,
        email:   prefill.email,
        contact: prefill.phone,
      },
      theme: { color: '#F97316' },   // brand-500 orange
      modal: {
        ondismiss: onFailure,
      },
      handler: (response) => {
        // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        onSuccess(response)
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }
  return { openCheckout }
}
```

```jsx
// Usage in CheckoutPage.jsx
const { openCheckout } = useRazorpay()

const handlePlaceOrder = async () => {
  if (paymentMethod === 'cod') {
    await api.post('/payment/verify', { payment_method: 'cod', ...cartSnapshot })
    navigate(`/orders/${newOrder.id}`)
    return
  }

  // Razorpay
  const { data } = await api.post('/payment/initiate', { amount: totalAmount })
  openCheckout({
    rzpOrderId:  data.rzp_order_id,
    amountPaise: data.amount_paise,
    currency:    data.currency,
    keyId:       data.key_id,
    prefill:     { name: user.name, email: user.email, phone: user.phone },
    onSuccess: async (rzpResponse) => {
      const { data: order } = await api.post('/payment/verify', {
        payment_method:  'razorpay',
        rzp_order_id:    rzpResponse.razorpay_order_id,
        rzp_payment_id:  rzpResponse.razorpay_payment_id,
        rzp_signature:   rzpResponse.razorpay_signature,
        address_id:      selectedAddressId,
        coupon_code:     appliedCoupon?.code ?? null,
        loyalty_points:  loyaltyRedemption.pointsToRedeem,
      })
      navigate(`/orders/${order.order_id}`)
    },
    onFailure: () => toast.error('Payment cancelled or failed. Please try again.'),
  })
}
```

### COD Flow

```
Customer selects COD → clicks "Place Order"
→ POST /api/payment/verify { payment_method: 'cod', address_id, ... }
→ Backend: creates Order with payment_status = 'pending', payment_method = 'cod'
→ Order confirmed immediately → broadcast → redirect to tracking
→ Delivery partner collects cash → marks delivered → payment_status updated to 'paid'
```

### Refund Policy

| Scenario | Razorpay | COD |
|---|---|---|
| Customer cancels (Pending/Confirmed) | Full refund via `refundRazorpay()` | No action needed |
| Restaurant rejects | Full refund via `refundRazorpay()` | No action needed |
| Partial delivery issue | Partial refund (amount param in refund API) | Manual resolution |
| Refund timeline | 5–7 business days (Razorpay) | Instant (nothing to refund) |

### services/razorpay.php config

```php
// config/services.php — add:
'razorpay' => [
    'key_id'         => env('RAZORPAY_KEY_ID'),
    'key_secret'     => env('RAZORPAY_KEY_SECRET'),
    'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),
],
```

---

## Missing Features — Added

### Favourites
- Customer can heart/un-heart any restaurant
- Heart icon on every restaurant card (filled = saved, outline = not saved)
- `GET /api/favourites` — list of saved restaurants
- `POST /api/favourites/{restaurantId}` — save
- `DELETE /api/favourites/{restaurantId}` — remove
- `Favourite` model + `favourites` table (unique constraint prevents duplicates)
- Favourite restaurants shown in a "Saved" tab on the customer profile

### Reorder API Route
```php
// POST /api/orders/{id}/reorder
// Clears current cart, adds all items from that past order to a new cart
// Returns: { cart, conflict: bool } — conflict = true if any item unavailable or restaurant inactive
Route::post('/orders/{id}/reorder', [OrderController::class, 'reorder']);
```

### Delivery Partner Earnings Split
- Platform settings key: `delivery_partner_share_pct` (default 80) — superadmin sets
- Partner earns: `floor(delivery_fee × partner_share_pct / 100)`
- Platform keeps: remaining `delivery_fee − partner_earned`
- Stored per order: `delivery_partners.total_deliveries` incremented, earnings tracked in `delivery_earnings` table

```sql
CREATE TABLE delivery_earnings (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  delivery_partner_id BIGINT UNSIGNED NOT NULL,
  order_id           BIGINT UNSIGNED NOT NULL UNIQUE,
  delivery_fee       DECIMAL(8,2) NOT NULL,
  partner_share_pct  DECIMAL(5,2) NOT NULL,
  amount_earned      DECIMAL(8,2) NOT NULL,
  status             ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  paid_at            TIMESTAMP,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_id)            REFERENCES orders(id)            ON DELETE RESTRICT
);
```

### Delivery Partner Rating

After an order reaches `delivered` status, the customer can rate their delivery partner once.

```php
// app/Http/Controllers/Customer/DeliveryRatingController.php
class DeliveryRatingController extends Controller
{
    use ApiResponse;

    public function store(Request $request, Order $order): JsonResponse
    {
        // Order must belong to this customer and be delivered
        if ($order->user_id !== $request->user()->id) abort(403);
        if ($order->status !== 'delivered') {
            return $this->error('You can only rate after delivery is complete.', 422);
        }
        if (DeliveryPartnerRating::where('order_id', $order->id)->exists()) {
            return $this->error('You have already rated this delivery.', 422);
        }
        if (!$order->delivery_partner_id) {
            return $this->error('No delivery partner assigned to this order.', 422);
        }

        $validated = $request->validate([
            'rating'  => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:500',
        ]);

        $rating = DeliveryPartnerRating::create([
            'order_id'            => $order->id,
            'user_id'             => $request->user()->id,
            'delivery_partner_id' => $order->delivery_partner_id,
            'rating'              => $validated['rating'],
            'comment'             => $validated['comment'] ?? null,
        ]);

        // Recalculate avg_rating on the delivery_partners row
        $partnerId = $order->delivery_partner_id;
        $avg = DeliveryPartnerRating::where('delivery_partner_id', $partnerId)->avg('rating');
        DeliveryPartner::where('id', $partnerId)->update(['avg_rating' => round($avg, 2)]);

        return $this->success($rating, 'Rating submitted.', 201);
    }
}
```

### Email Verification

```php
// app/Http/Controllers/Auth/EmailVerificationController.php
class EmailVerificationController extends Controller
{
    public function verify(EmailVerificationRequest $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }
        $request->fulfill(); // marks email_verified_at and fires Verified event
        return response()->json(['message' => 'Email verified successfully.'], 200);
    }

    public function resend(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified.'], 200);
        }
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link resent.'], 200);
    }
}
```

Email verification is enforced on order placement — the `POST /api/payment/verify` route includes `verified` in its middleware chain:
```php
Route::post('/payment/verify', [PaymentController::class, 'verify'])
    ->middleware(['auth:sanctum', 'role:customer', 'verified']);
```

Resend route (authenticated, no email-verified check):
```php
Route::post('/auth/email/resend', [EmailVerificationController::class, 'resend'])
    ->middleware('auth:sanctum')->middleware('throttle:3,1');
```

### Restaurant Autocomplete

```php
// RestaurantController.php — autocomplete method
public function autocomplete(Request $request): JsonResponse
{
    $q = $request->validate(['q' => 'required|string|min:1|max:80'])['q'];

    $results = Restaurant::where('status', 'approved')
        ->where('is_active', true)
        ->where(function ($query) use ($q) {
            $query->where('name', 'LIKE', "%{$q}%")
                  ->orWhere('cuisine_type', 'LIKE', "%{$q}%");
        })
        ->select('id', 'name', 'slug', 'logo_path', 'cuisine_type', 'avg_rating')
        ->limit(8)
        ->get();

    return response()->json(['data' => $results]);
}
```

Frontend usage — debounced search input:
```jsx
// src/features/customer/useRestaurantSearch.js
import { useState, useEffect } from 'react'
import { api } from '../../lib/axios'

export function useRestaurantAutocomplete(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/restaurants/autocomplete', { params: { q: query } })
        setResults(data.data)
      } finally {
        setLoading(false)
      }
    }, 300)  // 300ms debounce
    return () => clearTimeout(timer)
  }, [query])

  return { results, loading }
}
```

---

## API Standards

### Rate Limiting (Laravel Throttle)
```php
// routes/api.php — applied per route group
Route::middleware('throttle:60,1')->group(...);     // 60 req/min — general API
Route::middleware('throttle:10,1')->group(...);     // 10 req/min — auth endpoints (login, register)
Route::middleware('throttle:5,1')->group(...);      // 5 req/min — payment initiate
Route::middleware('throttle:3,1')->group(...);      // 3 req/min — forgot-password

// Register named throttle in AppServiceProvider
RateLimiter::for('api',     fn(Request $r) => Limit::perMinute(60)->by($r->user()?->id ?: $r->ip()));
RateLimiter::for('auth',    fn(Request $r) => Limit::perMinute(10)->by($r->ip()));
RateLimiter::for('payment', fn(Request $r) => Limit::perMinute(5)->by($r->user()?->id ?: $r->ip()));
```

### Standard API Response Format
All API responses follow this envelope:

```json
// Success (2xx)
{
  "success": true,
  "data": { ... },
  "message": "Order placed successfully.",
  "meta": { "page": 1, "per_page": 15, "total": 120 }
}

// Error (4xx / 5xx)
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "phone": ["Phone must be 10 digits."]
  }
}
```

```php
// app/Traits/ApiResponse.php
trait ApiResponse
{
    protected function success($data, string $message = '', int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $data, 'message' => $message], $status);
    }

    protected function error(string $message, array $errors = [], int $status = 400): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message, 'errors' => $errors], $status);
    }
}
// All controllers use this trait
```

### CORS Configuration
```php
// config/cors.php
'paths'           => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
'supports_credentials' => true,
```

```env
# Add to .env
FRONTEND_URL=http://localhost:5173
```

---

## Frontend API Layer

### Axios Instance (`src/lib/axios.js`)
```js
import axios from 'axios'
import { store } from '../app/store'
import { logout } from '../features/auth/authSlice'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → auto logout, 422 → field errors, 429 → rate limit toast
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      store.dispatch(logout())
      window.location.href = '/auth/login'
    } else if (status === 429) {
      toast.error('Too many requests. Please wait a moment.')
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

export default api
```

### Frontend Error Boundary (`src/components/ErrorBoundary.jsx`)
```jsx
// Wraps each panel layout — catches JS errors in the tree
// Shows branded error screen: illustration + "Something went wrong" + Retry button
// Reports to console.error in dev; extensible to Sentry in production
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error(error, info) }
  render() {
    if (this.state.hasError) return <ErrorScreen onRetry={() => this.setState({ hasError: false })} />
    return this.props.children
  }
}
```

---

## Email Notifications (Transactional)

### Mail Classes (resources/views/mail/)
| Event | Mail Class | Recipient | Trigger |
|---|---|---|---|
| Registration | `WelcomeEmail` | Customer | `auth/register` success |
| Order placed | `OrderConfirmed` | Customer | `OrderService::create()` |
| Order status change | `OrderStatusUpdated` | Customer | `OrderService::updateStatus()` |
| Restaurant approved | `RestaurantApproved` | Owner | Admin approves restaurant |
| Restaurant rejected | `RestaurantRejected` | Owner | Admin rejects with reason |
| Password reset | Laravel built-in `ResetPassword` | Any user | `forgot-password` route |

All mails dispatched as queued jobs (not sync) so they never slow the HTTP response:
```php
SendOrderConfirmationEmail::dispatch($order)->onQueue('notifications');
```

### Mail .env
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io       # dev: Mailtrap; prod: your SMTP provider
MAIL_PORT=587
MAIL_USERNAME=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_pass
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@restaurantapp.com
MAIL_FROM_NAME="RestaurantApp"
```

---

## Image Handling (Intervention Image)

```bash
composer require intervention/image-laravel
```

```php
// app/Services/ImageService.php
public function uploadMenuItemImage(UploadedFile $file, int $restaurantId): string
{
    $filename = Str::uuid() . '.webp';
    $path     = "restaurants/{$restaurantId}/menu/{$filename}";

    Image::read($file)
         ->cover(800, 600)                   // crop to 4:3
         ->toWebp(quality: 85)
         ->save(storage_path("app/public/{$path}"));

    return $path;
}

public function uploadRestaurantImage(UploadedFile $file, int $restaurantId, string $type): string
{
    // $type = 'logo' | 'cover'
    $dimensions = $type === 'logo' ? [400, 400] : [1200, 400];
    $filename   = "{$type}_" . Str::uuid() . '.webp';
    $path       = "restaurants/{$restaurantId}/{$filename}";

    Image::read($file)
         ->cover(...$dimensions)
         ->toWebp(quality: 85)
         ->save(storage_path("app/public/{$path}"));

    return $path;
}
```
All uploaded images converted to WebP at save time — smaller files, faster loads.

---

## Laravel Scheduler (Cron)

```php
// app/Console/Kernel.php (or routes/console.php in Laravel 11+)
Schedule::job(new ExpireLoyaltyPoints)->dailyAt('00:05');
```

```bash
# Add one cron entry to server (or local Task Scheduler on Windows for dev)
* * * * * php /path/to/backend/artisan schedule:run >> /dev/null 2>&1
```

---

## Database Seeders

```bash
# Run all seeders
php artisan db:seed

# Run individually
php artisan db:seed --class=LoyaltyTierSeeder
php artisan db:seed --class=PlatformSettingsSeeder
php artisan db:seed --class=SuperadminSeeder
```

```php
// database/seeders/SuperadminSeeder.php
// Creates the first superadmin account
User::create([
    'name'     => 'Platform Owner',
    'email'    => env('SUPERADMIN_EMAIL', 'superadmin@restaurantapp.com'),
    'password' => Hash::make(env('SUPERADMIN_PASSWORD', 'changeme_immediately')),
    'role'     => 'superadmin',
    'is_active'=> true,
]);

// database/seeders/DatabaseSeeder.php
public function run(): void
{
    $this->call([
        LoyaltyTierSeeder::class,
        PlatformSettingsSeeder::class,
        SuperadminSeeder::class,
    ]);
}
```

```bash
# Fresh install sequence (order matters)
php artisan key:generate          # must be first — encrypts .env APP_KEY
php artisan reverb:install        # sets up Reverb config files
php artisan queue:table
php artisan queue:failed-table
php artisan migrate               # runs all migrations
php artisan db:seed               # seeds tiers, settings, superadmin
php artisan storage:link          # public disk symlink
```

```env
# Add to .env for seeder
SUPERADMIN_EMAIL=superadmin@restaurantapp.com
SUPERADMIN_PASSWORD=your_secure_password_here
```

---

## Registration Flows by Role

### Customer Registration (`POST /api/auth/register`)
- Form fields: name, email, phone, password, password_confirmation
- `role` defaults to `customer` — not selectable by user
- On success: Sanctum token returned, welcome email queued
- Email verification: optional (controlled by `email_verified_at`; enforce with `verified` middleware on order placement)

### Restaurant Owner Registration
- Step 1: Register as customer (`role = customer`)
- Step 2: Apply to become an owner via `POST /api/owner/restaurant` (creates restaurant in `is_active = false` state, changes user role to `restaurant_owner`)
- Step 3: Admin approves → `is_active = true` → email sent → owner can now manage dashboard
- **OR** separate registration endpoint: `POST /api/auth/register` with `role = restaurant_owner` param (admin must still approve the restaurant)

### Delivery Partner Registration
- `POST /api/auth/register` with `role = delivery_partner`
- `AuthController::register()` checks `role` param — if `delivery_partner`, creates `delivery_partners` row after user creation: `is_verified = false`, `is_available = false`
- Additional fields passed at registration: `vehicle_type`, `vehicle_number`, `licence_number`
- Admin verifies partner (`PATCH /api/admin/delivery-partners/{id}/verify`) before they can toggle available and accept orders

---

## Public Settings Endpoint

Frontend fetches this once on app boot and caches in Redux `uiSlice`:

```php
// GET /api/settings/public — no auth required
// Returns feature flags + loyalty display config for frontend
Route::get('/settings/public', [PublicSettingsController::class, 'index']);
```

```json
{
  "loyalty_enabled": true,
  "loyalty_earn_rate": 10,
  "loyalty_redeem_rate": 0.10,
  "loyalty_min_redeem": 100,
  "reviews_enabled": true,
  "coupons_enabled": true,
  "delivery_partner_enabled": true,
  "registration_enabled": true,
  "restaurant_registration_enabled": true,
  "maintenance_mode": false
}
```

Add `PublicSettingsController.php` to `app/Http/Controllers/` (no auth, no role).  
Frontend: fetches in `App.jsx` on mount, stores in `uiSlice.settings`, gates UI features behind `settings.loyalty_enabled` etc.

---

## Admin: Feature Restaurant Toggle

```php
// PATCH /api/admin/restaurants/{id}/feature
Route::patch('/restaurants/{id}/feature', [RestaurantApprovalController::class, 'toggleFeatured']);
// Sets restaurants.is_featured = true/false
// Featured restaurants appear on home page hero section
```

---

## Sanctum Token Configuration

```php
// config/sanctum.php
'expiration' => 60 * 24 * 30,  // 30 days in minutes (null = never expire)

// For delivery partner / customer mobile-style sessions: longer expiry
// For admin / superadmin: shorter expiry for security (set separately via custom token abilities)
```

```php
// On login — issue token with expiry
$token = $user->createToken('auth_token', ['*'], now()->addDays(30));
return $this->success(['token' => $token->plainTextToken, 'user' => $user]);
```

---

## Route Guards (Frontend Implementation)

```jsx
// src/components/PrivateRoute.jsx
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

export function PrivateRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to their own panel home, not a generic 403
    const panelHome = {
      customer:           '/',
      restaurant_owner:   '/owner/dashboard',
      delivery_partner:   '/delivery/dashboard',
      admin:              '/admin/dashboard',
      superadmin:         '/superadmin/dashboard',
    }
    return <Navigate to={panelHome[user.role] ?? '/'} replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  if (!isAuthenticated) return children
  // Already logged in — send to their panel
  const home = { customer: '/', restaurant_owner: '/owner/dashboard',
                 delivery_partner: '/delivery/dashboard', admin: '/admin/dashboard',
                 superadmin: '/superadmin/dashboard' }
  return <Navigate to={home[user.role] ?? '/'} replace />
}
```

---

## Order Tracking — Status History

The `order_status_history` table powers the tracking timeline. Every status transition appends a row. `OrderService::updateStatus()` always writes to this table.

```php
// app/Services/OrderService.php
public function updateStatus(Order $order, string $newStatus, User $changedBy, ?string $note = null): void
{
    $order->update(['status' => $newStatus]);

    OrderStatusHistory::create([
        'order_id'   => $order->id,
        'status'     => $newStatus,
        'changed_by' => $changedBy->id,
        'note'       => $note,
    ]);

    broadcast(new OrderStatusChanged($order))->toOthers();

    // Credit loyalty points when delivered
    if ($newStatus === 'delivered') {
        $this->loyaltyService->credit($order);
        $this->earningsService->recordDeliveryEarning($order);
    }
}
```

Frontend tracking page reads `GET /api/orders/{id}` → response includes `status_history` array → renders animated vertical timeline.

---

## Order Total Formula (`OrderService::createFromCart`)

```php
// app/Services/OrderService.php
public function createFromCart(Request $request): Order
{
    $user    = $request->user();
    $address = Address::where('id', $request->address_id)->where('user_id', $user->id)->firstOrFail();

    // Rebuild cart from DB — never trust client-sent totals
    $cart  = Cart::where('user_id', $user->id)->with('items.menuItem')->firstOrFail();
    $items = $cart->items;

    if ($items->isEmpty()) abort(422, 'Cart is empty.');

    $restaurant = Restaurant::findOrFail($cart->restaurant_id);

    // 1. Subtotal — sum of item prices × quantities (use menu_items.price, not cart client value)
    $subtotal = $items->sum(fn($item) => $item->menuItem->price * $item->quantity);

    if ($subtotal < $restaurant->min_order_amount) {
        abort(422, "Minimum order amount is ₹{$restaurant->min_order_amount}.");
    }

    // 2. Delivery fee — from restaurant row (fixed per order)
    $deliveryFee = $restaurant->delivery_fee;

    // 3. Coupon discount
    $discountAmount = 0;
    $coupon = null;
    if ($request->coupon_code) {
        $coupon = $this->couponService->validate($request->coupon_code, $user, $subtotal);
        $discountAmount = $coupon->type === 'percentage'
            ? min($subtotal * $coupon->value / 100, $coupon->max_discount ?? PHP_INT_MAX)
            : min($coupon->value, $subtotal);
    }

    // 4. Loyalty discount — mutually exclusive with coupon
    $loyaltyDiscount = 0;
    $loyaltyPointsRedeemed = 0;
    if (!$coupon && $request->loyalty_points > 0) {
        [$loyaltyDiscount, $loyaltyPointsRedeemed] = $this->loyaltyService->calculateRedemption(
            $user, $request->loyalty_points, $subtotal
        );
    }

    // 5. Tax — on subtotal after discount (platform-wide GST)
    $taxRate      = (float) settings('tax_rate_pct'); // e.g. 5
    $taxableAmount = max(0, $subtotal - $discountAmount - $loyaltyDiscount);
    $taxAmount    = round($taxableAmount * $taxRate / 100, 2);

    // 6. Grand total
    $totalAmount = $taxableAmount + $deliveryFee + $taxAmount;

    DB::transaction(function () use (
        &$order, $user, $address, $restaurant, $items,
        $subtotal, $deliveryFee, $discountAmount, $loyaltyDiscount,
        $loyaltyPointsRedeemed, $taxAmount, $totalAmount, $coupon, $request
    ) {
        $order = Order::create([
            'order_number'              => $this->generateOrderNumber(),
            'user_id'                   => $user->id,
            'restaurant_id'             => $restaurant->id,
            'address_id'                => $address->id,
            'status'                    => 'pending',
            'payment_method'            => $request->payment_method,
            'payment_status'            => $request->payment_method === 'cod' ? 'pending' : 'paid',
            'razorpay_order_id'         => $request->rzp_order_id,
            'razorpay_payment_id'       => $request->rzp_payment_id,
            'razorpay_signature'        => $request->rzp_signature,
            'subtotal'                  => $subtotal,
            'delivery_fee'              => $deliveryFee,
            'discount_amount'           => $discountAmount,
            'loyalty_points_redeemed'   => $loyaltyPointsRedeemed,
            'loyalty_discount_amount'   => $loyaltyDiscount,
            'tax_amount'                => $taxAmount,
            'total_amount'              => $totalAmount,
            'coupon_id'                 => $coupon?->id,
        ]);

        // Snapshot order items at time of purchase (prices must not change retroactively)
        foreach ($items as $item) {
            OrderItem::create([
                'order_id'      => $order->id,
                'menu_item_id'  => $item->menu_item_id,
                'name'          => $item->menuItem->name,
                'price'         => $item->menuItem->price,
                'quantity'      => $item->quantity,
                'variant_label' => $item->variant_label,
                'subtotal'      => $item->menuItem->price * $item->quantity,
            ]);
        }

        if ($coupon) {
            CouponUsage::create(['coupon_id' => $coupon->id, 'user_id' => $user->id, 'order_id' => $order->id]);
            $coupon->increment('times_used');
        }

        if ($loyaltyPointsRedeemed > 0) {
            $this->loyaltyService->debit($user, $loyaltyPointsRedeemed, $order);
        }

        // First status history entry
        OrderStatusHistory::create(['order_id' => $order->id, 'status' => 'pending', 'changed_by' => $user->id]);

        // Clear cart
        $cart->items()->delete();
        $cart->delete();

        // Notify restaurant via Reverb
        broadcast(new NewOrderReceived($order))->toOthers();

        // Queue confirmation email
        Mail::to($user->email)->queue(new OrderConfirmed($order));
    });

    return $order;
}

private function generateOrderNumber(): string
{
    return 'ORD-' . now()->format('Ymd') . '-' . str_pad(
        Order::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT
    );
}
```

**Total formula summary:**
```
subtotal         = Σ (menu_item.price × quantity)  [from DB, not client]
deliveryFee      = restaurant.delivery_fee
discountAmount   = coupon discount (0 if none)
loyaltyDiscount  = points redeemed ÷ redeem_rate   (0 if coupon used)
taxableAmount    = subtotal − discountAmount − loyaltyDiscount
taxAmount        = taxableAmount × tax_rate_pct / 100
totalAmount      = taxableAmount + deliveryFee + taxAmount
```

---

## Change Password

```php
// AuthController::changePassword
public function changePassword(Request $request): JsonResponse
{
    $validated = $request->validate([
        'current_password' => 'required|string',
        'new_password'     => 'required|string|min:8|confirmed',  // new_password_confirmation required
    ]);

    if (!Hash::check($validated['current_password'], $request->user()->password)) {
        return response()->json(['message' => 'Current password is incorrect.'], 422);
    }

    $request->user()->update(['password' => Hash::make($validated['new_password'])]);

    // Revoke all other tokens — forces re-login on all other devices
    $request->user()->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

    return response()->json(['message' => 'Password changed successfully.']);
}
```

---

## Restaurant Weekly Operating Hours

The single `opening_time`/`closing_time` on the `restaurants` table handles uniform daily hours. For restaurants with different hours per day, add a `restaurant_hours` table:

```sql
CREATE TABLE restaurant_hours (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  day_of_week   TINYINT UNSIGNED NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  opening_time  TIME NOT NULL,
  closing_time  TIME NOT NULL,
  is_closed     BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'True = closed all day (e.g. public holiday)',
  UNIQUE KEY unique_day (restaurant_id, day_of_week),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

**Logic:** When a restaurant sets per-day hours, populate `restaurant_hours` (7 rows). When empty, fall back to `restaurants.opening_time`/`closing_time` as default schedule. `is_open` check:

```php
// RestaurantHours model helper
public static function isOpenNow(int $restaurantId, Restaurant $restaurant): bool
{
    $today = now()->dayOfWeek; // Carbon: 0=Sun, 6=Sat
    $hours = self::where('restaurant_id', $restaurantId)->where('day_of_week', $today)->first();

    if ($hours) {
        if ($hours->is_closed) return false;
        return now()->between(
            now()->setTimeFromTimeString($hours->opening_time),
            now()->setTimeFromTimeString($hours->closing_time)
        );
    }

    // Fallback to restaurant default hours
    return now()->between(
        now()->setTimeFromTimeString($restaurant->opening_time),
        now()->setTimeFromTimeString($restaurant->closing_time)
    );
}
```

Owner panel `Restaurant Settings` tab includes a **Weekly Hours** sub-section — 7 rows (Sun–Sat), each with open/close time pickers and a "Closed all day" toggle.

Routes:
```php
Route::get ('/restaurant/hours',        [RestaurantManageController::class, 'hours']);
Route::put ('/restaurant/hours',        [RestaurantManageController::class, 'updateHours']); // array of 7 day records
```

Add `RestaurantHour.php` to `app/Models/` and `restaurant_hours` to the project structure.

---

## Queue Setup

```bash
# Create queue tables (QUEUE_CONNECTION=database)
php artisan queue:table           # creates jobs table
php artisan queue:failed-table    # creates failed_jobs table
php artisan migrate

# Run worker
php artisan queue:work --queue=default,payments,notifications --tries=3 --backoff=5
```

```env
QUEUE_CONNECTION=database
QUEUE_FAILED_DRIVER=database-uuids
```

---

## Environment Setup

### Backend .env (real values structure)
```env
APP_NAME="RestaurantApp"
APP_ENV=local
APP_KEY=         # generated by: php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_TIMEZONE=Asia/Kolkata

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurant_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_root_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_reverb_app_id
REVERB_APP_KEY=your_reverb_app_key
REVERB_APP_SECRET=your_reverb_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

QUEUE_CONNECTION=database
MAIL_MAILER=smtp
FILESYSTEM_DISK=local
```

### Frontend .env
```env
VITE_API_URL=http://localhost:8000/api
# Razorpay key_id is public — safe to expose in frontend env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_REVERB_APP_KEY=your_reverb_app_key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### MySQL Setup
```sql
CREATE DATABASE restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON restaurant_db.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Dev Server Commands

```bash
# Terminal 1 — Laravel API
cd backend
php artisan serve --port=8000

# Terminal 2 — React frontend
cd frontend
npm run dev

# Terminal 3 — WebSocket server (real-time)
cd backend
php artisan reverb:start

# Terminal 4 — Queue worker (payments, notifications, mail)
cd backend
php artisan queue:work --queue=default,payments,notifications

# Terminal 5 — Storage symlink (run once)
cd backend
php artisan storage:link
```

---

## Development Sequence

| # | Task | Skills to Invoke | Days |
|---|---|---|---|
| 1 | Laravel init, DB migrations, Sanctum | `senior-fullstack` | 2 |
| 2 | Auth API (all 4 roles, role middleware) | `senior-fullstack` | 1 |
| 1b | CORS config, API response trait, axios interceptor, rate limiting, error boundary | `senior-fullstack` | 1 |
| 2b | Multi-tenancy: `CheckRestaurantOwner` middleware, `HasRestaurantScope` trait, all 5 Policies, route model binding, `AuditObserver` | `senior-fullstack` | 1 |
| 2c | Superadmin APIs: admin CRUD, commissions, audit logs, impersonation, financials, feature flags, platform settings | `senior-fullstack` | 2 |
| 3 | Restaurant + Menu + Category APIs | `senior-fullstack` | 3 |
| 4 | Cart + Order + Coupon + Favourites + Reorder APIs | `senior-fullstack` | 3 |
| 5 | Razorpay integration: initiate, verify (HMAC), webhook, COD flow, refund | `senior-fullstack` | 2 |
| 5b | Email notifications: all mail classes, queue jobs, scheduler, Intervention Image | `senior-fullstack` | 1 |
| 6 | Delivery Partner APIs | `senior-fullstack` | 2 |
| 7 | Owner: revenue + review APIs | `senior-fullstack` | 1 |
| 7b | Loyalty system: migrations, LoyaltyService, earn/redeem/expire logic | `senior-fullstack` | 2 |
| 8 | Admin: all admin APIs + loyalty config/bonus endpoints | `senior-fullstack` | 2 |
| 9 | Laravel Reverb setup + broadcast events | `senior-fullstack` | 1 |
| 10 | React init, Vite, Tailwind, design tokens | `react-vite-expert`, `tailwind-design-system` | 1 |
| 11 | Redux store setup, axios interceptors, auth flow | `react-vite-expert` | 1 |
| 12 | Design system: tokens, globals, base components | `impeccable`, `ui-design` | 1 |
| 13 | Auth pages (login, register, forgot, reset) | `impeccable`, `frontend-design` | 1 |
| 14 | Home page (hero, carousels, featured, offers) | `impeccable`, `framer-motion-animator` | 2 |
| 15 | Restaurant listing + filter + search | `impeccable`, `react-vite-dashboard` | 2 |
| 16 | Restaurant detail + full menu + variant modal | `impeccable`, `frontend-design` | 2 |
| 17 | Cart drawer + coupon + pricing breakdown | `impeccable`, `framer-motion-animator` | 2 |
| 18 | Checkout (address + Razorpay modal + COD option) | `impeccable`, `frontend-design` | 2 |
| 19 | Order tracking + timeline + status updates | `impeccable`, `framer-motion-animator` | 2 |
| 20 | Customer profile + addresses | `impeccable`, `frontend-design` | 1 |
| 20b | Loyalty profile page, checkout redemption toggle, earn chip on cards | `impeccable`, `framer-motion-animator` | 2 |
| 20c | Admin loyalty management page (config, tiers, bonus grant, leaderboard) | `impeccable`, `react-vite-dashboard` | 2 |
| 21 | Owner dashboard + live order feed | `impeccable`, `react-vite-dashboard` | 3 |
| 22 | Owner menu CRUD + image upload | `impeccable`, `frontend-design` | 2 |
| 23 | Owner reviews + revenue charts | `impeccable`, `ui-design` | 2 |
| 24 | Delivery partner panel (all screens) | `impeccable`, `sleek-design-mobile-apps` | 3 |
| 25 | Admin panel (all screens, charts, tables) | `impeccable`, `react-vite-dashboard` | 3 |
| 26 | Mobile-first responsive pass (all 5 panels) | `mobile-responsiveness`, `responsive-design` | 3 |
| 27 | Animations pass (transitions, micro-interactions) | `framer-motion-animator`, `impeccable` | 2 |
| 28 | Icon audit across all panels | `suggest-lucide-icons`, `icons-badges` | 1 |
| 29 | Performance: lazy loading, image WebP, code splitting | `react-vite-expert` | 1 |
| 30 | Superadmin panel (all 8 screens) | `impeccable`, `react-vite-dashboard` | 3 |
| 31 | Final QA: cross-device, real order flow end-to-end, all 5 roles | `impeccable` (`audit` command) | 2 |
| **Total** | | | **~66 days** |

---

## Impeccable Design Directives (Craft Floor)

These directives apply to every component written in this project.

### Absolute Rules
- No lorem ipsum. No "Coming soon". No disabled buttons with no explanation.
- Every empty state has an illustration (SVG inline), heading, and a primary action.
- Every loading state uses a skeleton that matches the content shape — no generic spinners for content areas.
- Touch targets minimum 44×44px on mobile — never smaller.
- Color contrast: body text ≥ 4.5:1, large text ≥ 3:1, against all backgrounds.
- Every form field has a visible label. Placeholder is supplemental, never the only label.
- Error states: red border + icon + message below the field. Never just a toast.
- Images always have width/height set — no layout shift on load.
- Font sizes: minimum 14px for any readable text; 12px only for legal/badge labels.

### Interaction Patterns
- Cart add button: immediate optimistic update + quantity badge pulse animation
- Restaurant card hover: lift (y: -4px) + shadow intensify, 200ms ease
- Page transitions: fade + 12px upward slide, 250ms
- Bottom sheet / drawer: spring animation, backdrop blur + dim
- Status badge: pill shape, brand-matched background tint, bold label
- Order timeline: vertical connector line with animated fill on status progress
- Skeleton: animated shimmer (left-to-right gradient sweep, 1.5s loop)

### Component Signatures
- **Primary Button**: `bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full px-6 py-3 shadow-brand active:scale-[0.97] transition-all`
- **Secondary Button**: `border-2 border-brand-500 text-brand-600 hover:bg-brand-50 font-semibold rounded-full px-6 py-3`
- **Veg Badge**: `w-4 h-4 border-2 border-accent-500 rounded-sm flex items-center justify-center` with green square inside
- **Non-Veg Badge**: same but `border-danger-500` with red triangle inside
- **Rating Chip**: `bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1`
- **Restaurant Card**: white bg, `shadow-card`, `rounded-xl`, hover lift, image with `aspect-video`, content padding `p-4`
- **Stat Card (dashboard)**: white bg, `rounded-xl shadow-card p-6`, large number in `font-display text-3xl`, label in `text-sm text-neutral-500`
