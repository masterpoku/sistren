# Code Review: Shared Components & Library Utilities

**Project:** sistren_next (Next.js 16 / React 19 / Drizzle+MariaDB / Tailwind v4 + shadcn/ui)
**Date:** 2026-06-15
**Scope:** src/components/ui/ (27 files), src/lib/crypto.ts, src/lib/utils.ts, src/lib/auth-client.ts, src/lib/validation/schemas/ (4 files), src/constants.ts
**Reviewer:** Codebase Scout (ALR methodology)

---

## 1. 'use client' Directive Audit

### HIGH — Missing 'use client' on Radix-based wrappers

These components import and render Radix UI primitives (which are Client Components) but lack the `'use client'` directive. In Next.js App Router, importing a Client Component module from a Server Component module requires the intermediate module to also be a Client Component. These will fail at runtime when rendered in server component page trees.

| File | Imports | Expected |
|------|---------|----------|
| `button.tsx:1` | `Slot` from `@radix-ui/react-slot` | `'use client'` (render a Client Component) |
| `checkbox.tsx:3` | `CheckboxPrimitive` from `@radix-ui/react-checkbox` | `'use client'` |
| `collapsible.tsx:1` | `CollapsiblePrimitive` from `@radix-ui/react-collapsible` | `'use client'` |
| `scroll-area.tsx:1` | `ScrollAreaPrimitive` from `@radix-ui/react-scroll-area` | `'use client'` |
| `sheet.tsx` | `DialogPrimitive` from `@radix-ui/react-dialog` | `'use client'` |
| `switch.tsx:1` | `SwitchPrimitives` from `@radix-ui/react-switch` | `'use client'` |
| `tabs.tsx:1` | `TabsPrimitive` from `@radix-ui/react-tabs` | `'use client'` |

**Fix:** Add `'use client'` as first line to all seven files.

### LOW — Unnecessary 'use client' on table.tsx

`table.tsx:1` has `'use client'` but uses only `React.ComponentProps` types and `cn()`. No hooks, state, effects, or browser APIs. Purely presentational.

**Fix:** Remove `'use client'`. Harmless but misleading for future developers.

---

## 2. shadcn/ui Pattern Compliance

### Variant Props via cva — Good

- `badge.tsx`: `cva` with `VariantProps<typeof badgeVariants>` — correct pattern
- `button.tsx`: `cva` with `VariantProps<typeof buttonVariants>` — correct pattern
- `sidebar.tsx:485`: `sidebarMenuButtonVariants` with `cva` — correct pattern

### asChild / Slot Pattern

- `button.tsx:44-51`: Uses `Slot` from `@radix-ui/react-slot` with `asChild` prop — correct
- `sidebar.tsx:521`: Uses `Slot` with `asChild` on `SidebarMenuButton` — correct

### data-slot Attribute Pattern

**Good:** Most newer components follow the `data-slot="..."` convention (button, input, textarea, sidebar, select, dialog, sheet, tooltip, etc.)

**Inconsistent — no data-slot:**
- `card.tsx`: No `data-slot` on any sub-component
- `breadcrumb.tsx`: No `data-slot` on any sub-component
- `checkbox.tsx`: No `data-slot` on Root

These are older-pattern components that should be updated for consistency.

### export { ... } Pattern

All components use named exports at the bottom — consistent and correct.

---

## 3. Accessibility Issues

### MEDIUM — breadcrumb.tsx: BreadcrumbSeparator rendered as `<li>`

`breadcrumb.tsx:95`: `BreadcrumbSeparator` renders `<li>` which is semantically incorrect for separator elements. A separator between breadcrumb items should not be a list item. This can confuse screen readers.

**Fix:** Use `<span role="presentation" aria-hidden="true">` or render inside a `<li>` with `aria-hidden`.

### MEDIUM — data-table.tsx:165 uses `confirm()` for delete

`data-table.tsx:164`: `confirm(deleteConfirmMessage)` is a blocking dialog that doesn't respect user preferences, can't be styled, and breaks keyboard navigation in some contexts. Should use the project's `Dialog` component for a confirmed delete action.

### LOW — avatar.tsx: AvatarFallback without `role="img"`

When `AvatarImage` is missing/broken and `AvatarFallback` renders initials, there's no `role="img"` or `aria-label` on the fallback. Screen readers won't announce it as an image.

### LOW — empty-state.tsx: Missing `role="status"`

No `role="status"` or `aria-live="polite"` for dynamic empty states that could appear after search/filter.

---

## 4. Component Architecture Issues

### MEDIUM — data-table.tsx co-locates shared utilities

`data-table.tsx:51-136`: `formatCurrency`, `formatDate`, `formatDateTime`, `STATUS_LABELS`, `PAYMENT_TYPE_LABELS`, `PRIORITY_LABELS`, `CATEGORY_LABELS` are defined inside a component file. These are imported by multiple pages (`/finance`, `/announcements`, `/students`).

**Fix:** Move to `src/lib/formatters.ts` and `src/lib/constants/status-labels.ts`. Export from component and lib for backward compat during migration.

### LOW — No barrel export for components/ui/

`src/components/ui/` has no `index.ts`. Consumers must import from individual files like `@/components/ui/button` — which works with Next.js path aliases but is less discoverable. Root cause: shadcn/ui CLI doesn't generate barrel exports.

### LOW — resource-form.tsx: `action` prop type includes `| undefined`

`resource-form.tsx:12`: `action: (formData: FormData) => Promise<unknown> | undefined` — The union with `undefined` should be `Promise<unknown> | void` for correctness, or the undefined return removed and callers should return void.

### LOW — card.tsx uses forwardRef unnecessarily

Card sub-components (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter) all use `React.forwardRef`. These are purely presentational DOM wrappers. Ref forwarding adds complexity without benefit.

