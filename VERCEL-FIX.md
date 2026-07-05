# 🚨 Vercel Deployment Problem — Diagnosis & Fix Solution

## 🔍 Problem Summary

**Live Site**: https://shwapno-puron-web.vercel.app/

The site deploys successfully (HTTP 200) but **all database-dependent APIs fail**:

| Endpoint | Response | Status |
|----------|----------|--------|
| `GET /` | HTML renders | ✅ 200 |
| `GET /api/site-content` | Returns hardcoded defaults from `src/hooks/useSiteContent.ts` | ⚠️ 200 (but NOT reading from DB) |
| `GET /api/products` | `{"error":"Failed to fetch products"}` | ❌ 500 |
| `GET /api/payment-methods` | `[]` (empty array) | ❌ 200 (but DB has 4 methods) |
| `GET /api/contact-methods` | `[]` (empty array) | ❌ 200 (but DB has 2 methods) |
| `POST /api/seed` | `{"error":"সিড করতে সমস্যা হয়েছে"}` | ❌ 500 |
| `GET /api/auth/session` | `{}` | ⚠️ Working (NextAuth) |

---

## ✅ What IS Working

1. **Vercel deployment itself** — site loads, HTML renders
2. **Static assets** — images, CSS, JS chunks all load
3. **NextAuth framework** — `/api/auth/session` returns valid response
4. **Database connection** — Turso DB is accessible and has data:
   - Products: 8 ✅
   - Payment Methods: 4 ✅
   - Contact Methods: 2 ✅
   - Site Content: 7 ✅
   - Admin: 1 ✅

---

## ❌ What IS NOT Working

**All Prisma queries fail on Vercel serverless functions**, returning:
- `/api/products` → 500 error "Failed to fetch products"
- `/api/payment-methods` → empty array (error caught, returns `[]`)
- `/api/contact-methods` → empty array (error caught, returns `[]`)

---

## 🎯 Root Cause Analysis

The error message from user's screenshot:
```
LibsqlError: URL_INVALID: The URL 'undefined' is not in a valid format
    at T.createClient (.next/server/chunks/[root-of-the-server]__174daecc._.js:1:31708)
```

### The Problem: `process.env.DATABASE_URL` is `undefined` on Vercel

Looking at `src/lib/db.ts`:
```typescript
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''  // ← empty string when undefined
  const isTurso = databaseUrl.startsWith('libsql://')  // ← false (empty string)

  if (isTurso) {
    // ← THIS BRANCH NEVER EXECUTES because DATABASE_URL is undefined
    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    })
    // ...
  }

  // Falls through to standard SQLite — but no local file exists on Vercel!
  return new PrismaClient({...})
}
```

