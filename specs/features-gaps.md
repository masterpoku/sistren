# Feature Gaps — Old PHP vs New Next.js

**Premise:** Old `docs/oldphp/sister_spt` was incomplete. If a feature differs in the new app, the new version is the reference. Only features that existed and worked in the old app but are absent in the new app are listed here.

---

## 1. Payment Items Catalog (Product)

**Old route:** `portal/product` — CRUD with name, price, type (general/event), active toggle.
**New status:** ❌ Missing entirely.

The new app has `payment_methods` (bank accounts, payment channels) but no **product/item catalog**. Payments are recorded inline with a manual description + price — no reusable items, no catalog management.

This is the most significant gap. Without it, every payment is ad-hoc with no standardized items students pay for (SPP, uang gedung, daftar ulang, etc.).

---

## 2. Auth Boarding Page

**Old route:** `auth/boarding` — post-registration welcome/onboarding page with form completion flow.
**New status:** ❌ Missing.

After registration, students land directly on the app with no onboarding. The old app had a multi-step boarding page to complete profile data after first login.

---

## 3. School Settings UI

**Old route:** `portal/settings/sekolah` — route exists (GET/POST), but the view was an empty shell (sidebar + navbar only, no actual form).
**New status:** ⚠️ Partial.

The `system_configs` table exists with seed data (school name, address, phone, academic year). But there's **no management page** in the new app either. Neither version has a working UI — the table just sits there.

**Note:** Since the old app never had a working school settings form either, this gap is lower priority than it looks. The data model is ready, only the UI is missing.

---

## Summary

| Gap | Old Status | Priority |
|-----|-----------|----------|
| Payment Items Catalog | Fully working CRUD | **High** |
| Auth Boarding Page | Working route + view | Low |
| School Settings UI | Route existed, view was empty | Low (both incomplete) |

**Recommendation:** Only the **payment items catalog** is a real gap worth addressing. The boarding page is nice-to-have; school settings UI is low effort since the table already exists.
