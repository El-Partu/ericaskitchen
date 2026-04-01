# Plan: Erica's Kitchen — Full API Integration & Frontend Completion

## TL;DR

The frontend is a **complete visual prototype** — 35+ components, 3 route groups, 11 pages — but has **zero backend integration**. No auth, no API calls, no payment flow, no persistent state. Every piece of data is hardcoded or mock. This plan bridges that gap in 6 staged milestones, starting with auth (highest priority), then ordering/payment, then admin, then polish. Soup/protein selections will be serialized into the order `notes` field. All three auth methods (email, Google, Apple) ship in stage 1.

---

## A. Gap Analysis — API vs. Frontend

### Fully Missing (no page or component exists)

| API Endpoint Group                                                                                                                                                                                    | Missing Page/Feature                                                  | Priority |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------- |
| `POST /auth/signup`                                                                                                                                                                                   | Signup page                                                           | Critical |
| `POST /auth/login`, `/auth/google`, `/auth/apple`                                                                                                                                                     | Login page                                                            | Critical |
| `POST /auth/forgot-password`                                                                                                                                                                          | Forgot password page                                                  | High     |
| `PATCH /auth/reset-password/:token`                                                                                                                                                                   | Reset password page                                                   | High     |
| `GET /auth/verify-email/:token`                                                                                                                                                                       | Email verification page                                               | High     |
| `GET /auth/me`, `PATCH /auth/update-profile`                                                                                                                                                          | Customer profile/settings page                                        | High     |
| `GET /addresses`, `POST /addresses`, etc.                                                                                                                                                             | Address management (page or modal)                                    | High     |
| `POST /orders`, `POST /payments/paystack/initialize`                                                                                                                                                  | Checkout + payment flow                                               | Critical |
| `PATCH /orders/confirm-all`, `PATCH /orders/:id/refresh-address`                                                                                                                                      | Admin order bulk confirm + address snapshot refresh                   | High     |
| `PATCH /orders/:id/capture-coordinates`, `PATCH /orders/:id/update-location`, `GET /orders/delivery/:id`, `GET /orders/dispatch-board`                                                                | Live delivery coordinate capture + rider/dispatch tracking            | High     |
| `GET /payments/paystack/verify/:ref`                                                                                                                                                                  | Payment callback/verification page                                    | Critical |
| `GET /orders/my`, `GET /orders/:id`, `PATCH /orders/:id/update-location`                                                                                                                              | Customer order history + detail pages + pre-dispatch location updates | High     |
| `POST /reservations`                                                                                                                                                                                  | Standalone reservation form (currently just links to Contact)         | Medium   |
| `GET /reservations/my`                                                                                                                                                                                | Customer "My reservations" view                                       | Medium   |
| `GET /admin/users`, `PATCH /admin/users/:id`                                                                                                                                                          | Admin user management page                                            | Medium   |
| `GET /admin/audit-logs`                                                                                                                                                                               | Admin audit log view                                                  | Low      |
| `GET /admin/settings`, `GET /admin/settings/:key`, `PATCH /admin/settings/orders`, `PATCH /admin/settings/reservations`, `PATCH /admin/settings/payments`, `GET/PATCH /admin/settings/processing-fee` | Runtime app configuration UI                                          | High     |
| `GET /admin/roles`, `PATCH /admin/roles/:id/permissions`                                                                                                                                              | Admin roles/permissions page                                          | Low      |
| `GET /testimonials`, `PATCH /testimonials/:id/moderate`                                                                                                                                               | Admin testimonial moderation page                                     | Low      |

### Partially Implemented (UI exists, no API wiring)

