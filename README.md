# স্বপ্ন পূরণ (Shwapno Puron)

> ঐতিহ্যবাহী কারুশিল্পের সাথে আধুনিক ফ্যাশনের মেলবন্ধন — প্রিমিয়াম সালোয়ার কামিজ, শাড়ি ও লেহেঙ্গা।

Bengali fashion e-commerce store built with Next.js 16, Prisma, and Tailwind CSS.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Turso database URL (`libsql://...`) |
| `DATABASE_AUTH_TOKEN` | Turso auth token |
| `NEXTAUTH_SECRET` | Random 32+ char string ([generate](https://generate-secret.vercel.app/)) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |

Optional: `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BUSINESS_PHONE`

See **[DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)** for full step-by-step instructions.

## 🛠️ Local Development

```bash
bun install
cp .env.example .env  # then edit .env with your values
bun run db:push
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and POST `/api/seed` to load sample data.

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Database**: Prisma + SQLite (dev) / Turso (production)
- **Auth**: NextAuth.js + custom session management
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand
- **Animations**: Framer Motion

## 📄 License

Proprietary — © 2026 স্বপ্ন পূরণ
