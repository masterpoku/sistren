# Code Review: Feature Components

**Scout**: `surti-mucikari`
**Date**: 2026-06-15
**Scope**: All 43 `.tsx` files in `src/features/` across 22 directories
**Method**: Archaeological Layered Reconnaissance (ALR): grep/ripgrep pattern analysis + targeted file reads

---

## 1. `'use client'` Directive

**Verdict: ✓ CLEAN** — All 43 files have `"use client";` as line 1.

No false negatives — every component using hooks, Phosphor icons, or browser APIs is correctly marked.

---

## 2. Icon Imports

**Verdict: ✓ Mostly clean, 1 exception**

| File | Import Path | Verdict |
|------|------------|---------|
| 14 files | `@phosphor-icons/react` | ✓ Correct |
| `boarding/BoardingClient.tsx:3` | `@phosphor-icons/react/dist/ssr` | ⚠️ HIGH |

**Issue: BoardingClient.tsx line 3**
```tsx
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
```
`/dist/ssr` is the server-side subpath export. In a `"use client"` component this works technically but is semantically wrong — the SSR bundle may include server-only dependencies. Should use `@phosphor-icons/react`.

---

## 3. `alert()` Calls

**Verdict: ✓ CLEAN** — Zero `alert(` calls found across all 43 feature files.

Sprint 10 debt fully resolved for feature components.

---

## 4. DataTable Usage

**Verdict: ✓ 20 use shared DataTable, 1 hybrid exception**

- **20 files** import `DataTable` from `@/components/ui/data-table` — correct shared component usage
- **1 file** (`academic/GradesClient.tsx`) uses `DataTableShell` wrapper + raw shadcn `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` for the inline-editable grade grid

**Note (LOW)**: GradesClient.tsx lines 7, 272, 317-473 uses a hybrid approach. The raw shadcn Table inside DataTableShell is acceptable for the inline-editable cells (each cell is an `<Input>`), but it bypasses the column-definition pattern used everywhere else. If the grade grid ever needs sorting/filtering, this would need refactoring to standard DataTable with cell formatters.

---

## 5. Form Patterns

### 5a. Label Spacing: ✓ Consistent
All forms use `space-y-2` for label-input groups. Consistent across the codebase.

### 5b. Cancel Buttons: ✓ Correct
- `SemesterFormCard.tsx:43` — `Button type="reset" variant="outline"` 
- `SubjectFormCard.tsx:72` — `Button type="reset" variant="outline"`
- `PaymentItemDialog.tsx:84` — `DialogClose` + `Button variant="outline"`
- No `<a href>` cancel links found ✓

### 5c. Raw HTML `<select>` (bypassing shadcn Select)

**4 instances across 3 files — HIGH severity**

| File | Line | Usage |
|------|------|-------|
| `finance/RecordPaymentForm.tsx` | 60 | `<select id="studentId">` — student picker |
| `finance/RecordPaymentForm.tsx` | 77 | `<select id="paymentItemId">` — payment item picker |
| `academic/StudentAcademicClient.tsx` | 264 | `<select>` — semester filter dropdown |
| `settings/SystemConfigsClient.tsx` | 175 | `<select id="add-key">` — config key picker |

All use `className="flex h-10 w-full rounded-md border..."` to mimic shadcn styling manually. These bypass:
- Theme-consistent styling updates
- Keyboard accessibility quirks differences
- Potential form validation integration

Should be replaced with shadcn `<Select>` component.

---

## 6. Error Handling Patterns

### 6a. `throw new Error` in form handlers — HIGH

| File | Line | Code |
|------|------|------|
| `finance/RecordPaymentForm.tsx` | 49 | `throw new Error(result.error)` |
| `payments/PaymentItemDialog.tsx` | 62 | `throw new Error(result.error)` |
| `payments/PaymentItemDialog.tsx` | 67 | `throw new Error(result.error)` |

These throw during form action execution. In Next.js server actions or `form action` handlers, an unhandled throw will cause the form submission to reject without user feedback — no toast, no inline message. The error message is lost.

**Fix**: Replace `throw new Error(...)` with `toast({ variant: "destructive", description: result.error })` or inline error state.

### 6b. Toast pattern: ✓ 8 files use proper `useToast`

