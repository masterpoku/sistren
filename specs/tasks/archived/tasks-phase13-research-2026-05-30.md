# Phase 13 — UI/UX Alignment: Research Brief

## Situation

Sistren has 30 routes built with Next.js 16, Tailwind CSS v4, shadcn/ui, @phosphor-icons/react, recharts, and @tanstack/react-table. Build passes clean. Core functionality (auth, enrollments, payments, announcements, documents, alumni) all complete. But UI diverges from the design reference (Vite SPA prototype in `docs/references/`).

## Complication

15 gaps documented in `specs/ui-gaps.md`. Critical: no page padding, no desktop header, sidebar not collapsible, heading size mismatch. High: DataTable not integrated (exists but unused), dashboard has no charts, student academic/finance views missing. All 23 page.tsx files in `src/app/(app)/` need updates.

## Research Findings

### 1. Sidebar Migration

**Current state:** Custom `<Sidebar>` component at `src/components/layout/sidebar.tsx` — fixed `w-64`, no collapsible, mobile overlay.

**Reference state:** shadcn/ui `<Sidebar>` with `collapsible="icon"`, `SidebarProvider`, `SidebarInset`, `SidebarTrigger`, role-based nav via `SidebarMenu`, alumni theme via className prop.

**Required packages:** `@radix-ui/react-separator` already installed. Sidebar package needs install via:

```bash
bunx shadcn@latest add sidebar
```

This adds: SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarRail.

**SidebarProvider requires `cookies()` from 'next/headers'** for state persistence:

```tsx
import { cookies } from 'next/headers';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function ProtectedLayout({ children }) {
  const cookieStore = cookies();
  const state =
    cookieStore.get('sidebar:state')?.value === 'collapsed'
      ? 'collapsed'
      : 'expanded';

  return <SidebarProvider defaultState={state} />;
}
```

**Key behavior:** `collapsible="icon"` on `<Sidebar>` enables icon-only mode. `group-data-[collapsible=icon]:hidden` CSS selector controls content visibility when collapsed. `SidebarMenuButton` supports `tooltip` prop for hover text when collapsed.

### 2. Desktop Header

Reference has: breadcrumb (SISTREN / currentTab), search input `w-[300px]`, bell notification with red dot badge, user avatar + name + ID, SidebarTrigger.

**Implementation:** Create `src/components/layout/header.tsx` as client component (`'use client'`). Sticky header using `sticky top-0 z-10`. Profile avatar via existing `@/components/ui/avatar`. Breadcrumb via existing `@/components/ui/breadcrumb`.

**SidebarTrigger integration:** `<SidebarTrigger className="h-9 w-9" />` from shadcn sidebar. Must be inside `<SidebarProvider>` context.

### 3. Dashboard Charts

**Current state:** Dashboard shows stat cards only. No charts.

**Reference state:** Admin gets `LineChart` (student registration trend). Siswa/Alumni get `AreaChart` (nilai/IP over semesters). Both use recharts via shadcn `ChartContainer`.

**Existing code:** `src/components/ui/chart.tsx` has `ChartContainer`, `ChartTooltipContent`, `ChartLegendContent` — already integrated with recharts. `ChartContainer` takes `config` prop for color theming.

**Usage pattern:**

```tsx
<ChartContainer
  config={
    {
      /* key: { label, color } */
    }
  }
  className="h-[300px] w-full"
>
  <ResponsiveContainer>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="semester" />
      <YAxis domain={[0, 100]} />
      <ChartTooltipContent />
      <Area
        type="monotone"
        dataKey="gpa"
        name="Nilai"
        stroke="#0f172a"
        fill="url(#colorGpa)"
      />
    </AreaChart>
  </ResponsiveContainer>
</ChartContainer>
```

**Data needed for charts:** Need server-side query to get grade data (from enrollments + student_documents.rapor). Currently no structured grades — only document upload. Chart data may be mock/placeholder for siswa view until Phase 6 v2.

### 4. DataTable Integration

**Current state:** `DataTable` component at `src/components/ui/data-table.tsx` — fully implemented with search, sort, pagination, row selection, Excel/CSV export, import. BUT no page actually uses it.

**Pages that need DataTable:** enrollments, students, teachers, users, announcements, finance (admin payment list), academic (class/list views).

**Pattern:** Each page imports `DataTable`, defines `ColumnDef<TData, TValue>[]`, passes data. Export filename, searchKey prop per column.

### 5. Page Padding + Heading Normalization

All 23 pages need:

- Wrapper change: `space-y-6` → `flex flex-col gap-6 p-4 md:p-6`
- Heading: `text-2xl font-bold` → `text-3xl font-bold tracking-tight`

