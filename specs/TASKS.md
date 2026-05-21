# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.

---

## Active Goals

### Phase 1: Fix better-auth — auth is broken

**Why:** Auth completely non-functional. Login sets no cookie, userId type mismatch, missing required fields. Blocks everything.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** None

**Definition of done:** See `specs/issues.md` — all 9 issues resolved. Login via Server Action persists session.

---

### Phase 2: Project scaffolding

**Why:** Clean foundation before feature work. Fix migration journal, empty API routes for SSO, git hooks.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 1

**Definition of done:**
- [ ] Migration journal synced with actual migration files
- [ ] Empty API route placeholders created
- [ ] `auth-client.ts` created
- [ ] AGENTS.md updated
- [ ] Pre-commit hooks (typecheck + lint)

---

### Phase 3: User management

**Why:** Auth + all user CRUD + student self-registration with admin approval.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 1

**Definition of done:**
- [ ] better-auth `signUpEmail()` for student registration
- [ ] Student registration → pending → admin approval flow
- [ ] Admin creates staff accounts (guru, admin) from dashboard
- [ ] `additionalFields.roleId` integrated with RBAC
- [ ] Alumni accounts created by admin only
- [ ] Profile CRUD
- [ ] `profile_assets` upload

---

### Phase 4: Academic core (classes, majors, subjects, semesters)

**Why:** Base data for enrollments and grades.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 3

**Definition of done:**
- [ ] Classes CRUD
- [ ] Majors CRUD
- [ ] Subjects CRUD
- [ ] Semesters CRUD
- [ ] Teacher assignment to classes/subjects
- [ ] Academic year setup UI

---

### Phase 5: Enrollments

**Why:** Student registration per semester (KRS).

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 4

**Definition of done:**
- [ ] Enrollment CRUD per semester
- [ ] Admin assigns student to class for semester
- [ ] Bulk enrollment by class
- [ ] Enrollment status (active, transferred, dropped)

---

### Phase 6: Grade management

**Why:** Core school function — grade input and storage.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 5

**Definition of done:**
- [ ] Grade input UI (admin per subject per student)
- [ ] Score: 1-100
- [ ] Predicate computed from score (E/D/C/B/A)
- [ ] Grade view per student per semester
- [ ] Grade edit history
- [ ] Final grade calculation

---

### Phase 7: Payments (SPP + variable fees)

**Why:** Financial tracking — SPP monthly + school fees.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 3

**Definition of done:**
- [ ] Payment method CRUD
- [ ] SPP config (amount, due date)
- [ ] Student payment records
- [ ] Variable fees (book, exam, activity)
- [ ] Payment confirmation by admin
- [ ] Payment reports

---

### Phase 8: Announcements

**Why:** Internal communication system.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 3

**Definition of done:**
- [ ] Announcement CRUD
- [ ] Publish/unpublish
- [ ] Recipient filtering
- [ ] Read receipts
- [ ] Dashboard display

---

### Phase 9: Official documents (SKHU, Ijazah, Rapor)

**Why:** Legal requirements for Indonesian schools.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 6

**Definition of done:**
- [ ] Rapor template (per semester, print-ready PDF)
- [ ] SKHU template
- [ ] Ijazah template
- [ ] Transcript generation
- [ ] PDF export per government format

---

### Phase 10: Alumni access

**Why:** Graduates need read-only transcript access.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 9

**Definition of done:**
- [ ] Alumni login
- [ ] View own transcript
- [ ] Download/print transcript
- [ ] No write access

---

### Phase 11: Dashboard & navigation

**Why:** Coherent app shell with role-based menus.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 3

**Definition of done:**
- [ ] Role-based sidebar navigation
- [ ] Per-role dashboard
- [ ] Quick stats widget
- [ ] Profile dropdown

---

### Phase 12: Deployment (VPS)

**Why:** Production-ready deployment on VPS.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** All above

**Definition of done:**
- [ ] PM2 setup
- [ ] Nginx reverse proxy
- [ ] Environment config
- [ ] Database backup
- [ ] Git deploy hook
- [ ] Health check

---

## Archived Goals

_None yet — first session._