| Page                                              | What Exists                                                         | What's Missing                                                                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(user)/page.tsx` (Home)                      | Hero, About, MenuOfTheDay, MenuGrid, Testimonials — all mock data   | API calls to `GET /daily-specials/today`, `GET /menu-items?isFeatured=true`, `GET /testimonials/featured`                                                 |
| `app/(user)/menu/page.tsx`                        | Category tabs, MenuCard grid, favorites — mock `menuItems` array    | API calls to `GET /categories`, `GET /menu-items?category=X`, `POST /likes/:id`, pagination, search                                                       |
| `app/(user)/cart/page.tsx`                        | Cart context + CartPanel sidebar with quantity controls             | Server cart sync (`GET/POST/PATCH/DELETE /cart/*`), checkout flow, payment, delivery address picker                                                       |
| `app/(user)/contact/page.tsx`                     | ContactForm with `setTimeout` submission                            | Real form handler (no API endpoint defined — keep as email or add reservation form)                                                                       |
| `app/(user)/services/page.tsx`                    | ServiceCards, "Book Us" → `/contact`                                | Link "Make a Reservation" to actual reservation form instead of contact page                                                                              |
| `components/shared/Navbar.tsx`                    | Cart icon with badge, nav links                                     | Auth-aware state (login/signup buttons vs user avatar+dropdown), search functionality                                                                     |
| `components/shared/Footer.tsx` → `NewsletterForm` | Email input + toast                                                 | `POST /newsletter/subscribe` API call                                                                                                                     |
| `app/(admin)/admin/page.tsx`                      | OverviewCards, RecentActivity, RestaurantStatistics — all hardcoded | `GET /analytics/dashboard`, `GET /analytics/recent-activity`, `GET /reservations/upcoming`                                                                |
| `app/(admin)/admin/orders/page.tsx`               | OrdersTable with search/filter/pagination — local only              | `GET /orders` (paid only), `PATCH /orders/confirm-all`, `PATCH /orders/:id/refresh-address`, `PATCH /orders/:id/status`, `PATCH /orders/:id/assign-rider` |
| `app/(admin)/admin/menu/page.tsx`                 | MenuItemsTable with CRUD buttons → toast                            | `GET /menu-items`, `POST /menu-items`, `PATCH /menu-items/:id`, `DELETE /menu-items/:id`                                                                  |
| `app/(admin)/admin/reservations/page.tsx`         | ReservationsTable + sidebar — hardcoded                             | `GET /reservations`, `PATCH /reservations/:id/status`, `POST /reservations`                                                                               |
| `app/(admin)/admin/settings/page.tsx`             | SettingsForm — hardcoded values                                     | `GET /admin/profile`, `PATCH /admin/profile`, `PATCH /auth/update-password`, runtime settings APIs (`/admin/settings/*`)                                  |
| `app/(admin)/admin/tracking/page.tsx`             | LiveOrderPanel + gray map placeholder                               | `GET /orders/dispatch-board`, `GET /orders/delivery/:id`, `PATCH /orders/:id/capture-coordinates`, real map integration, real-time polling                |
| `app/(customer)/dashboard/page.tsx`               | LiveOrderTracker + LoyaltyPointsCard + RecentOrdersGrid — hardcoded | `GET /orders/my`, loyalty system (not in API — show as placeholder or remove)                                                                             |

### Not Implemented At All (infrastructure)

| Concern                                               | Status         |
| ----------------------------------------------------- | -------------- |
| API client (fetch/axios wrapper with `X-API-Key`)     | Does not exist |
| Auth context/provider                                 | Does not exist |
| Cookie-based JWT token handling                       | Does not exist |
| 401 → auto-refresh interceptor                        | Does not exist |
| Route protection middleware                           | Does not exist |
| Server-side data fetching (Next.js Server Components) | Not used       |
| React Query / SWR for cache + revalidation            | Not installed  |
| Form validation (Zod + react-hook-form)               | Not installed  |
| Loading states / skeleton screens                     | Does not exist |
| Error boundaries                                      | Does not exist |
| Image domain config for Cloudinary URLs               | Not configured |

---

## B. User Flow Analysis & Redesign

### B1. Meal Ordering Flow

**Current (broken):**

```
/ → "View Menu" → /menu → add items (client context only) → /cart →
  enter name+phone → "Confirm Order" → toast → cart cleared → dead end
```

**Problems:**

1. No authentication — anonymous ordering with no account
2. No delivery address selection (hardcoded "Akuafo Main Hall")
3. No order creation (`POST /orders`) — just a toast
4. No payment step — jumps straight from cart to "confirmed"
5. No order confirmation with order number
6. No post-order tracking — user hits a dead end
7. Cart lost on page refresh (in-memory only)
8. `CartPanel.tsx` has a hardcoded Order ID `#1099`
9. `notes` textarea label exists but no actual `<textarea>` element (line 234 in CartPanel.tsx)
10. Soup/protein customizations exist client-side but have no API representation

