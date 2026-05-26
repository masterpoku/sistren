---
name: shadcn-ui-integration
description: >-
  Set up or upgrade shadcn/ui in a Next.js project. Use when initializing a new shadcn project,
  adding shadcn to an existing Next.js app, fixing theme configuration, setting up dark mode,
  or adding shadcn components via CLI.
  Triggers on: "set up shadcn", "add shadcn to next.js", "shadcn theming", "dark mode next-themes",
  "shadcn init", "bunx shadcn@latest".
---

## When to use

Use when:

- Starting a fresh shadcn/ui integration
- Adding shadcn to an existing Next.js project
- Fixing broken theme variables or dark mode
- Adding shadcn components via CLI
- Setting up ThemeProvider in root layout
- Upgrading to Tailwind v4 theming

Do NOT use when:

- Setting up shadcn in a non-Next.js framework (use Vite/Astro skill instead)
- Just adding a single component (use the CLI directly: `bunx shadcn@latest add button`)
- Fixing a broken custom component (not a shadcn integration issue)

## Steps

### 1. Check current state

```bash
# Does components.json exist?
cat components.json 2>/dev/null || echo "NOT FOUND"
# Is next-themes installed?
bun pm ls next-themes 2>/dev/null || echo "NOT INSTALLED"
# Check Tailwind version
cat package.json | grep tailwind
```

### 2. Initialize shadcn via CLI

```bash
bunx shadcn@latest init
```

When prompted:

- **Style**: `base-nova` (Sistren default)
- **Base color**: `neutral`
- **CSS file**: `src/assets/global.css` (Sistren path)
- **Tailwind config**: leave blank for v4 (no tailwind.config.ts)
- **CSS variables**: `true`
- **SSR**: `true` for Next.js App Router
- **Icon library**: `phosphor` (Sistren uses Phosphor)
- **Jest**: `false`

The CLI creates `components.json` + `lib/utils.ts` with `cn()`.

### 3. Install next-themes for dark mode

```bash
bun add next-themes
```

### 4. Create ThemeProvider

Create `src/components/theme-provider.tsx`:

```tsx
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 5. Wrap root layout

In `src/app/layout.tsx`:

```tsx
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` is required — server/client render theme class differently.

### 6. Add shadcn components

```bash
bunx shadcn@latest add button card input label
# Add more as needed per feature
bunx shadcn@latest add dialog dropdown-menu table tabs badge avatar
```

### 7. Verify setup

```bash
bun run typecheck
bun run build
```

Should compile without errors. Dark mode toggle should work.

## Gotchas

- **Tailwind v4 = no tailwind.config.ts** — `tailwind.config` in components.json must be blank string `""`. If you see a tailwind.config.ts, that's v3 — do not create one for v4.
- **CSS variables under `:root` + `.dark`** — shadcn v1 uses CSS variables for theming. Your `global.css` must define tokens under `:root` (light) and `.dark` (dark mode override).
- **OKLCH over HSL** — shadcn recommends OKLCH for new themes. Use `oklch()` in CSS variables instead of `hsl()` where possible.
- **bun runtime**: always use `bun` not `npm`/`pnpm` for shadcn CLI commands.
- **`rsc: false` in components.json** if components need client-side rendering only. Default is `true`.
- **ThemeProvider is "use client"** — it must have `"use client"` directive even when used in Server Component layout.

## Output format

After setup, verify these files exist:

| File                                | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| `components.json`                   | CLI config, aliases, installed components |
| `lib/utils.ts`                      | `cn()` utility                            |
| `src/components/theme-provider.tsx` | Dark mode provider                        |
| `src/app/layout.tsx`                | Root layout with ThemeProvider            |
| `src/app/globals.css`               | CSS variables + `@theme inline`           |

Verify dark mode: toggle system preference, page should respond without flash.

## Dependencies

- bun runtime
- Next.js 14+ (App Router)
- Tailwind CSS v4
- `next-themes` package
- `clsx` + `tailwind-merge` + `class-variance-authority`
- `@radix-ui/react-*` primitives (installed per component)

## Quality checklist

- [ ] `components.json` created with correct paths
- [ ] `cn()` utility works in `lib/utils.ts`
- [ ] ThemeProvider wraps root layout
- [ ] `<html suppressHydrationWarning>` present
- [ ] Dark mode toggle works (system pref, light, dark)
- [ ] First shadcn component (`button`) renders correctly
- [ ] `bun run typecheck` passes zero errors
