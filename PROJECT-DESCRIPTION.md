# 📋 Shwapno Puron (স্বপ্ন পূরণ) — Complete Project Description

> **Bengali fashion e-commerce store** — ঐতিহ্যবাহী কারুশিল্পের সাথে আধুনিক ফ্যাশনের মেলবন্ধন। প্রিমিয়াম সালোয়ার কামিজ, শাড়ি ও লেহেঙ্গা এর জন্য একটি full-featured অনলাইন স্টোর।

**GitHub Repository**: [starblackgameryt-cell/Shwapno-Puron.Web](https://github.com/starblackgameryt-cell/Shwapno-Puron.Web)

---

## 🎯 Project Overview

এই project টি একটি **production-ready Bengali fashion e-commerce website**। Customer রা product browse করতে পারবে, cart এ add করতে পারবে, order place করতে পারবে, আর admin dashboard থেকে store owner সব পরিচালনা করতে পারবেন। পুরো UI Bengali ভাষায়, যেটা Bangladesh এর local customer দের জন্য perfect।

### 🌟 Key Highlights
- ✅ **Full-stack Next.js 16** application (App Router + Turbopack)
- ✅ **Bengali language UI** (Bn-BD locale, Bengali numerals, Bengali dates)
- ✅ **Dual authentication** — User (email/password + Google OAuth) + Admin
- ✅ **Cloud database** — Turso (libSQL) for serverless deployment
- ✅ **Responsive design** — mobile-first, desktop-friendly
- ✅ **Production-ready** — deployed on Vercel

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** (App Router) | React framework with SSR/SSG |
| **TypeScript 5** | Type-safe code |
| **React 19** | UI library |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** (New York style) | Component library |
| **Framer Motion** | Animations & transitions |
| **Zustand** | Client state management (cart, view state) |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | REST API endpoints |
| **Prisma ORM 6** | Database ORM |
| **Turso (libSQL)** | Cloud SQLite database (production) |
| **SQLite** | Local database (development) |
| **NextAuth.js v4** | Google OAuth authentication |
| **Custom Session Auth** | Email/password + Admin auth (scrypt hashing) |
| **Nodemailer** | Email sending (password reset, notifications) |

### Deployment & Tooling
| Tool | Purpose |
|------|---------|
| **Vercel** | Production hosting |
| **Turso** | Cloud database |
| **Bun** | Package manager & runtime |
| **ESLint 9** | Code linting |
| **Prisma CLI** | Database migrations & seeding |

---

## 📁 Project Structure

```
Shwapno-Puron.Web/
├── prisma/
│   └── schema.prisma              # Database schema (13 models)
├── public/
│   └── images/
│       ├── hero.png               # Hero section image
│       ├── about.png              # About section image
│       ├── products/              # Product images (8 products)
│       └── showcase/              # Fashion showcase gallery (4 images)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (Bengali font, AuthProvider)
│   │   ├── page.tsx               # Home page (SPA-style view router)
│   │   ├── globals.css            # Global styles + Tailwind
│   │   ├── login/                 # User login page
│   │   ├── signup/                # User registration page
│   │   ├── forgot-password/       # Password reset request
│   │   ├── reset-password/        # Password reset form
│   │   ├── account/               # User account dashboard
│   │   ├── admin/                 # Admin dashboard (protected)
│   │   └── api/                   # 35 API routes (see below)
│   ├── components/
│   │   ├── fashion/               # 13 business components (see below)
│   │   ├── ui/                    # 40+ shadcn/ui components
│   │   └── auth-provider.tsx      # NextAuth SessionProvider wrapper
│   ├── hooks/
│   │   ├── use-mobile.ts          # Mobile viewport detection
│   │   ├── use-toast.ts           # Toast notifications
│   │   └── useSiteContent.ts      # Site content (hero, footer) from API
│   ├── lib/
│   │   ├── db.ts                  # Prisma client (Turso + SQLite support)
│   │   ├── auth.ts                # Password hashing, sessions, tokens
│   │   └── utils.ts               # shadcn/ui utility (cn function)
│   ├── store/
│   │   └── useStore.ts            # Zustand store (cart, views)
│   ├── types/
│   │   └── next-auth.d.ts         # NextAuth type augmentation
│   └── middleware.ts              # Route protection (admin, user routes)
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                    # Vercel deployment config
├── prisma/schema.prisma
└── .env.example                   # Environment variables template
```

---

## 🗄️ Database Schema (13 Models)

Database: **Turso (libSQL)** — cloud-hosted SQLite

### Core Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **Product** | Fashion products | name, price, category, image, colors, sizes, fabric, featured, rating, stock |
| **Review** | Customer reviews | productId (FK), name, rating, comment, date |
| **Order** | Customer orders | customerName, phone, address, products, totalAmount, paymentMethod, paymentStatus, orderStatus, userId? |
| **Newsletter** | Email subscribers | email (unique) |

### User & Auth Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Customer accounts | name, email (unique), password, phone, avatar, googleId?, favorites, emailVerified |
| **UserSession** | User login sessions | userId (FK), token (unique), expiresAt |
| **Admin** | Admin accounts | email (unique), password (hashed), name |
| **AdminSession** | Admin login sessions (2hr expiry) | adminId (FK), token (unique), ipAddress, userAgent, expiresAt |
| **PasswordReset** | Password reset tokens | userId (FK), token (unique), expiresAt, used |

### Configuration Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **SiteContent** | Dynamic site content (key-value) | key (unique), value |
| **PaymentMethod** | Payment options (bKash, Nagad, etc.) | name, number, text, link, icon, color, sortOrder, isActive |
| **ContactMethod** | Contact channels (WhatsApp, Messenger) | name, number, text, link, icon, color, sortOrder, isActive |
| **AdminNotification** | Admin activity notifications | type, message, details, isRead |

---

## 🎨 Frontend Components (13 Fashion Components)

### Page Sections
| Component | Purpose |
|-----------|---------|
| `Navbar.tsx` | Sticky navigation with cart, account, list (wishlist) buttons |
| `HeroSection.tsx` | Landing hero with brand intro & CTA |
| `FeaturedCollection.tsx` | Featured products carousel |
| `AboutBrand.tsx` | Brand story section |
| `FashionShowcase.tsx` | Image gallery showcase |
| `ProductGrid.tsx` | Full product grid with filters |
| `Footer.tsx` | Footer with links, contact info, newsletter signup |
| `FloatingContact.tsx` | Floating WhatsApp/contact buttons |

### Product & Cart
| Component | Purpose |
|-----------|---------|
| `ProductDetail.tsx` | Product detail page (colors, sizes, quantity, reviews) |
| `CheckoutPage.tsx` | Checkout form (customer info, payment selection) |
| `ListSidebar.tsx` | Slide-out cart/sidebar (wishlist + cart items) |
| `CartSidebar.tsx` | Cart sidebar variant |
| `ScrollReveal.tsx` | Scroll-triggered animation wrapper |

---

## 🔌 API Routes (35 Endpoints)

### Public APIs (no auth required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/products` | List all products |
| GET | `/api/products/[id]` | Get single product with reviews |
| POST | `/api/products/[id]/reviews` | Submit a product review |
| GET | `/api/payment-methods` | List active payment methods |
| GET | `/api/contact-methods` | List active contact methods |
| GET | `/api/site-content` | Get site content (hero, footer text) |
| POST | `/api/newsletter` | Subscribe to newsletter |
| POST | `/api/orders` | Place an order |
| POST | `/api/seed` | Initialize database with sample data |

### User Auth APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login (email/password) |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/change-password` | Change password (auth required) |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/verify-email` | Verify email address |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/google/status` | Check Google OAuth config status |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth.js handler |

### User Protected APIs (`/api/users/*`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/api/users/profile` | Get/update user profile |
| GET | `/api/users/orders` | List user's orders |
| GET/POST/DELETE | `/api/users/favorites` | Manage wishlist |

### Admin APIs (`/api/admin/*` — admin auth required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST/DELETE | `/api/admin/auth` | Admin login/logout |
| GET | `/api/admin/verify` | Verify admin session |
| GET/POST/PUT/DELETE | `/api/admin/products` | CRUD products |
| GET | `/api/admin/orders` | List all orders |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/notifications` | List admin notifications |
| POST | `/api/admin/notify-login` | Record login attempt |
| POST | `/api/admin/create-session` | Create admin session |
| GET/POST/PUT/DELETE | `/api/admin/payment-methods` | CRUD payment methods |
| GET/POST/PUT/DELETE | `/api/admin/contact-methods` | CRUD contact methods |

---

## 👥 User Roles & Features

### 🛍️ Customer (User) Features
- Browse products by category (সালোয়ার কামিজ, শাড়ি, লেহেঙ্গা, কুর্তা, ঘারারা, শারারা)
- View product details (images, colors, sizes, fabric, reviews)
- Add products to cart/wishlist
- Checkout with cash-on-delivery or online payment (bKash, Nagad, Rocket, bank)
- Register/login (email + password, or Google OAuth)
- View order history
- Manage favorites/wishlist
- Email verification & password reset
- Subscribe to newsletter

### 🔐 Admin Features
- Secure admin login (2-hour session, hashed passwords with scrypt)
- Dashboard with statistics (total products, orders, revenue, users)
- Product management (CRUD — add, edit, delete products)
- Order management (view all orders, update status)
- Payment methods management (configure bKash, Nagad, etc.)
- Contact methods management (WhatsApp, Messenger links)
- Site content management (hero text, footer info)
- Login notifications & activity log (failed login attempts tracked)
- Admin notifications system

---

## 🔐 Authentication System

### Three-Layer Auth

1. **NextAuth.js (Google OAuth)**
   - `/api/auth/[...nextauth]` — NextAuth handler
   - Google Provider with consent prompt
   - JWT session strategy (7-day expiry)
   - Dynamic origin detection (works behind proxies)

2. **Custom User Auth (Email/Password)**
   - `/api/auth/login`, `/api/auth/signup`
   - Password hashing: `scrypt` (Node.js crypto)
   - Session tokens stored in `UserSession` table (7-day expiry)
   - HTTP-only cookies (`session_token`)

3. **Admin Auth (Separate System)**
   - `/api/admin/auth` — login endpoint
   - Admin credentials from env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
   - Auto-creates admin account on first login
   - 2-hour session expiry (more secure)
   - IP & user-agent tracking for audit log
   - Failed login attempts logged as notifications

### Route Protection (middleware.ts)
- `/api/admin/*` → requires `admin_token` cookie
- `/api/users/*` → requires `session_token` cookie
- `/api/auth/change-password` → requires `session_token`

---

## 🎨 Design System

### Colors (Stone palette — warm, premium feel)
- Primary: `stone-900` (near-black)
- Background: `white`
- Accents: Warm grays, no indigo/blue (per brand guidelines)

### Typography
- Font: **Inter** (Latin) + Bengali system fonts
- Bengali numerals (০১২৩৪৫৬৭৮৯) used throughout

### Responsive Breakpoints
- Mobile-first design
- Touch targets: minimum 44px
- Sticky footer at viewport bottom
- Custom scrollbar styling for long lists

### Animations
- Framer Motion page transitions (fade)
- ScrollReveal component for scroll-triggered animations
- Loading states with custom spinners (Bengali text)
- Hover effects on all interactive elements

---

## 🚀 Deployment Guide

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Turso database URL (`libsql://...`) |
| `DATABASE_AUTH_TOKEN` | ✅ | Turso auth token |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char string |
| `ADMIN_EMAIL` | ✅ | Admin login email |
| `ADMIN_PASSWORD` | ✅ | Admin login password |
| `NEXTAUTH_URL` | Optional | Site URL (e.g. `https://yoursite.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth (for Google login) |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `BUSINESS_PHONE` | Optional | Override default WhatsApp number |

### Deploy Steps (Vercel)
1. Create Turso database → get URL + token
2. Import GitHub repo to Vercel
3. Add environment variables (5 required)
4. Deploy
5. POST `/api/seed` once to load sample data

See **[DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)** for detailed instructions.

---

## 📦 Default Admin Credentials

```
Email: dolamaanha@gmail.com
Password: shwapnopuron35356
```

> ⚠️ Change these in production via environment variables!

---

## 📞 Default Business Info

- **Phone/WhatsApp**: +880 1913551490
- **Email**: dolamaanha@gmail.com
- **Address**: ঢাকা, বাংলাদেশ (Dhaka, Bangladesh)
- **Social**: WhatsApp, Facebook Messenger

---

## 🌱 Sample Data (Auto-Seeded)

When `/api/seed` is called (POST), the database populates with:

### 8 Products
1. নেভি এমব্রয়ডারি সালোয়ার কামিজ — ৳2,499 (featured)
2. মেরুন বেনারসি শাড়ি — ৳3,999 (featured)
3. এমারেল্ড মিরর ওয়ার্ক লেহেঙ্গা — ৳5,499 (featured)
4. পিচ চিকনকারি আনারকলি — ৳1,899 (featured)
5. রয়্যাল ব্লু শারারা সেট — ৳3,299
6. লাল ব্রাইডাল লেহেঙ্গা — ৳8,999
7. ক্রিম পালাজো কুর্তা সেট — ৳1,499
8. বেগুনি ঘারারা ড্রেস সেট — ৳4,299

### 48 Reviews (6 per product)
- Bengali customer names, ratings (4-5 stars), Bengali comments

### 4 Payment Methods
- bKash, Nagad, Rocket, ইসলামী ব্যাংক

### 2 Contact Methods
- WhatsApp (+880 1913551490), Facebook Messenger

### 1 Admin Account
- Email: dolamaanha@gmail.com (password hashed with scrypt)

### 7 Site Content Entries
- footer_phone, footer_whatsapp, footer_email, footer_address
- hero_since_label, hero_subtitle, hero_description

---

## 🔧 Development

### Local Setup
```bash
bun install
cp .env.example .env  # Edit with your values
bun run db:push        # Create database tables
bun run dev            # Start dev server on port 3000
```

### Database Commands
```bash
bun run db:push        # Push schema to database
bun run db:generate    # Generate Prisma client
bun run db:migrate     # Create migration
bun run db:reset       # Reset database
```

### Other Commands
```bash
bun run lint           # Run ESLint
bun run build          # Production build
bun run start          # Start production server
```

---

## 📜 License

Proprietary — © 2026 স্বপ্ন পূরণ (Shwapno Puron). All rights reserved.

---

## 🤝 For AI Assistants (Claude, Cursor, etc.)

**If you're an AI assistant helping with this project:**

1. **Tech stack**: Next.js 16 + TypeScript 5 + Prisma 6 + Turso + Tailwind 4 + shadcn/ui
2. **Database**: Turso (libSQL) for production, SQLite for local dev — both via Prisma
3. **Auth**: Three systems — NextAuth (Google), custom user auth, custom admin auth
4. **State**: Zustand for client state (cart, views), React hooks for server state
5. **APIs**: All routes in `src/app/api/` — RESTful, 35 endpoints total
6. **Language**: Bengali UI throughout — preserve Bengali text in any edits
7. **Branding**: Stone color palette (warm grays), no indigo/blue
8. **Deploy**: Vercel + Turso — see DEPLOY-GUIDE.md
9. **Admin login**: dolamaanha@gmail.com / shwapnopuron35356
10. **Important files**:
    - `prisma/schema.prisma` — database schema
    - `src/lib/db.ts` — Prisma client (handles Turso + SQLite)
    - `src/lib/auth.ts` — auth utilities (hashing, sessions)
    - `src/middleware.ts` — route protection
    - `src/store/useStore.ts` — Zustand store
    - `src/app/page.tsx` — main SPA-style view router

**When making changes**: Always test with `bun run lint` and `bun run build` before deploying.