**When `DATABASE_URL` is undefined:**
1. `isTurso` evaluates to `false` (empty string doesn't start with `libsql://`)
2. Code falls through to standard SQLite branch
3. Standard Prisma SQLite client tries to connect to local file `file:./dev.db`
4. On Vercel serverless, this file doesn't exist → query fails

---

## 🔧 Three Possible Causes (Check Each)

### Cause 1: Environment Variables NOT Set on Vercel (Most Likely)

**Check**: Vercel Dashboard → Project → Settings → Environment Variables

**Required variables (5 total):**
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `libsql://your-db-name.turso.io` |
| `DATABASE_AUTH_TOKEN` | `your-turso-auth-token-here` |
| `NEXTAUTH_SECRET` | `your-nextauth-secret-here` |
| `ADMIN_EMAIL` | `your-admin@email.com` |
| `ADMIN_PASSWORD` | `your-admin-password` |

**Critical**: Each variable MUST have these environments ticked:
- ✅ Production
- ✅ Preview
- ✅ Development

### Cause 2: Environment Variables Set but NOT Redeployed

Adding env vars does NOT affect existing deployments. Must trigger a NEW deployment:
- Vercel → Deployments → latest → ⋯ → **Redeploy**
- ⚠️ UNCHECK "Use existing Build Cache" option

### Cause 3: Prisma Client Not Generated for Turso Adapter

The `postinstall` script runs `prisma generate`, but on Vercel this might not properly include the libSQL adapter. The `@prisma/adapter-libsql` and `@libsql/client` packages must be in `dependencies` (not `devDependencies`).

**Verify** in `package.json`:
```json
"dependencies": {
  "@libsql/client": "^0.17.3",          // ← must be here
  "@prisma/adapter-libsql": "6.19.2",    // ← must be here
  "@prisma/client": "^6.11.1",
  ...
}
```

---

## ✅ Fix Solution — Step by Step

### Step 1: Verify Environment Variables on Vercel

1. Go to Vercel Dashboard
2. Open project `shwapno-puron-web`
3. Go to **Settings → Environment Variables**
4. Confirm ALL 5 variables exist with correct values
5. For each variable, click ✏️ Edit → ensure ALL 3 environments are ticked (Production, Preview, Development)

### Step 2: Redeploy (Critical!)

1. Go to **Deployments** tab
2. Click ⋯ on the latest deployment
3. Select **Redeploy**
4. ⚠️ **UNCHECK** "Use existing Build Cache" checkbox
5. Click **Redeploy** button
6. Wait 2-3 minutes for build to complete

### Step 3: Verify the Fix

After redeployment completes, test these endpoints:

```bash
# Should return 8 products (not an error)
curl https://shwapno-puron-web.vercel.app/api/products

# Should return 4 payment methods (not empty array)
curl https://shwapno-puron-web.vercel.app/api/payment-methods

# Should return 2 contact methods (not empty array)
curl https://shwapno-puron-web.vercel.app/api/contact-methods
```

### Step 4: If Still Failing — Code-Level Fix

If the above doesn't work, the issue might be in `src/lib/db.ts`. The current code uses `require()` for the libSQL adapter, which might not work in Vercel's ESM environment. 

**Recommended fix** — change `src/lib/db.ts` to use ESM imports:

```typescript
import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const isTurso = databaseUrl.startsWith('libsql://')

  if (isTurso) {
    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    })
    const adapter = new PrismaLibSQL(libsql)
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
    })
  }

  // Standard SQLite client for local development
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

**Key changes:**
- Replace `require()` with top-level ESM `import` statements
- Remove `// eslint-disable-next-line @typescript-eslint/no-require-imports` comments
- This ensures proper module resolution on Vercel's serverless runtime

### Step 5: Debug Logging (If Still Failing)

Temporarily add debug logging to `src/lib/db.ts`:

```typescript
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  console.log('[DB] DATABASE_URL prefix:', databaseUrl.substring(0, 20))
  console.log('[DB] Is Turso?', databaseUrl.startsWith('libsql://'))
  console.log('[DB] Has auth token?', !!process.env.DATABASE_AUTH_TOKEN)
  // ... rest of code
}
```

Then check Vercel function logs:
- Vercel Dashboard → Project → **Logs** tab
- Filter by function name or look for `[DB]` console output

---

## 📋 Checklist for Claude (or any AI assistant)

When fixing this issue, verify in this order:

- [ ] Are all 5 env vars set on Vercel? (Settings → Environment Variables)
- [ ] Is each var ticked for Production environment? (not just Preview/Development)
- [ ] Was a NEW deployment triggered after adding vars? (Redeploy with cache unchecked)
- [ ] Does `package.json` have `@libsql/client` and `@prisma/adapter-libsql` in `dependencies`?
- [ ] Does `src/lib/db.ts` use ESM imports (not `require()`)?
- [ ] Check Vercel function logs for the actual error message
- [ ] Test `/api/products` after fix — should return 8 products

---

## 🧪 Verification Commands

```bash
# Test products endpoint (should return JSON array of 8 products)
curl -s https://shwapno-puron-web.vercel.app/api/products | head -c 200

# Test payment methods (should return array of 4 methods)
curl -s https://shwapno-puron-web.vercel.app/api/payment-methods

# Test contact methods (should return array of 2 methods)
curl -s https://shwapno-puron-web.vercel.app/api/contact-methods

# Test seed endpoint (should return success message)
curl -s -X POST https://shwapno-puron-web.vercel.app/api/seed
```

**Expected responses after fix:**
- Products: `[{"id":"...","name":"নেভি এমব্রয়ডারি সালোয়ার কামিজ","price":2499,...}, ...]`
- Payment methods: `[{"name":"bKash",...}, {"name":"Nagad",...}, ...]`
- Contact methods: `[{"name":"WhatsApp",...}, {"name":"Messenger",...}]`

---

## 📞 Turso Database Info (for verification)

- **Database URL**: `libsql://your-db-name.turso.io`
- **Region**: AWS ap-south-1 (Mumbai)
- **Status**: ✅ Connected and seeded
- **Data**: 8 products, 48 reviews, 4 payment methods, 2 contact methods, 1 admin, 7 site content entries

The database is fully functional — the problem is purely Vercel's serverless functions not reading the `DATABASE_URL` environment variable.
