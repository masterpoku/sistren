# Implementation Gaps — UI Consistency & Functional Audit

> **Audit Date:** 2026-05-30
> **Auditor:** maryono-kolor (via Firefox DevTools)
> **Scope:** All 30+ routes, CSS inspection, console errors, HTTP status, component structure

---

## 1. Functional Bugs

### 1.1 `teacher_class_subjects` Table Missing — 500 Error 🔴

**Route:** `/academic/assignments`
**Console error:**

```
Error: Failed query: select `teacher_class_subjects`.`id`, ...
from `teacher_class_subjects`
Table 'sistren.teacher_class_subjects' doesn't exist
```

**Impact:** Full 500 error page. Blocks the entire "Tugas Guru" feature — cannot assign teachers to classes/subjects.

**Files involved:**
| File | Status |
|------|--------|
| `src/lib/db/schema/teacherClassSubject.ts` | Schema exists ✓ |
| `src/actions/academic.ts` | Uses `getAssignments()` that queries it ✓ |
| `src/app/(app)/academic/assignments/page.tsx` | Crashes fetching data ✗ |
| Migration | Not executed or never generated ✗ |

**Known constraint:** From MEMORY.md — `teacher_class_subjects` unique constraint auto-generated name exceeds 64-char MariaDB limit. Fix was `unique('tcs_unique').on(...)`. Migration may need to be re-generated.

---

## 2. Layout & Component Issues

### 2.1 ToastProvider Double-Wrapped 🟡

`ToastProvider` is instantiated in two places:

- **`src/app/(app)/layout.tsx`** — outer wrapper around `AppLayoutClient`
- **`src/features/layout/AppLayoutClient.tsx`** — wraps `{children}` again

Nested provider instances. One should be removed.

---

## 3. Route & Navigation Issues

### 3.1 `/attendance` Route Missing 🟡

Sidebar has a "Presensi" menu item pointing to `/attendance` (visible to roleLevel >= 40), but no route file exists at `src/app/(app)/attendance/`.

Navigation to this URL shows a 404 client-side.

### 3.2 `/admin` Has No Landing Content 🟢

`src/app/(app)/admin/page.tsx`:

```tsx
await verifyRoleLevel(80);
redirect('/admin/users');
```

Immediately redirects. No admin landing page or dashboard. Consider removing the route or adding content.

### 3.3 `/permissions` Immediately Redirects 🟢

`src/app/(app)/permissions/page.tsx`:

```tsx
await verifyRoleLevel(100);
redirect('/admin/users');
```

Same pattern — redirect with no content. This route is reachable via the sidebar (level 100 only) but shows no UI.

### 3.4 `/alumni/transcript` Redirects Superadmin 🟢

Intentional by design (`maxLevel: 40`), but worth noting: superadmin cannot access the alumni transcript page.

---

## 4. Dark Mode

### 4.1 No Dark Mode Toggle 🟡

Dark mode CSS variables are defined in `global.css` under `.dark`, and `next-themes` ThemeProvider is configured with `defaultTheme="system"`. However, there's no UI toggle (button/switch) in the sidebar or header to switch between light/dark modes. Users relying on system preference get dark mode automatically, but cannot manually switch.

---

## 5. Minor Issues

### 5.1 Missing favicon.ico 🟢

`GET /favicon.ico` returns 404. Minor — visible in browser console/network tab.

---

## 6. Data & Edge Cases

| Observation                                                          | Notes                                     |
| -------------------------------------------------------------------- | ----------------------------------------- |
| Dashboard shows 1 student, 1 teacher, 0 enrollments, 0 announcements | Expected — fresh demo seed data           |
| Finance page accessible only to level ≥ 80                           | Intentional (admin/TU only)               |
| Students page shows "Dokumen" column with no data                    | Expected — documents not uploaded yet     |
| Quick Login buttons on login page work correctly                     | Verified — all 4 roles login successfully |
| Register (PPDB) page exists at `/register`                           | Functional for new student registration   |

---

## 7. Priority Recommendations

| Priority | Item                                                   | Effort | Impact                    |
| -------- | ------------------------------------------------------ | ------ | ------------------------- |
| **P0**   | Run migration to create `teacher_class_subjects` table | Low    | Unblocks assignments page |
| **P1**   | Fix ToastProvider double-wrap                          | Low    | Code cleanliness          |
| **P1**   | Add dark mode toggle UI                                | Medium | UX completeness           |
| **P2**   | Create `/attendance` page or remove sidebar link       | Medium | Navigation accuracy       |
| **P2**   | Add favicon                                            | Low    | Browser UX                |
| **P3**   | Add content to `/admin` landing page                   | Low    | Content completeness      |
| **P3**   | `/permissions` — add content or remove route           | Low    | Dead route cleanup        |

---

## 8. Verified Pages (All Working)

| Route                   | Status | Notes                            |
| ----------------------- | ------ | -------------------------------- |
| `/login`                | ✅     | 4 quick-login buttons functional |
| `/register`             | ✅     | PPDB registration form           |
| `/dashboard`            | ✅     | Stats cards, quick links         |
| `/students`             | ✅     | Table with student data          |
| `/teachers`             | ✅     | Table with teacher data          |
| `/academic`             | ✅     | Overview with stat cards         |
| `/academic/classes`     | ✅     | Class management                 |
| `/academic/subjects`    | ✅     | Subject management               |
| `/academic/majors`      | ✅     | Major/jurusan management         |
| `/academic/semesters`   | ✅     | Semester management              |
| `/academic/assignments` | ❌ 500 | Missing DB table                 |
| `/finance`              | ✅     | Payment records table            |
| `/payments`             | ✅     | Payment management               |
| `/payments/methods`     | ✅     | Payment method config            |
| `/announcements`        | ✅     | CRUD announcements               |
| `/enrollments`          | ✅     | Enrollment management            |
| `/profile`              | ✅     | User profile view                |
| `/users`                | ✅     | User list (level ≥ 80)           |
| `/roles`                | ✅     | Role management (level 100)      |
| `/admin/users`          | ✅     | Admin user management            |
| `/admin/approvals`      | ✅     | Approval system                  |
| `/unauthorized`         | ✅     | Access denied page               |