| File | Pattern |
|------|---------|
| `AssignmentsClient.tsx` | toast on error |
| `AdminUsersClient.tsx` | toast on success + error |
| `AnnouncementsClient.tsx` | toast on error |
| `PaymentCatalogClient.tsx` | toast on success + error |
| `PaymentItemsClient.tsx` | toast on success + error |
| `PaymentMethodsClient.tsx` | toast on error |
| `StudentFinanceClient.tsx` | toast on info |
| `ProfileClient.tsx` | toast on error (2 calls) |

### 6c. Inline error state pattern — 4 files use message state

| File | Approach |
|------|----------|
| `LoginFormClient.tsx` | `errorMessage` state, rendered as `<p>` |
| `DocumentUploadForm.tsx` | `errorMessage` state |
| `BulkEnrollmentForm.tsx` | `message` object (type + text) |
| `SchoolSettingsForm.tsx` | `status` enum + `errorMessage` |

**Consistency note (LOW)**: Mixed approach — some use toast, some use inline messages. Not inherently wrong but inconsistent UX. Inline is better for forms (stays visible), toast for list actions.

---

## 7. Soft Delete Awareness

**Verdict: ✗ NONE** — Zero references to `deletedAt`, `softDelete`, `isNull`, or any soft-delete filtering in feature components.

All 43 client components delegate to server actions. If the server actions filter soft-deleted records, this is fine. But there is zero client-side awareness — no components display "this record was deleted" states, no undo buttons, no visual indicators.

**Risk (MEDIUM)**: If a server action returns soft-deleted records (e.g., due to a missing `isNull(table.deletedAt)` filter), the client will display them without distinction.

---

## 8. Direct DOM Manipulation — MEDIUM

| File | Line | Pattern |
|------|------|---------|
| `finance/RecordPaymentForm.tsx` | 38, 41 | `document.getElementById("description")` / `document.getElementById("price")` |
| `calendar/CalendarClient.tsx` | 291, 306 | `document.getElementById("allDay")` / `document.getElementById("isPublic")` |

In React 19, refs (`useRef`) are preferred. `document.getElementById` breaks component isolation and creates subtle bugs if the same component renders twice.

**CalendarClient.tsx** uses this to sync Switch state to hidden inputs — acceptable workaround but should use controlled Switch + hidden input.

**RecordPaymentForm.tsx** uses this to auto-fill description/price from selected item — should use controlled inputs (useState) instead.

---

## 9. Missing React Error Boundaries

**Verdict: ✗ Not found** — No `<ErrorBoundary>` or `error.tsx` usage within feature components.

If a `throw new Error` in PaymentItemDialog or RecordPaymentForm propagates, the entire page crashes with no fallback UI. Next.js App Router supports `error.tsx` at route level, but individual feature components have no boundaries.

**Risk (MEDIUM)**: A single unhandled error in a dialog or form can crash the entire page.

---

## Summary

### Count per Severity

| Severity | Count | Issues |
|----------|-------|--------|
| **HIGH** | 4 | BoardingClient.tsx SSR icon import; 3x `throw new Error` in form actions |
| **MEDIUM** | 6 | 4× raw HTML `<select>`; 2× `document.getElementById` DOM access |
| **LOW** | 3 | GradesClient.tsx hybrid Table; mixed error UX; 0 soft-delete awareness |

### Top 3 Critical Fixes

1. **`throw new Error` in form actions** — `RecordPaymentForm.tsx:49`, `PaymentItemDialog.tsx:62,67`. Replace with toast or inline error. Unhandled throws crash form submission silently. **(HIGH)**

2. **Raw HTML `<select>` elements** — `RecordPaymentForm.tsx:60,77`, `StudentAcademicClient.tsx:264`, `SystemConfigsClient.tsx:175`. Replace with shadcn `<Select>` for theme consistency and accessibility. **(MEDIUM)**

3. **`document.getElementById` anti-pattern** — `RecordPaymentForm.tsx:38,41`, `CalendarClient.tsx:291,306`. Replace with React refs or controlled state. **(MEDIUM)**

### Additional Items Flagged

- **BoardingClient.tsx:3** — Import from `@phosphor-icons/react/dist/ssr` should be `@phosphor-icons/react` **(HIGH)**
- **No React Error Boundaries** anywhere in feature components — consider route-level `error.tsx` **(MEDIUM)**
- **Soft-delete awareness**: Zero client-side handling — verify server actions filter `deletedAt` **(LOW)**
