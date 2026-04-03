# Project State - SISTREN (Sistem Informasi Terpadu)

## [CONVERSATION_SUMMARY]

Built Next.js 16.2.2 school info system with feature-based architecture. Compared ORMs - Drizzle won (5.1M weekly downloads vs Prisma 4.3M, smaller bundle, better edge support). Researched auth libs - decided on Better Auth for 10-day deadline (works out of box with Drizzle adapter). Moved all pages from `src/app/(app)/` to `src/features/` (SSR re-exports remain in app). Added breadcrumb to header, SidebarInset wrapper, role-based dashboard cards.

## [CURRENT_SCOPE]

Implementing Better Auth with Drizzle adapter. Working on auth schema and Drizzle connection setup.

## [COMPLETED]

- Feature-based architecture: `src/features/` for all page components
- `src/app/(app)/` - Thin SSR re-exports only
- `.env.example` / `.env` - DB config (MySQL root:root@localhost:3306)
- `src/features/layout/AppLayout.tsx` - Breadcrumb, SidebarInset, responsive header
- `src/components/ui/avatar.tsx` - Fallback visibility fix
- `src/app/(app)/announcements/page.tsx` - Matched reference layout
- `src/app/(app)/profile/page.tsx` - 2-column grid with avatar card
- **Installed:** drizzle-orm, mysql2, better-auth, @auth/drizzle-adapter
- **Added:** `src/lib/auth/index.ts` - Better Auth configuration

## [DECISIONS]

- **ORM:** Drizzle (5.1M weekly downloads vs Prisma 4.3M, smaller bundle, better edge support)
- **Auth:** Better Auth (works out of box, Drizzle adapter, quick MVP)
- **Password hashing:** Argon2id (mentioned but not implemented yet)
- **Architecture:** `src/features/` for client pages, `src/app/` only SSR entry points
- **UI:** Phosphor icons, Tailwind v4, removed all shadows

## [PENDING]

1. Create Drizzle config and connection (lib/db)
2. Build auth schema (users, sessions, accounts tables) for Better Auth
3. Set up Docker/MySQL "sistren" database
4. Configure Better Auth with Drizzle adapter
5. Create auth routes (sign-in, sign-up, sign-out)
6. Add middleware for protected routes
7. Update login UI to use Better Auth
