---
name: ui-anti-isolops
description: >-
  Produce UI components that integrate with the Sistren design system (shadcn/ui + Tailwind v4).
  Use when building any UI component, form, page layout, or visual feature — ensures components
  use design tokens, follow shadcn conventions, and are layout-agnostic.
  Triggers on: "build UI", "create component", "add form", "design page", "custom variant",
  "create button", "build card", "create dialog", "make layout".
---

## When to use

Use when:
- Building any new UI element (button, card, form, table, badge, etc.)
- Creating a page layout or composing multiple components
- Adding a custom variant to an existing component
- Creating a custom component from scratch
- Reviewing UI code for design system compliance

Do NOT use when:
- Running terminal commands (use shadcn-ui-integration skill instead)
- Working on non-UI code (auth, DB schema, API logic)
- The UI task is purely data-fetching without rendering (use server actions skill)

## Design System Rules

### 1. Colors from tokens only

NEVER use raw hex or HSL values in component files. Use design tokens:

```tsx
// ❌ WRONG — hardcoded color
<div className="bg-blue-600 text-white" />

// ✅ CORRECT — design token
<div className="bg-primary text-primary-foreground" />

// ❌ WRONG — hardcoded hex
<button className="bg-[#1a365d]" />

// ✅ CORRECT — CSS variable via token
<button className="bg-[hsl(var(--primary))]" />
```

**Design token reference** (defined in `globals.css` under `:root`):

| Token | Usage |
|-------|-------|
| `background / foreground` | Page shell, default text |
| `card / card-foreground` | Elevated surfaces, panels |
| `popover / popover-foreground` | Floating surfaces |
| `primary / primary-foreground` | High-emphasis actions, brand |
| `secondary / secondary-foreground` | Lower-emphasis actions |
| `muted / muted-foreground` | Placeholders, helper text |
| `accent / accent-foreground` | Hover, focus, active states |
| `destructive / destructive-foreground` | Errors, destructive actions |
| `border` | Cards, menus, tables, dividers |
| `input` | Form controls |
| `ring` | Focus rings |

### 2. Always extend shadcn first

Before building a custom component, check if shadcn covers the use case:

```bash
bunx shadcn@latest search "card"
bunx shadcn@latest add card
```

Custom components are last resort — document why shadcn doesn't fit.

### 3. Use `cn()` for all conditional classes

```tsx
import { cn } from "@/lib/utils"

// ❌ WRONG — template literal
<div className={`base-class ${condition ? "extra" : """}`} />

// ✅ CORRECT — cn() merges properly
<div className={cn("base-class", condition && "extra")} />
```

### 4. Variant prop naming

shadcn components use `variant` prop with standard values. Do NOT invent custom names.

```tsx
// ✅ CORRECT — standard shadcn variant values
<Button variant="default" />
<Button variant="ghost" />
<Button variant="destructive" />
<Button variant="outline" />
<Button variant="secondary" />

// ❌ WRONG — non-standard variant
<Button variant="primary-action" />
```

### 5. Server Components by default

Add `'use client'` ONLY when necessary:

```tsx
// Server Component (default)
export function DataTable({ data }) { ... }

// Client Component (only when hooks/browser APIs needed)
"use client"
export function ThemeToggle() { useState(), onClick, etc. }
```

**Hint**: If it uses `useState`, `useEffect`, `onClick`, `onChange`, or browser APIs → client. Otherwise → server.

### 6. Layout-agnostic components

Components must NOT contain layout-specific logic. Keep them reusable:

```tsx
// ❌ WRONG — component contains sidebar logic
export function SidebarNav() {
  const { collapsed } = useSidebar()
  return <nav className={cn("flex", collapsed ? "w-16" : "w-64")} />
}

// ✅ CORRECT — component accepts props, layout decision is external
export function SidebarNav({ collapsed }: { collapsed: boolean }) {
  return <nav className={cn("flex transition-all", collapsed ? "w-16" : "w-64")} />
}
```

### 7. Document custom variants inline

If you must extend a component with a custom variant:

```tsx
// Custom badge variant for attendance status
// Non-standard variants: "attended" (green), "absent" (red), "late" (amber)
// These map to shadcn's color tokens but use semantic names
const badgeVariants = cva("...", {
  variants: {
    variant: {
      attended: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      absent: "bg-red-500/10 text-red-700 border-red-500/20",
      late: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
  },
})
```

## Compliance Checklist

Before any UI code is considered done:

- [ ] All colors use design tokens (`hsl(var(--token))` or Tailwind token utilities)
- [ ] No raw hex/HSL hardcoded in component files
- [ ] `cn()` used for all conditional class merging
- [ ] Variant props follow shadcn naming conventions
- [ ] No `'use client'` without explicit justification in a comment
- [ ] Components accept layout via props, not internal state
- [ ] Custom variants documented inline
- [ ] `bun run typecheck` passes zero errors
- [ ] Component renders correctly in both light and dark themes

## Common Patterns

### Card with header + content + footer

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </CardFooter>
</Card>
```

### Form field pattern

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="name@example.com" />
</div>
```

### Data table row with hover state

```tsx
import { TableRow, TableCell } from "@/components/ui/table"

<TableRow className="hover:bg-muted/50 transition-colors">
  <TableCell>Data</TableCell>
</TableRow>
```

## Gotchas

- **CSS variables MUST be in `hsl()` format**: `hsl(var(--primary))` — NOT `var(--primary)` directly. The `hsl()` wrapper is what makes the token system work with alpha transparency.
- **Tailwind v4 removes some utilities**: `shadow-sm` → `shadow-xs`, `rounded-sm` → `rounded-xs`. Check if a utility exists before using it.
- **Sistren uses `src/assets/global.css`** — not `app/globals.css`. Update `components.json` css path if CLI asks.
- **`size-*` over `w-* h-*`** — in Tailwind v4, use `size-*` instead of separate `w-*` and `h-*`.
- **Icons are Phosphor** — Sistren uses `@phosphor-icons/react`. Import from there, not `lucide-react`.
- **Dark mode class toggle** — shadcn dark mode uses `.dark` class on `<html>`. The `next-themes` provider handles this automatically.

## Quality verification

Run after any UI work:

```bash
bun run typecheck
bun run lint
bun run build
```

All must pass. Dark mode must work. Components must render in both themes.