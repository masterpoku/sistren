# Research: Next.js 16 Auth & Route Protection Patterns

**Stack:** Next.js 16.2.2 (App Router), better-auth 1.5.6, Drizzle ORM, MySQL

## Summary

Next.js 16 has **deprecated `middleware.ts` in favor of `proxy.ts`**, running on Node.js runtime instead of Edge. For route protection, the recommended approach is a **hybrid strategy**: `proxy.ts` for coarse-grained auth checks at the edge, combined with Server Component auth checks in layouts for fine-grained protection. better-auth 1.5.6 is fully compatible with Next.js 16 via `toNextJsHandler` and its own proxy integration.

---

## Findings

### 1. Next.js 16: Middleware → Proxy Migration

**Status: `middleware.ts` is DEPRECATED in Next.js 16**

- **What changed:** `middleware.ts` renamed to `proxy.ts`, exported function renamed from `middleware` to `proxy`
- **Runtime:** Edge runtime → Node.js runtime
- **Migration:** Rename file and function, logic remains the same
- **Deprecation timeline:** Available now, will be removed in future version

```typescript
// OLD (middleware.ts - deprecated)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url))
}

// NEW (proxy.ts - Next.js 16)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

**Source:** [Next.js 16 Blog](https://nextjs.org/blog/next-16), [Upgrading to Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16)

---

### 2. Route Protection Patterns

#### Pattern A: proxy.ts for Coarse-Grained Protection (Edge Layer)

Use proxy for initial auth check before route resolution. **Recommended for Next.js 16.**

```typescript
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth' // better-auth session getter

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
}

export async function proxy(request: NextRequest) {
  const session = await auth()
  
  const isProtected = 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/settings')
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}
```

**Limitation:** Proxy runs on Node.js runtime in Next.js 16 — cannot access cookies directly for JWT validation without awaiting. Edge-compatible JWT validation patterns no longer work.

**Source:** [Next.js Proxy Docs](https://nextjs.org/docs/app/getting-started/proxy), [Authgear Guide](https://www.authgear.com/post/nextjs-middleware-authentication)

---

#### Pattern B: Server Component Auth Checks (Recommended for Fine-Grained)

**This is the recommended approach for Next.js 16.** Auth check happens in Server Components/layouts, allowing full database access for RBAC.

**File Structure:**
```
app/
├── (auth)/
│   ├── layout.tsx          # Public routes layout (no auth required)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (protected)/
│   ├── layout.tsx          # Auth check + session fetch
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
└── api/
    └── auth/[...all]/route.ts  # better-auth handler
```

**Protected Layout Pattern:**

```typescript
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserRole } from '@/lib/auth/queries' // Drizzle query

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/login')
  }

  // Optional: Role-based access control via Drizzle
  const user = await getUserRole(session.user.id)
  
  if (user.role === 'pending') {
    redirect('/auth/verify-email')
  }

  return (
    <div className="protected-layout">
      {children}
    </div>
  )
}
```

**Protected Page Pattern:**

```typescript
// app/(protected)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { auth, session } from '@/lib/auth'
import { getUserData } from '@/lib/auth/queries'

export default async function DashboardPage() {
  // Auth already guaranteed by parent layout
  // But can add page-specific checks
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userData = await getUserData(session.user.id)

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {userData.name}</p>
    </div>
  )
}
```

**Source:** [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication), [WorkOS Guide 2026](https://workos.com/blog/nextjs-app-router-authentication-guide-2026)

---

#### Pattern C: Route Groups with Auth Layout

For Sistren's structure with route groups like `(app)`:

```
app/
├── (auth)/
│   ├── layout.tsx          # No auth check - public
│   ├── login/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx          # Auth check - protected
│   ├── students/page.tsx
│   ├── teachers/page.tsx
│   └── grades/page.tsx
└── api/auth/[...all]/route.ts
```

**Auth Route Group Layout (Public):**
```typescript
// app/(auth)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect already logged-in users away from auth pages
  const session = await auth()
  
  if (session) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
```

**Source:** [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)

---

### 3. better-auth Integration

**better-auth 1.5.6** is fully compatible with Next.js 16. The integration involves:

#### Setup

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db' // Drizzle MySQL instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'mysql', // or 'pg' for PostgreSQL
    schema: {
      user: 'users',
      session: 'sessions',
      account: 'accounts',
      verification: 'verifications',
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Add Google, GitHub, etc.
  },
})

// Session getter for Server Components
export const { session } = auth
```