**Proposed flow:**

```
/ → "View Menu" → /menu (API data, pagination, search)
  → add items → SoupProteinModal if needed → client cart updates
  → /cart (CartPanel sidebar)
  → [if not logged in] → prompt login/signup → /login → back to /cart
   → Select delivery address (from saved addresses or add one first)
   → Review selected address + items + totals
  → "Proceed to Checkout" → /checkout
         → Order summary, selected address, payment method selection
         → "Place Order" → POST /orders with `addressId` + payment method + notes (soup/protein serialized into notes)
      → If mobile_money/card → POST /payments/paystack/initialize → redirect to Paystack
      → If cash_on_delivery → skip payment redirect
  → [Paystack callback] → /payment/callback?reference=X → verify payment
  → /orders/:id (order confirmation + live tracking)
  → Link to /dashboard for ongoing tracking
```

**Key design changes to `CartPanel.tsx`:**

- Replace hardcoded address with address picker dropdown (from `GET /addresses` + "Add new address" option)
- If no saved address exists, block checkout and show "Add address first" CTA
- Remove hardcoded `Order ID: #1099`
- Add actual `<textarea>` for notes field
- Serialize soup/protein as text in notes (e.g., "Soup: Light Soup | Proteins: Tilapia, Chicken")
- Change "Confirm Order" → "Proceed to Checkout" (navigates to `/checkout`)
- Show login prompt for unauthenticated users before checkout

### B2. Authentication Flow

**Current:** No auth at all. Admin / customer dashboards are unprotected. Hardcoded users.

**Proposed flow:**

```
Public browsing → can view menu, services, contact without login
  → Action requiring auth (add to cart / checkout / view orders)
  → /login (email+password, Google, Apple buttons)
  → Cookie set automatically → redirect back to intended page
  → Navbar shows user avatar + dropdown (Profile, My Orders, My Reservations, Logout)

Admin access:
  → /login → authenticated as user with admin role → /admin
  → Admin layout verifies role permissions → shows dashboard
  → Missing permission → 403 page or redirect
```

### B3. Reservation Flow

**Current:** Services page "Book Us" → Contact page (generic form). No actual reservation.

**Proposed flow:**

```
/services → "Make a Reservation" → /reservations/new (or modal on /services)
  → Reservation form: name, email, phone, date, time, party size, special requests
  → POST /reservations → confirmation page with reservation number
  → [if logged in] → visible in /dashboard or /reservations
```

### B4. Customer Dashboard Flow

**Current:** `/dashboard` exists but is isolated — no navigation links to it, all hardcoded.

**Proposed flow:**

```
Navbar user dropdown → "Dashboard" → /dashboard
  → LiveOrderTracker (real data from GET /orders/my, latest active order)
  → RecentOrdersGrid (real data, "Reorder" → adds items to cart)
  → Link to /orders (full order history)
  → Link to /profile (settings)
  → Link to /reservations (my reservations)
```

### B5. Admin Flow

**Current:** All pages render hardcoded data. No auth check. Inconsistent data (Italian food names + USD in admin vs Ghanaian food + GHS in customer views).

**Proposed flow:**

```
/login → user with admin role → redirect to /admin
  → Dashboard: real KPIs from GET /analytics/dashboard
   → Orders: paid-order queue, status update actions, rider assignment, bulk confirm, address snapshot refresh
  → Menu: real items from same DB, CRUD with forms/modals
  → Reservations: real data, status management
   → Settings: real profile load + password change + runtime config sections (`orders`, `reservations`, `payments`, `processing-fee`)
   → Tracking: dispatch board + rider delivery detail + coordinate capture (interactive map UX deferred)
  → New: /admin/users for user management
```

---

## C. Staged Implementation Roadmap

---

### Stage 1: Foundation + Auth (Priority: Critical)

**Goal:** Install core libraries, set up API client, implement full auth flow, protect routes.

**Steps:**