### 6. Student Academic Page (KRS/KHS)

Reference: `docs/references/src/features/academic/Academic.tsx` — Tabs (KRS, KHS, Transkrip, Jadwal). KHS shows course table with grade, SKS, IP cumulative footer. Uses `MOCK_COURSES` data.

**Implementation path:** Create `src/app/(app)/academic/student/page.tsx`. Use existing `@/components/ui/tabs` (already installed). Data for courses comes from `enrollments` + `student_documents.rapor` (Rapor PDF). For v1, may use mock/placeholder data since structured grades don't exist yet.

### 7. Student Finance Page

Reference: `docs/references/src/features/finance/Finance.tsx` — summary cards (Total Tagihan bg-primary, Status Pembayaran, Metode Favorit), bills table with AlertCircle icon, history table with History icon.

**Implementation path:** Update `src/app/(app)/payments/page.tsx` — role check: if roleLevel === 40 (siswa), show student finance view; if >= 80, keep existing admin view.

### 8. Attendance Page

Reference has `Attendance.tsx` — stat cards (total hadir, sakit, izin, alpha) + riwayat table with date filter.

**Schema gap:** No `attendance` table in current schema. Need to assess if attendance is needed for v1 or deferred. Attendance schema would be: `attendance(id, studentId, date, status enum('hadir','sakit','izin','alpha'), notes, createdAt, deletedAt)`.

**Decision:** This may need a separate schema + action. Flag as potential deferral.

### 9. Empty State Component

Reference doesn't have a consistent EmptyState — but implementation pages have ad-hoc `{list.length === 0}` checks.

**Implementation:** Create `src/components/ui/empty-state.tsx` — icon prop, title, description, optional action slot.

---

## Dependency Analysis

### Package Dependencies

- `@radix-ui/react-separator` — ✅ already installed
- `lucide-react` — in reference, but **KEEP phosphor-icons** per user request
- `recharts` — ✅ already installed (`^3.8.1`)
- `@tanstack/react-table` — ✅ already installed (`^8.21.3`)
- `xlsx` + `papaparse` — ✅ already in DataTable
- `@radix-ui/react-tooltip` — ✅ already installed

### New shadcn components needed:

```bash
bunx shadcn@latest add sidebar
```

Adds ~13 new components. This is the main dependency.

---

## MECE Decomposition

**Phase 13 tasks split into 3 layers:**

### Layer 1: Foundation (must do first)

- Install shadcn sidebar package (unblocks AppLayoutClient rewrite)
- Update AppLayoutClient with SidebarProvider + SidebarInset
- Create AppHeader component (header.tsx)
- Migrate sidebar to shadcn collapsible

### Layer 2: Visual Consistency (depends on Layer 1)

- Page padding + heading normalization (23 files)
- Card stat pattern normalization
- EmptyState component

### Layer 3: Feature Completion (independent, can parallelize)

- Dashboard charts + alumni banner
- DataTable integration across pages
- Student academic page (KRS/KHS/Transkrip)
- Student finance page
- Attendance page (schema decision needed)

---

## Edge Cases

1. **SidebarProvider cookies() in layout.tsx** — Must be in a Server Component. `cookies()` from 'next/headers' throws in Client Components. AppLayoutClient is already `'use client'` — SidebarProvider must be in the parent server layout, SidebarTrigger inside client boundary.

2. **Alumni sidebar theme** — Reference uses `.alumni-sidebar` CSS class on sidebar for yellow theme. In shadcn sidebar, this is passed as `className` prop on `<Sidebar className={cn("...", isAlumni && "alumni-sidebar")}>`.

3. **Chart in Server Component** — `ChartContainer` is a client component (uses React hooks). Must wrap in `'use client'` boundary. Dashboard page is server, DashboardClient is client — charts go in DashboardClient.

4. **Attendance schema** — If attendance table doesn't exist, the page can't be built. Need to either create schema (Phase 14?) or defer attendance.

5. **DataTable used in server-rendered pages** — DataTable is client (uses `useReactTable` hook). Pages using it must be `'use client'` or wrap table in client component boundary.

6. **Page padding vs existing layout** — Adding `p-4 md:p-6` to page wrapper divs is safe, but some pages may have their own nested padding. Verify on a few pages before doing all 23.

---

## Next Steps

Before planning execution, confirm:

1. Run `bunx shadcn@latest add sidebar` — what components get installed? (verify dependencies)
2. Check if `attendance` table should be created in this phase or deferred
3. Confirm student academic page uses real data or mock (enrollments + rapor PDF only in v1)
