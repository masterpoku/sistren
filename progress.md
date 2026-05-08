# Progress

## Status
In Progress

## Tasks
- [x] Scout: src/lib/auth/ — COMPLETE
- [x] Scout: src/hooks/ — COMPLETE
- [x] Scout: src/components/auth/ — COMPLETE
- [x] Scout: middleware.ts existence check — COMPLETE
- [x] Scout: src/features/ & src/app/(app)/ feature pages — COMPLETE
- [x] Scout: src/lib/db/ (schema, queries, seeds) — COMPLETE

## Files Changed
- `scout/auth-rbac.txt` — written (auth/RBAC scout findings)
- `scout/features-pages.txt` — written (feature pages implementation status)
- `scout/db-schema.txt` — written (database schema & query status)

## Feature Pages Implementation Status
| Feature | Data Source | Permission Wrapper | Status |
|---------|------------|-------------------|--------|
| dashboard | Real DB (partial) | ❌ | 🟡 Partial |
| students | Mock Data | ❌ | 🔴 Mock |
| teachers | Mock Data | ❌ | 🔴 Mock |
| users | Mock Data | ❌ | 🔴 Mock |
| finance | Mock Data | ❌ | 🔴 Mock |
| academic | Mock Data | ❌ | 🔴 Mock |
| profile | LocalStorage | ❌ | 🟡 Partial |
| announcements | Mock Data | ❌ | 🔴 Mock |

## Database Schema — 21 Tables

| Table | Query Status | CRUD Coverage |
|-------|-------------|---------------|
| users | ✅ getAllUsers, getUserById, getUserRole | READ only |
| roles | ❌ No queries | STUB |
| profiles | ❌ No queries | STUB |
| profile_assets | ❌ No queries | STUB |
| majors | ✅ getMajors | READ only |
| classes | ✅ getClasses | READ only |
| subjects | ❌ No queries | STUB |
| semesters | ✅ getSemesters | READ only |
| enrollments | ❌ No queries | STUB |
| grades | ❌ No queries | STUB |
| payments | ✅ getPayments | READ only |
| payment_methods | ❌ No queries | STUB |
| announcements | ✅ getAnnouncements | READ only |
| announcement_recipients | ❌ No queries | STUB |
| permissions | ❌ No queries | STUB |
| role_permissions | ❌ No queries | STUB |
| user_permissions | ✅ grantPermission, revokePermission (auth/permissions.ts) | CREATE only |
| accounts | ❌ No queries | STUB |
| sessions | ❌ No queries | STUB |
| verifications | ❌ No queries | STUB |
| system_configs | ❌ No queries | STUB |

**Tables with COMPLETE CRUD:** NONE (all are READ-only or STUB)

**Missing Query Implementations (Critical):**
1. profiles — All CRUD (user profile pages need this)
2. subjects — All CRUD (academic management)
3. grades — All CRUD (grade input/display)
4. enrollments — All CRUD (student registration)
5. CREATE/UPDATE/DELETE for all existing READ-only queries

**Mock Data Still In Use:**
- MOCK_STUDENTS, MOCK_TEACHERS, MOCK_PAYMENTS, MOCK_USERS_LIST
- MOCK_ACADEMIC_RECORDS, MOCK_COURSES, MOCK_ANNOUNCEMENTS

## Notes
- RBAC system is mostly implemented: permissions logic, DB schema, API endpoint, client hooks, gated components all exist
- **Critical missing piece: `middleware.ts`** — route-level protection layer is not created despite `route-permissions.ts` explicitly referencing it
- No TODO/FIXME markers in auth code
- `use-permissions.ts` is at `src/hooks/`, not `src/lib/auth/`
- `use-mobile.ts` is at `src/hooks/`, not `src/lib/auth/`
- Superadmin bypass at `roleLevel >= 100` is implemented across all permission checks

## Feature Pages Notes
- **RequirePermission wrapper**: NOT USED anywhere in feature pages
- **Mock data location**: `/src/constants.ts` and `/src/util/mock/`
- **Real DB pattern exists**: Dashboard uses `fetchDashboardStats()` → `getDashboardStats()` as pattern to replicate
- **Profile page issue**: Uses `localStorage.getItem('sistren_user')` instead of auth session