1. **Install dependencies** — `axios`, `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers`, `js-cookie` (for reading non-httpOnly flags if needed), `@react-oauth/google`, auth-related packages
2. **Create API client** at `lib/api.ts` — Axios instance with `baseURL`, `withCredentials: true`, `X-API-Key` header, 401 interceptor calling `POST /auth/refresh`
3. **Create auth context** at `lib/auth-context.tsx` — `AuthProvider` wrapping the app in `app/layout.tsx`, stores `user` from `GET /auth/me`, exposes `login()`, `signup()`, `logout()`, `isAuthenticated`, `isAdmin`, `user`
4. **Update** `app/layout.tsx` — wrap children in `QueryClientProvider` + `AuthProvider`
5. **Create auth pages** under new `(auth)` route group:
   - `app/(auth)/login/page.tsx` — email+password form, Google/Apple sign-in buttons
   - `app/(auth)/signup/page.tsx` — registration form with password confirmation
   - `app/(auth)/forgot-password/page.tsx` — email input
   - `app/(auth)/reset-password/[token]/page.tsx` — new password form
   - `app/(auth)/verify-email/[token]/page.tsx` — auto-verifies on mount
   - `app/(auth)/layout.tsx` — centered card layout, no navbar/footer
6. **Create route protection** — `lib/auth-guard.tsx` component or middleware in `middleware.ts` that redirects unauthenticated users away from protected pages (`/cart` checkout actions, `/dashboard`, `/admin/*`)
7. **Update** `components/shared/Navbar.tsx` — conditionally show Login/Signup buttons vs user avatar dropdown (Profile, My Orders, Dashboard, Logout). Show admin link if user has admin role
8. **Update** `app/(admin)/layout.tsx` — verify auth + admin role, redirect to `/login` if not authenticated, show real profile data in header
9. **Update** `app/(customer)/layout.tsx` — verify auth, show real user name in `CustomerTopBar`
10. **Configure** `next.config.ts` — add Cloudinary and other image domains to `images.remotePatterns`
11. **Create `.env.local`** — `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_CLIENT_ID`

**Verification:**

- Signup → verify email → login with email/password → see user in Navbar → logout → session cleared
- Google/Apple sign-in → creates account + logs in
- Visit `/admin` when not admin → redirected to `/login`
- Visit `/dashboard` when not logged in → redirected to `/login`
- 401 on any request → auto-refresh → retry succeeds

---

### Stage 2: Ordering Flow — Menu → Cart → Checkout → Payment (Priority: Critical)

**Goal:** End-to-end ordering from menu browsing through payment completion.

**Steps:**

1. **Update types** in `types/index.ts` — add all API data models: `APIMenuItem`, `APICategory`, `APIOrder`, `APIPayment`, `APIAddress`, `APICart`, `APIDailySpecial`, `APITestimonial`, `APIReservation`, `APIPagination`. Keep existing client-side types for backward compatibility during migration
2. **Create data hooks** in `lib/hooks/` using React Query:
   - `useCategories()` → `GET /categories`
   - `useMenuItems(filters)` → `GET /menu-items?...`
   - `useMenuItem(idOrSlug)` → `GET /menu-items/:id` or `/slug/:slug`
   - `useDailySpecials()` → `GET /daily-specials/today`
   - `useCart()` → `GET /cart` (server-side), mutations for add/remove/update
   - `useAddresses()` → `GET /addresses`, with CRUD mutations
   - `useOrders()` → `GET /orders/my`
   - `useOrder(id)` → `GET /orders/:id`
   - `useUpdateOrderLocation(id)` → `PATCH /orders/:id/update-location` (customer-only)
   - `useLikeStatus(menuItemId)` → `GET /likes/:id/status`
   - `useToggleLike()` → `POST /likes/:menuItemId`
3. **Refactor cart to hybrid model** — update `lib/cart-context.tsx`:
   - If user is authenticated: sync with server cart (`GET /cart`, `POST /cart/items`, etc.)
   - If user is anonymous: keep local cart in `localStorage` (persist across refreshes)
   - On login: merge local cart into server cart
   - Soup/protein selections stored client-side and serialized into order `notes` on checkout
4. **Update** `app/(user)/menu/page.tsx`:
   - Fetch categories from API (replace hardcoded `MenuCategory` union)
   - Fetch menu items from API with sorting, filtering, pagination
   - Add search input (uses `GET /menu-items?search=X`)
   - Wire up favorite/like toggle to `POST /likes/:menuItemId` (requires auth; prompt login if not)
   - Add loading skeletons for menu cards
