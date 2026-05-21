---
name: better-auth-drizzle
description: >-
  Integrate better-auth with Drizzle ORM in a Next.js project. Use when setting up authentication
  from scratch, configuring better-auth plugins, mapping Drizzle schema fields to better-auth,
  or troubleshooting better-auth + Drizzle integration issues.
  Triggers on: "set up better-auth", "better-auth drizzle", "configure auth", "auth database schema",
  "better-auth plugins", "npx auth@latest", "drizzleAdapter".
---

## When to use

Use when:
- Setting up better-auth with Drizzle adapter for the first time
- Adding or configuring better-auth plugins (admin, email, OAuth)
- Mapping Drizzle table/field names to better-auth config
- Generating better-auth schema via CLI
- Troubleshooting session, account, or user fetch issues
- Extending better-auth with custom additionalFields

Do NOT use when:
- Working on non-auth code (use drizzle-schema-patterns skill instead)
- Setting up Prisma (different adapter)
- Just adding a component (use shadcn-ui-integration skill)

## Steps

### 1. Install dependencies

```bash
bun add better-auth @better-auth/drizzle-adapter drizzle-orm mysql2
bun add -d drizzle-kit
```

### 2. Set up DB connection

`src/lib/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const db = drizzle(pool, { schema })
export type DB = typeof db
```

### 3. Generate better-auth schema via CLI

```bash
npx auth@latest generate --adapter drizzle --dialect mysql
```

This generates the correct Drizzle schema for users, sessions, accounts, verifications tables.

**For bun runtime**: use `bunx auth@latest generate --adapter drizzle --dialect mysql`

The CLI outputs the exact Drizzle schema code. Copy it to your schema file.

### 4. Configure better-auth with drizzleAdapter

`src/lib/auth/index.ts`:

```ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { db } from "../db"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql", // or "pg", "sqlite"
    schema: {
      users: schema.users,
      sessions: schema.sessions,
      accounts: schema.accounts,
      verifications: schema.verifications,
    },
    usePlural: true, // when table names are plural (users, sessions)
  }),
  // ... plugins and config
})
```

### 5. Configure additionalFields (custom user fields)

```ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "mysql", schema, usePlural: true }),
  additionalFields: {
    roleId: {
      type: "number",
      required: false,
      input: false, // admin-only, not user-settable
    },
  },
})
```

The Drizzle user table must have the `roleId` column matching the type.

### 6. Add plugins

```ts
import { admin } from "better-auth/plugins/admin"
import { twoFactor } from "better-auth/plugins/two-factor"
import { oAuthProxy } from "better-auth/plugins/oauth-proxy"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "mysql", schema, usePlural: true }),
  plugins: [
    admin(),
    twoFactor(),
    oAuthProxy(),
  ],
})
```

Plugins add their own schema tables automatically.

### 7. Use nextCookies plugin (Next.js required)

```ts
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  // ...
  plugins: [
    // ... other plugins
    nextCookies(),
  ],
})
```

`nextCookies` must be last in the plugins array.

### 8. Create auth API route

`src/app/api/auth/[...all]/route.ts`:

```ts
import { toNextJsRequestHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"

export const { GET, POST } = toNextJsRequestHandler(auth)
```

### 9. Generate and run migrations

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Gotchas

- **NO `id` column in verifications table** — better-auth uses `identifier` + `token` as natural key. Adding `id: bigint()` breaks the adapter.
- **`emailVerified` is boolean, not timestamp** — better-auth reads `emailVerified: boolean('email_verified')`, NOT `emailVerifiedAt`.
- **`nextCookies` must be last plugin** — if it's not last, cookies may not be set correctly on all responses.
- **`experimental.joins: true` breaks on MariaDB** — json_arrayagg LATERAL JOIN syntax error. Leave it disabled.
- **BIGINT returns string in JS** — MySQL BIGINT mapped to JS string (not number) to avoid precision loss. Use `Number(session.user.id)` at boundaries where numeric cast is needed.
- **`usePlural: true`** when all tables use plural names. Maps `users` → `user` internally.
- **Field name mapping**: Change field name in Drizzle schema (e.g., `email: varchar("email_address")`) — better-auth reads the Drizzle property name, DB uses the column name.
- **`generateId: "serial"` is risky** — Issue #6762: passkey plugin + serial IDs causes "NaN" error. Use default UUID strings.
- **Programmatic migrations don't work with Drizzle** — `getMigrations` from `better-auth/db/migration` only works with Kysely adapter. Use `npx drizzle-kit migrate` instead.

## Field Mapping Reference

Better-auth reads Drizzle property names, not column names:

| Drizzle Property | Better-auth Expects | MariaDB Column |
|-----------------|---------------------|----------------|
| `email` | user email | `email` |
| `emailVerified` | boolean | `tinyint(1)` |
| `name` | user display name | `name` |
| `image` | avatar URL | `image` |
| `createdAt` | creation timestamp | `datetime` |
| `updatedAt` | update timestamp | `datetime` |

For `accounts` table, these fields are correct:

| Field | Type |
|-------|------|
| `accessTokenExpiresAt` | timestamp (NOT `expiresAt`) |
| `refreshTokenExpiresAt` | timestamp |
| `scope` | text |
| `accountId` | varchar (required, NOT optional) |

## CLI Commands Reference

```bash
npx auth@latest generate --adapter drizzle --dialect mysql  # Generate schema
npx auth@latest migrate                                        # Apply schema (Kysely only)
npx auth@latest info                                          # Diagnostic info
npx auth@latest secret                                        # Generate secret key
```

For bun: prefix with `bunx` instead of `npx`.

## Quality checklist

- [ ] `drizzleAdapter` configured with correct `provider: "mysql"`
- [ ] All 4 schema objects passed: users, sessions, accounts, verifications
- [ ] `nextCookies()` is last plugin
- [ ] `experimental.joins` NOT enabled (MariaDB incompatible)
- [ ] `emailVerified` is boolean type
- [ ] `verifications` table has NO `id` column
- [ ] `bun run typecheck` passes zero errors
- [ ] Auth sign-up and sign-in work end-to-end