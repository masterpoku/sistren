# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.

---

## Active Goals

### FIX: better-auth critical auth failures (6 critical issues)

**Why:** Auth is broken — login via Server Actions doesn't set cookies (missing nextCookies), userId type mismatch (BIGINT vs STRING), missing required fields. Users cannot log in or appear logged out after refresh.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** None (critical path — must be fixed first)

**Definition of done:** 
- [ ] `sessions.userId` and `accounts.userId` changed to string
- [ ] `nextCookies` plugin added to auth config
- [ ] `emailVerified` field added to `users` table
- [ ] `accounts` table has all required fields (refreshTokenExpiresAt, scope, accountId NOT NULL)
- [ ] Route renamed to `[...all]`
- [ ] Login via Server Action verified working (cookie is set)
- [ ] Soft-deleted users cannot access system via active sessions

---

### FIXME: better-auth schema audit — 6 critical issues found

**Why:** See `specs/issues.md` for full evidence. Three most likely auth-breaking: (1) BIGINT userId vs STRING expected, (2) missing nextCookies plugin, (3) missing emailVerified field. These explain why login appears to work but session never persists.

**Opened:** 2026-05-21

**Status:** documented

**Depends-on:** None

**Definition of done:** Issues resolved and verified.

---

## Archived Goals

_None yet — first session._