5. **Update** `components/shared/MenuCard.tsx` — adapt to API `MenuItem` shape (`images[]` array, `category` as object, `averageRating`, `likes` count)
6. **Update** `components/shared/CategoryTabs.tsx` — render categories from API instead of hardcoded 4-item union
7. **Refactor** `app/(user)/cart/page.tsx`:
   - Left side: keep menu browsing (but use API data)
   - Right side: CartPanel connected to server cart
8. **Refactor** `components/shared/CartPanel.tsx`:
   - Replace hardcoded address → address picker dropdown (from `GET /addresses` + "Add new address" option)
   - Remove hardcoded `Order ID: #1099`
   - Add actual `<textarea>` for notes field (fix missing input at line 234)
   - Change "Confirm Order" → "Proceed to Checkout" → navigates to `/checkout`
   - Show "Login to checkout" button if not authenticated
9. **Create checkout page** at `app/(user)/checkout/page.tsx`:
   - Order summary (items, quantities, totals)
   - Delivery address (selected saved address, or create one first)
   - Payment method selection (Mobile Money / Card / Cash on Delivery)
   - Order notes (with serialized soup/protein info prepended)
   - "Place Order" → `POST /orders` with `{ addressId?, paymentMethod, notes }` → on success:
     - If `mobile_money` or `card` → `POST /payments/paystack/initialize` → redirect to `authorizationUrl`
     - If `cash_on_delivery` → navigate to order confirmation
   - Handle settings-driven payment constraints (e.g., card/paystack disabled) with user-facing fallback message
10. **Create payment callback page** at `app/(user)/payment/callback/page.tsx`:
    - Reads `reference` from URL params
    - Calls `GET /payments/paystack/verify/:reference`
    - Shows success/failure state → link to order detail
11. **Create order confirmation/detail page** at `app/(user)/orders/[id]/page.tsx`:
    - Displays order number, items, status, delivery info
    - Status timeline (reusable for customer dashboard tracker)

- Add "Update delivery location" action for eligible unpaid pre-dispatch orders via `PATCH /orders/:id/update-location`

12. **Create order history page** at `app/(user)/orders/page.tsx`:
    - Lists user's orders from `GET /orders/my` with status filters + pagination
    - Each order links to detail page

**Verification:**

- Browse `/menu` → items load from API with categories, pagination, search
- Add to cart → item appears in cart (persisted on refresh via localStorage or server)
- Go to `/cart` → see items → "Proceed to Checkout" → `/checkout` page
- Try checkout without any saved address → blocked with guidance to add address
- Place order with card → redirected to Paystack → complete → callback verifies → order confirmed
- Visit `/orders` → see order history → click order → detail page with status
- For eligible orders, customer can update location; non-eligible orders show disabled state + API-driven reason

---

### Stage 3: Customer Dashboard & Profile (Priority: High)

**Steps:**

1. **Create customer profile page** at `app/(customer)/profile/page.tsx` — name, email, phone, avatar from `GET /auth/me`, edit via `PATCH /auth/update-profile`, password change via `PATCH /auth/update-password`
2. **Create address management** at `app/(customer)/addresses/page.tsx` — list, add, edit, delete, set default address (`GET/POST/PATCH/DELETE /addresses`)
3. **Update** `app/(customer)/dashboard/page.tsx`:
   - `LiveOrderTracker` → real data from `GET /orders/my?status=pending,confirmed,preparing,out_for_delivery&limit=1`
   - `RecentOrdersGrid` → real data from `GET /orders/my?limit=9`
   - "Reorder" button → adds all items from that order to cart
   - `LoyaltyPointsCard` → show placeholder "Coming Soon" (no loyalty API endpoint)
4. **Create customer reservations page** at `app/(customer)/reservations/page.tsx` — `GET /reservations/my`, cancel action
5. **Create reservation form page** at `app/(user)/reservations/new/page.tsx` — `POST /reservations` (no auth required); treat party size/time constraints as server-config-driven and surface API validation messages directly
6. **Update** `app/(user)/services/page.tsx` — "Make a Reservation" links to `/reservations/new` instead of `/contact`
7. **Add sidebar nav** to `(customer)` layout — Dashboard, My Orders, My Reservations, Addresses, Profile, Logout
8. **Wire up** `components/shared/NewsletterForm.tsx` → `POST /newsletter/subscribe`