**Source:** [Better Auth Next.js Integration](https://better-auth.com/docs/integrations/next)

#### API Route Handler

```typescript
// app/api/auth/[...all]/route.ts
import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

export const { GET, POST } = toNextJsHandler(auth)
```

#### Session in Server Components

```typescript
// lib/auth.ts - Export session getter
import { getSession } from 'better-auth/server'

export async function auth() {
  return await getSession()
}
```

#### better-auth Proxy Integration (for route protection)

Better Auth provides its own proxy-compatible auth check:

```typescript
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
}

export async function proxy(request: NextRequest) {
  const session = await auth()
  
  // Protect routes starting with /dashboard, /admin, /settings
  const protectedPaths = ['/dashboard', '/admin', '/settings']
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !session) {
    return NextResponse.redirect(
      new URL('/auth/login', request.url)
    )
  }

  return NextResponse.next()
}
```

**Source:** [Better Auth Next.js Integration](https://better-auth.com/docs/integrations/next)

---

### 4. Best Practices: Server Component vs Proxy vs Client-Side

| Approach | Use Case | Pros | Cons |
|---------|----------|------|------|
| **proxy.ts** | Coarse-grained route blocking | Fast, runs before rendering | Limited session data, Node.js runtime only |
| **Server Component Layout** | Fine-grained auth + RBAC | Full DB access, type-safe | Runs on each navigation |
| **Server Action Auth** | API/data mutations | Validates user before mutation | Not for route protection |
| **Client-Side (useAuth)** | UI state, loading states | Reactive, shows auth state | Not for security-critical protection |

**Recommended Stack for Sistren:**

```
proxy.ts          → Initial redirect for unauthenticated users (coarse)
Layout auth.ts    → Session + role verification (fine-grained)
Server Actions   → Permission checks before data mutations
Client useEffect → Loading states, post-login redirects
```

**Why not proxy alone:**
- CVE-2025-29927: Middleware/proxy bypass vulnerability exists
- Proxy in Next.js 16 runs on Node.js runtime (slower than Edge, but more capable)
- Cannot access full session data with roles/permissions without DB lookup

**Why not layout auth alone:**
- Initial redirect happens after RSC payload fetch (slight delay)
- Combined approach provides defense in depth

**Source:** [WorkOS Auth Guide 2026](https://workos.com/blog/nextjs-app-router-authentication-guide-2026), [Next.js Proxy Docs](https://nextjs.org/docs/app/getting-started/proxy)

---

### 5. API Route Protection (Route Handlers)

```typescript
// app/api/protected/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Proceed with protected logic
  return NextResponse.json({ data: 'secret data' })
}
```

For role-based API protection:

```typescript
// app/api/admin/users/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { users } from '@/lib/db/schema'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch user role from DB
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ users: [] })
}
```

**Source:** [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

---

## Sources

### Kept:
- **Next.js 16 Blog** (https://nextjs.org/blog/next-16) — Official release notes confirming middleware → proxy
- **Upgrading to Version 16** (https://nextjs.org/docs/app/guides/upgrading/version-16) — Migration steps
- **Next.js Proxy Docs** (https://nextjs.org/docs/app/getting-started/proxy) — New proxy API reference
- **Next.js Authentication Guide** (https://nextjs.org/docs/app/guides/authentication) — Official auth patterns
- **Better Auth Next.js Integration** (https://better-auth.com/docs/integrations/next) — Library-specific integration
- **WorkOS Next.js Auth Guide 2026** (https://workos.com/blog/nextjs-app-router-authentication-guide-2026) — Comprehensive patterns
- **Authgear Middleware Auth Guide** (https://www.authgear.com/post/nextjs-middleware-authentication) — CVE-29927 warning

### Dropped:
- **Medium generic tutorials** — Outdated patterns, don't cover Next.js 16 proxy changes
- **YouTube tutorials** — Cannot extract code patterns reliably
- **Stack Overflow** — Older Next.js versions, deprecated patterns

---

## Gaps

1. **Drizzle + better-auth adapter specifics** — Need to verify exact schema mapping for MySQL with Sistren's existing schema
2. **Partial Prerendering (PPR) interaction** — Next.js 16 default caching behavior with auth is unclear
3. **SSR streaming with auth** — How auth works with Suspense boundaries in layouts

**Suggested next steps:**
1. Check better-auth's Drizzle MySQL adapter documentation for schema requirements
2. Test proxy.ts + layout auth hybrid on a sandbox route
3. Verify session cookie configuration for MySQL/Drizzle

---

## Recommendations for Sistren

### Immediate (Next.js 16):
1. Rename existing `middleware.ts` to `proxy.ts`
2. Rename `export function middleware` to `export function proxy`
3. Add better-auth session check in proxy
4. Add auth check in protected route group layouts

### File Structure:
```
app/
├── (auth)/                  # Public routes
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── (protected)/             # Protected routes - STUDENT
│   ├── layout.tsx           # Auth + student role check
│   ├── dashboard/page.tsx
│   └── grades/page.tsx
├── (admin)/                 # Protected routes - ADMIN
│   ├── layout.tsx           # Auth + admin role check
│   ├── users/page.tsx
│   └── settings/page.tsx
├── api/
│   └── auth/[...all]/route.ts
└── proxy.ts                 # Coarse-grained auth
```

### Auth Lib Setup (better-auth):
```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'mysql',
    schema: {
      user: 'users',
      session: 'sessions',
      account: 'accounts',
      verification: 'verifications',
    },
  }),
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
})

export const { session } = auth
```
