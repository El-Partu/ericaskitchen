# Plan: Erica's Kitchen — Next.js Frontend Setup

**TL;DR:** We'll set up a solid Next.js 16 (App Router) project structure for a food ordering app with both customer and admin sides in a single codebase, using route groups. Since the Express/MongoDB API is still being built, we'll start with mock data and local placeholder images. You'll export your Figma designs as HTML, paste them here, and I'll convert each screen into proper Next.js components following best practices.

## Steps

### 1. Project foundation

Set up the folder structure using Next.js route groups: `(user)` for the customer-facing app and `(admin)` for the admin panel, each with their own layout. This keeps them in one codebase but with separate layouts (customer gets a nice navbar + footer, admin gets a dashboard sidebar).

### 2. Shared component library

Create a `components/` directory with reusable UI components (buttons, cards, inputs, modals, etc.) shared across both sides. We'll follow a pattern of `components/ui/` for primitives and `components/shared/` for composed pieces like food cards, order summaries, etc.

### 3. Theming & design tokens

Update `app/globals.css` to define your brand colors, typography scale, spacing, and other design tokens using Tailwind v4's `@theme` system. Once you share the first HTML export, we'll extract the exact colors and fonts from Figma.

### 4. Mock data layer

Create a `lib/` directory with mock data files (menus, orders, users) and a data-fetching abstraction layer. When the Express API is ready, we just swap the mock functions for real `fetch()` calls — zero component changes needed.

### 5. Image setup

Configure `next.config.ts` to allow external image domains (for when the API serves images later). For now, place Figma-exported images in `public/images/` and reference them via `next/image` for automatic optimization.

### 6. Type definitions

Create a `types/` directory with TypeScript interfaces for your domain models (MenuItem, Order, User, Category, etc.). This catches bugs early and makes the codebase self-documenting.

### 7. Page-by-page conversion

As you paste each HTML export from Figma, I'll:

- Break it into reusable components
- Apply proper Tailwind classes (responsive + dark mode)
- Wire up `next/link` for navigation, `next/image` for images
- Add loading states and error boundaries where appropriate

## Folder structure preview

```
app/
  (user)/
    layout.tsx          ← customer layout (navbar, footer)
    page.tsx            ← home / landing
    menu/page.tsx       ← browse food
    cart/page.tsx       ← shopping cart
    orders/page.tsx     ← order history
  (admin)/
    layout.tsx          ← admin layout (sidebar, topbar)
    dashboard/page.tsx  ← admin overview
    orders/page.tsx     ← manage orders
    menu/page.tsx       ← manage menu items
components/
  ui/                   ← buttons, inputs, modals
  shared/               ← food cards, order rows, etc.
lib/
  mock-data.ts          ← temporary mock data
  api.ts                ← data fetching abstraction
types/
  index.ts              ← TypeScript interfaces
public/
  images/               ← placeholder images from Figma
```

## Verification

- `npm run build` passes with no errors after each step
- `npm run lint` stays clean
- Each page renders correctly at mobile, tablet, and desktop widths
- Navigation between pages works via `next/link` (no full page reloads)

## Decisions

- **Single codebase with route groups** over separate projects — simpler deployment, shared components
- **Mock data abstraction** over hardcoded values — painless API integration later
- **Local images now** over external — avoids dependency on unfinished API
- **Tailwind v4 (already installed)** — no need to add another CSS framework

## Next step

Export your first Figma screen as HTML (you can use plugins like "HTML Generator" or "Inspect" in Figma, or even just structure it as basic HTML by hand — it doesn't need to be perfect). Paste it here and I'll convert it into clean Next.js components. Start with whichever page feels most important — usually the home/landing page or the menu page.