**Verification:**

- Customer dashboard shows real active order and recent orders
- Profile page loads real user data, edits save successfully
- Address management works end-to-end (used during checkout)
- Reservation form submits, appears in "My Reservations"

---

### Stage 4: Public Pages — Real Data (Priority: High)

**Steps:**

1. **Update** `app/(user)/page.tsx` (Home page):
   - `MenuOfTheDay` → `GET /daily-specials/today`
   - `MenuGrid` → `GET /menu-items?isFeatured=true&limit=6`
   - `TestimonialsSection` → `GET /testimonials/featured`
   - Add loading skeletons for each section
2. **Update** `components/shared/MenuOfTheDay.tsx` — fetch from API, display real daily specials with menu item images
3. **Update** `components/shared/MenuGrid.tsx` — fetch featured items from API
4. **Update** `components/shared/TestimonialsSection.tsx` — fetch from API, show ratings, user names
5. **Update** `components/shared/LocationBar.tsx` — if logged in, show user's default address; else show generic location. Make order type dropdown functional
6. **Add testimonial submission** — allow logged-in users to leave reviews (link on order detail page or menu item page → `POST /testimonials`)

**Verification:**

- Home page loads real daily specials, featured items, and testimonials
- Loading skeletons appear while data fetches
- Newsletter subscription works end-to-end

---

### Stage 5: Admin Panel — Real Data + CRUD (Priority: Medium)

**Steps:**

1. **Create admin data hooks** in `lib/hooks/admin/`:
   - `useAnalyticsDashboard()`, `useRevenueChart()`, `useRecentActivity()`
   - `useAdminOrders(filters)`, `useUpdateOrderStatus()`, `useAssignRider()`, `useConfirmAllOrders()`, `useRefreshOrderAddress()`
   - `useDispatchBoard(filters)`, `useDeliveryOrder(orderId)`, `useCaptureOrderCoordinates()`, `useUpdateCustomerOrderLocation()`
   - `useAdminMenuItems(filters)`, `useCreateMenuItem()`, `useUpdateMenuItem()`, `useDeleteMenuItem()`
   - `useAdminReservations(filters)`, `useUpdateReservationStatus()`
   - `useAdminUsers(filters)`, `useUpdateUser()`
   - `useAdminProfile()`
   - `useAdminSettings()`, `useAdminSetting(key)`, `useUpdateOrderSettings()`, `useUpdateReservationSettings()`, `useUpdatePaymentSettings()`, `useProcessingFee()`, `useUpdateProcessingFee()`
2. **Update** `app/(admin)/admin/page.tsx` — wire `OverviewCards`, `RecentActivity`, `RestaurantStatistics`, `UpcomingReservations` to analytics API
3. **Update** `app/(admin)/admin/orders/page.tsx` — paid-orders list, status update dropdowns, rider assignment, bulk confirm, refresh-address action, pagination with URL params
4. **Update** `app/(admin)/admin/menu/page.tsx`:
   - Load real menu items (fix inconsistency: currently shows Italian food in USD)
   - Create/Edit modal or drawer with form validation (`POST /menu-items`, `PATCH /menu-items/:id`)
   - Delete with confirmation dialog
   - Wire `AvailabilityPanel` toggles to `PATCH /menu-items/:id` for `isAvailable`
5. **Update** `app/(admin)/admin/reservations/page.tsx` — real data, status update actions (confirm, seat, complete, cancel, no-show)
6. **Update** `app/(admin)/admin/settings/page.tsx` — profile/password plus runtime configuration management (`GET /admin/settings`, `GET /admin/settings/:key`, `PATCH /admin/settings/orders`, `PATCH /admin/settings/reservations`, `PATCH /admin/settings/payments`, `GET/PATCH /admin/settings/processing-fee`) with super-admin gating
7. **Create admin user management page** at `app/(admin)/admin/users/page.tsx` — user list with search/filter, role assignment, activate/deactivate
8. **Update** `app/(admin)/admin/tracking/page.tsx` — wire real dispatch data (`GET /orders/dispatch-board`), order detail (`GET /orders/delivery/:id` with `delivery:read` permission), coordinate capture (`PATCH /orders/:id/capture-coordinates`), and customer location updates (`PATCH /orders/:id/update-location`) while keeping advanced map UX deferred
9. **Add nav tab** for "Users" in `app/(admin)/layout.tsx`
10. **Fix data consistency** — remove all hardcoded Italian food names and USD values from admin components; all data comes from API in GHS