---

## 5. Validation Schema Coverage

### Enrollment Schemas — DB Enum Match Verified

- `enrollments.ts:16`: `newStatus` enum `["active", "transferred", "dropped", "graduated"]` matches DB schema exactly (`enrollments.ts:35-40`). **No issues.**
- Input validation with `z.coerce.number().positive()` and `z.string().uuid()` is appropriate.
- `updateEnrollmentStatusSchema` uses `z.coerce.number().positive()` for `enrollmentId` — consistent with `id: bigint("id", { mode: "number" })` mapping.

### Grades Schemas — Incomplete Coverage

`grades.ts:3-8`: Only `gradeTypeSchema` enum is exported. No validation for grade values (score), subject, semester association, or teacher assignment. If grades are submitted via Server Actions, value-level validation is missing.

### Settings Schemas — Good Pattern with One Gap

- `numericString` helper (settings.ts:4-9): transforms form-submitted strings to numbers with range validation. Correct for form inputs.
- Dynamic key usage via `SYSTEM_CONFIG_KEYS` — excellent pattern preventing magic strings.
- NPSN regex `/^\d{8}$/` matches actual NPSN spec (8-digit). NSS regex `/^\d{12}$/` matches spec.
- `academicConfigSchema` regex `/^\d{4}\/\d{4}$/` doesn't validate that second year > first year (e.g., `2025/2024` passes). **LOW.**
- `systemConfigValueSchema` allows any string key — no enforcement that keys are from `ALL_SYSTEM_CONFIG_KEYS`.

### Type Inference

`settings.ts:65-66`: Uses `z.infer<typeof schoolInfoSchema>` and `z.infer<typeof systemConfigValueSchema>` — correct pattern. No other schemas export inferred types.

---

## 6. Crypto Implementation

### crypto.ts — Correct AES-256-GCM

| Property | Implementation | Verdict |
|----------|---------------|---------|
| Algorithm | `aes-256-gcm` | Correct |
| Key source | `process.env.DOCUMENT_ENCRYPTION_KEY` | Correct |
| Key length | 32 bytes (enforced at module load) | Correct |
| IV length | 12 bytes (NIST recommended) | Correct |
| Auth tag | 16 bytes | Correct |
| Output format | `[IV][ciphertext][authTag]` | Correct |
| Key derivation | Direct UTF-8 buffer (no KDF) | Acceptable — env key is the secret |

**No issues found.** Implementation follows established patterns. One suggestion:

- **LOW:** No KDF (PBKDF2/scrypt) for key derivation. If the env key is user-supplied passphrase-derived, adding a KDF would strengthen it. For now, the error message says "32 characters for UTF-8" which implies a fixed-length key is expected — acceptable for env-var-based config.

---

## 7. Constants Audit

### constants.ts — All Values Cross-Referenced

- `UserRole` type matches seed roles: superadmin, administrator, guru, siswa, alumni — verified against permissions seed.
- `NAV_ITEMS` paths match route structure. All icon imports are correct Phosphor React components.
- `USER_MENU_ITEMS` has `{ divider: true }` — the type for this array isn't explicitly defined, so the divider is an untyped object. **LOW:** Adding a proper discriminated union type would catch breakage.

---

## 8. Inconsistencies Across Components

### Icon Consistency

- `breadcrumb.tsx:4-19`: Uses inline SVG for ChevronRight instead of `@phosphor-icons/react` `CaretRight`.
- All other components use Phosphor icons consistently.

### forwardRef Pattern Inconsistency

- `button.tsx`: Function component (no forwardRef)
- `card.tsx`: forwardRef on all sub-components
- `dialog.tsx`: forwardRef on Content, Overlay, Title, Description
- `sheet.tsx`: No forwardRef anywhere
- This inconsistency means some components can be ref-targeted and others cannot. Not a bug, but inconsistent DX.

### Import Style

- Some files use `import * as React from "react"` (breadcrumb, card, checkbox, scroll-area, switch, tabs)
- Some files use `import type * as React from "react"` (avatar, badge, button, collapsible, dropdown-menu, separator, sheet, tooltip)
- Some files don't import React at all (empty-state, page-shell, skeleton use types from icons/utils only)
- Some use `type { ... }` imports mixed with value imports — a TypeScript `isolatedModules` concern but works with `verbatimModuleSyntax`.

---

## Summary

### Count per Severity

| Severity | Count | Files |
|----------|-------|-------|
| **HIGH** | 7 | button.tsx, checkbox.tsx, collapsible.tsx, scroll-area.tsx, sheet.tsx, switch.tsx, tabs.tsx |
| **MEDIUM** | 3 | data-table.tsx (confirm), breadcrumb.tsx (li separator), grades.ts (incomplete) |
| **LOW** | 8 | table.tsx (unnecessary use client), card.tsx (no data-slot), avatar.tsx (fallback a11y), empty-state.tsx (a11y), constants.ts (divider type), settings.ts (year ordering), data-table.tsx (co-located utils), resource-form.tsx (type) |

### Top 3 Critical Fixes

1. **HIGH — Add `'use client'` to 7 Radix-wrapping components** (button, checkbox, collapsible, scroll-area, sheet, switch, tabs). These will cause runtime errors when rendered in server component page trees. Each file needs `"use client";` as the first line, before any imports.

2. **MEDIUM — Replace `confirm()` in data-table.tsx with Dialog component.** The blocking browser dialog is inconsistent UX and inaccessible. The project already has a `Dialog` component — use it for delete confirmation.

3. **MEDIUM — Add grade value validation schemas** (grades.ts). Currently only `gradeTypeSchema` is exported. If grade submission Server Actions exist, score/subject/teacher validation is missing.
