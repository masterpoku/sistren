# Project State - SISTREN (Sistem Informasi Terpadu)

## [CONVERSATION_SUMMARY]

Implemented complete Drizzle ORM database schema based on old PHP Laravel analysis. Created 15 tables with proper FKs, indexes, and relationships in `src/lib/db/schema/`. Fixed type compatibility issues with Drizzle column definitions (bigint mode config). Generated migration, pushed to dev MySQL Docker container, and seeded initial data (roles, majors, classes, semesters, subjects, payment_methods, system_configs). Build and typecheck pass.

## [CURRENT_SCOPE]

All schema implementation complete. Database is ready for UI integration (queries to replace mock data in `src/constants.ts` and feature pages). Next: connect Better Auth to custom users table and implement authentication flows.

## [COMPLETED]

- Schema directory: `src/lib/db/schema/` with 15 table definitions + relations
  - Core: `roles`, `users`, `profiles`, `profile_assets`
  - Academic: `majors`, `classes`, `subjects`, `semesters`, `enrollments`, `grades`
  - Business: `payment_methods`, `payments`, `announcements`, `announcement_recipients`, `system_configs`
- Fixed Drizzle v0.45 type issues: `bigint('col', { mode: 'number' })`, `int` for integers, proper imports
- Barrel export: `src/lib/db/schema/index.ts`
- DB connection: `src/lib/db/index.ts` using `drizzle-orm/mysql2`
- Migration: `drizzle/migrations/0000_remarkable_patch.sql` generated and pushed
- Seeding: `src/lib/db/seed.ts` with initial reference data
- Dev DB: MySQL 8.0 running in Docker (sistren database)
- Verified: `bun typecheck` passes, `bun run build` succeeds (14 routes)

## [DECISIONS]

- **bigint config:** must include `{ mode: 'number' }` per Drizzle v0.45 type requirements
- **int type:** replaced deprecated `integer` with `int` from `drizzle-orm/mysql-core`
- **db driver:** used `drizzle-orm/mysql2` entry point with PoolOptions connection config
- **Seed approach:** simple sequential inserts (no conflict handling) — assumes fresh DB
- **Migration order:** followed dependency order from docs/table.md (15 tables)
- **Naming:** Drizzle standard plural snake_case (e.g., `announcement_recipients`), no `res_` prefix

## [PENDING]

1. Connect Better Auth to custom `users` table (Drizzle adapter configuration)
2. Replace mock data in `src/constants.ts` with real DB queries in feature pages
3. Implement authentication UI (sign-in, sign-up, sign-out) using Better Auth routes
4. Add middleware for protected routes
5. Consider adding blog tables if needed (not in current spec)
6. Add DB connection health check / error handling