**Verification:**

- Admin dashboard shows real KPIs from analytics API
- Orders: view, filter, update status, assign rider — all persisted
- Orders: bulk confirm + refresh-address + dispatch tracking flows are all functional
- Menu: create, edit, delete items — reflected on customer-facing menu
- Reservations: status management works end-to-end
- Settings: profile updates plus runtime configuration changes persist and affect downstream UX

---

### Stage 6: Polish, Error Handling, & Advanced Features (Priority: Medium-Low)

**Steps:**

1. **Global error boundary** — create `app/error.tsx` and `app/not-found.tsx` with branded error pages
2. **Loading states** — add `loading.tsx` files per route segment with skeleton screens matching the actual layout
3. **Toast standardization** — replace all "fake" toasts (toast-only buttons) with real success/error feedback from API responses
4. **Mobile responsiveness audit**:
   - Navbar: hamburger menu + mobile nav drawer
   - Cart: mobile bottom sheet or full-page cart view (fix the non-functional floating cart FAB on `/cart`)
   - Admin: responsive table → card view on mobile (or restrict admin to desktop)
5. **Search functionality** — wire Navbar search button to a search overlay/page using `GET /menu-items?search=X`
6. **SEO metadata** — add per-page `metadata` exports (title, description, OpenGraph) for all public pages
7. **Image optimization** — configure `next.config.ts` `images.remotePatterns` for Cloudinary/S3 URLs, add `blur` placeholders
8. **Static pages** — create `/privacy`, `/terms` pages (currently 404 from footer links)
9. **Admin audit logs page** at `app/(admin)/admin/audit-logs/page.tsx` — `GET /admin/audit-logs`
10. **Admin roles/permissions page** at `app/(admin)/admin/roles/page.tsx` — `GET /admin/roles`, `PATCH /admin/roles/:id/permissions`
11. **Admin testimonial moderation** — add to existing admin flow or new page
12. **Real-time features** (optional) — polling or WebSocket for admin live order tracking and customer `LiveOrderTracker`
13. **Accessibility audit** — keyboard navigation, ARIA labels, focus management on modals/drawers

**Verification:**

- Error pages render for 404s and API failures
- All pages have loading skeletons
- Mobile layouts are usable on 375px+ screens
- Footer links to privacy/terms resolve
- Admin audit logs and role management functional

---

## D. Key Decisions

- **Soup/protein selection:** Kept client-side, serialized as text in order `notes` field (e.g., `"Customizations — Soup: Light Soup | Proteins: Tilapia, Chicken"`) since the API cart/order schema has no dedicated fields for this
- **Auth priority:** Auth ships first (Stage 1) because the ordering flow, cart sync, and all admin features depend on it
- **Cart persistence:** Hybrid model — anonymous users get `localStorage` persistence; authenticated users get server-side cart via `GET/POST /cart` API; local cart merges into server cart on login
- **HeroCarousel:** Exists as a component but is unused — will replace static `HeroSection` on the home page in Stage 4 for dynamic content
- **Loyalty points:** API has no loyalty endpoint — `LoyaltyPointsCard` in customer dashboard will show "Coming Soon" placeholder
- **Map integration:** Data integration ships in Stage 5 via dispatch/tracking endpoints; full interactive map UX remains deferred to Stage 6+
- **Settings-driven behavior:** Ordering, reservations, payment methods, and processing fees are runtime-configurable via `/admin/settings/*`; frontend must treat these as dynamic, not hardcoded
- **v2 endpoint-first implementation:** plan assumes v2 contracts/endpoints as source of truth (`addressId` checkout payload, dispatch/tracking endpoints, and admin runtime settings APIs)
- **Promo codes:** The `CartPanel` has a promo code input but the API has no promo/coupon endpoint — keep the UI, wire it when API supports it (or remove)
- **Contact form:** No API endpoint for contact form submission — keep the current form, connect to an email service (e.g. Resend, SendGrid) or a future API endpoint
