---
name: drizzle-schema-patterns
description: >-
  Design and implement Drizzle ORM schemas for MySQL/MariaDB. Use when creating or modifying
  database tables, defining relations, writing queries, handling transactions, or setting up
  drizzle-kit migrations in a Next.js project.
  Triggers on: "create table", "drizzle schema", "define relation", "drizzle query",
  "drizzle transaction", "drizzle migrate", "drizzle seed", "soft delete drizzle",
  "polymorphic relation drizzle".
---

## When to use

Use when:
- Creating new database tables (schema design)
- Adding relations between tables
- Writing CRUD queries with Drizzle
- Handling multi-step transactions
- Setting up drizzle-kit (generate/push/migrate)
- Implementing soft delete
- Defining indexes and constraints

Do NOT use when:
- Setting up better-auth specifically (use better-auth-drizzle skill)
- Just running migrations (CLI is self-explanatory)
- Non-database code

## Schema Design

### 1. Basic table structure

```ts
import { mysqlTable, varchar, text, timestamp, boolean, int, bigint, mediumblob, json, mysqlEnum } from "drizzle-orm/mysql-core"
import { relations } from "drizzle-orm"

// Example: profiles table
export const profiles = mysqlTable("profiles", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: bigint("user_id", { mode: "number" }).notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["siswa", "guru", "admin", "superadmin"]).default("siswa"),
  nisn: varchar("nisn", { length: 20 }),
  nik: varchar("nik", { length: 255 }),
  birthPlace: varchar("birth_place", { length: 100 }),
  birthDate: varchar("birth_date", { length: 20 }), // stored as string for date-only
  gender: mysqlEnum("gender", ["male", "female"]).default("male"),
  religion: varchar("religion", { length: 50 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  // ... more fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
}, (table) => ({
  userIdx: uniqueIndex("user_id").using("btree").on(table.userId),
  emailIdx: uniqueIndex("email").using("btree").on(table.email),
}))
```

### 2. Soft delete pattern (Drizzle idiomatic)

```ts
import { softDelete } from "drizzle-orm/mysql-core"

// Add deletedAt to every table that supports deletion
export const users = mysqlTable("users", {
  // ... core fields
  deletedAt: timestamp("deleted_at"), // null = active, non-null = deleted
})

// Query builder helper
export function isActive<T extends { deletedAt: ReturnType<typeof timestamp> }>(table: T) {
  return eq(table.deletedAt, null)
}

// Usage in queries
const activeUsers = await db.select().from(users).where(isActive(users))
```

### 3. Relations with Drizzle v2

```ts
// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  // One-to-one: user has one profile
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  // One-to-many: user has many sessions
  sessions: many(sessions),
  // Many-to-many via pivot
  roles: many(userRoles),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  major: one(majors, {
    fields: [profiles.majorId],
    references: [majors.id],
  }),
}))

// Enable experimental.joins only if using PostgreSQL or MariaDB can handle it
// For MariaDB: disable — json_arrayagg LATERAL JOIN syntax error
```

### 4. Indexes and constraints

```ts
export const users = mysqlTable("users", {
  email: varchar("email", { length: 255 }).notNull().unique(),
  // ...
}, (table) => ({
  emailIdx: uniqueIndex("email_idx").on(table.email),
  // Composite index for common query pattern
  compositeIdx: index("type_deleted_idx").on(table.type, table.deletedAt),
}))
```

### 5. JSON column for metadata

```ts
export const auditLogs = mysqlTable("audit_logs", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: bigint("user_id", { mode: "number" }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: bigint("entity_id", { mode: "number" }),
  metadata: json("metadata").$type<{ ip?: string; userAgent?: string; changes?: Record<string, unknown> }>(),
  createdAt: timestamp("created_at").defaultNow(),
})
```

### 6. Blob column for encrypted data

```ts
export const attachments = mysqlTable("attachments", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  modelRef: varchar("model_ref", { length: 100 }).notNull(), // polymorphic reference
  idRef: bigint("id_ref", { mode: "number" }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  data: mediumblob("data").notNull(), // encrypted blob
  size: bigint("size", { mode: "number" }).notNull(),
  // ...
})
```

**MariaDB**: `Buffer` in Node.js maps to `mediumblob()`. Max size ~16MB per blob.

## Query Patterns

### 1. Basic CRUD

```ts
// Insert
const [user] = await db.insert(users).values({ name, email, password: hash }).returning()

// Select with soft delete filter
const activeUser = await db.select().from(users)
  .where(and(eq(users.email, email), isNull(users.deletedAt)))
  .limit(1)

// Update
await db.update(users).set({ name: newName })
  .where(and(eq(users.id, userId), isNull(users.deletedAt)))

// Delete (soft delete)
await db.update(users).set({ deletedAt: new Date() })
  .where(eq(users.id, userId))
```

### 2. Relations query (with join)

```ts
// Get user with profile
const userWithProfile = await db.query.users.findFirst({
  where: and(eq(users.id, userId), isNull(users.deletedAt)),
  with: {
    profile: true,
  },
})
```

### 3. Transaction pattern

```ts
// Multi-step write must be in transaction
await db.transaction(async (tx) => {
  // Step 1: Create user
  const [user] = await tx.insert(users).values({ name, email, password: hash }).returning()

  // Step 2: Create profile
  await tx.insert(profiles).values({ userId: user.id, type: "siswa" })

  // Step 3: Create enrollment
  await tx.insert(enrollments).values({ studentId: user.id, semesterId, classId })

  // If any throws, all roll back
})
```

## Drizzle Kit Commands

```bash
# Generate migration file from schema changes
bunx drizzle-kit generate

# Push schema to DB (dev only, no migration file)
bunx drizzle-kit push

# Apply migrations
bunx drizzle-kit migrate

# Studio (GUI for DB inspection)
bunx drizzle-kit studio

# Check status
bunx drizzle-kit check
```

## MariaDB Specific

### Data types mapping

| Drizzle Type | MariaDB Type | Notes |
|-------------|--------------|-------|
| `varchar(length)` | VARCHAR | |
| `text()` | TEXT | |
| `int()` | INT | |
| `bigint({ mode: "number" })` | BIGINT | Returns string in JS — use `Number()` to cast |
| `boolean()` | TINYINT(1) | |
| `timestamp()` | DATETIME | |
| `date()` | DATE | |
| `mediumblob()` | MEDIUMBLOB | Max ~16MB |
| `decimal(precision, scale)` | DECIMAL | |
| `json()` | JSON | |
| `mysqlEnum()` | ENUM | |

### softDelete gotcha

Drizzle v2 `softDelete()` middleware approach changed. Use explicit column + manual filter instead.

## Quality checklist

- [ ] Every table has primary key
- [ ] Every foreign key has `onDelete: "cascade"` (or appropriate action)
- [ ] Soft delete filter applied on all user-facing queries (`isNull(deletedAt)`)
- [ ] Unique indexes on email, unique fields
- [ ] `mediumblob()` used for file data, not `blob()`
- [ ] Transaction used for multi-step writes
- [ ] `bun run typecheck` passes
- [ ] `bunx drizzle-kit generate` produces clean migration