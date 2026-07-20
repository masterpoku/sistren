/**
 * Seed script: 1 year dummy attendance data (2025-07-19 → 2026-07-19).
 *
 * Classes with active enrollments: X-IPA (11), X-TKJ (13), XI-PKD (16).
 * School days only (Mon–Fri). Weighted status: ~82% hadir.
 * Insert via Drizzle ORM with onDuplicateKeyUpdate for idempotency.
 *
 * Usage: bun run scripts/seed-attendance.ts
 */

import { and, asc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { attendance, classes, enrollments, subjects, users } from "@/lib/db/schema";

// ─── Config ────────────────────────────────────────────

const START_DATE = "2025-07-19";
const END_DATE = "2026-07-19";

const STATUS_WEIGHTS: [string, number][] = [
  ["present", 0.82],
  ["late", 0.04],
  ["sick", 0.05],
  ["permit", 0.05],
  ["absent", 0.04],
];

// ─── Helpers ───────────────────────────────────────────

function isSchoolDay(d: Date): boolean {
  const day = d.getDay();
  return day >= 1 && day <= 5; // Mon–Fri
}

function weightedRandom(): string {
  const r = Math.random();
  let cumulative = 0;
  for (const [status, weight] of STATUS_WEIGHTS) {
    cumulative += weight;
    if (r < cumulative) return status;
  }
  return "present";
}

/** Create Date at UTC midnight — same pattern as startOfToday() in attendance.ts.
 *  Drizzle ORM formats this as "YYYY-MM-DD 00:00:00.000" (ISO string minus T/Z),
 *  which MariaDB interprets as local (WIB) time — matching how startOfToday() stores. */
function utcMidnight(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── Main ──────────────────────────────────────────────

async function main() {
  console.log("Fetching target data...");

  // 1. Classes with active enrollments
  const targetClasses = await db
    .select({ id: classes.id, code: classes.code, majorId: classes.majorId })
    .from(classes)
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.classId, classes.id),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt),
      ),
    )
    .where(isNull(classes.deletedAt))
    .groupBy(classes.id);

  console.log(`Found ${targetClasses.length} classes with active enrollments.`);

  // 2. Subjects per class (same filter as getAttendanceSubjects)
  type SubjectRow = { id: number; name: string };
  const subjectsByClass = new Map<number, SubjectRow[]>();
  for (const cls of targetClasses) {
    const rows = await db
      .select({ id: subjects.id, name: subjects.name })
      .from(subjects)
      .where(
        and(
          eq(subjects.classId, cls.id),
          cls.majorId
            ? or(eq(subjects.majorId, cls.majorId), isNull(subjects.majorId))
            : isNull(subjects.majorId),
          isNull(subjects.deletedAt),
        ),
      )
      .orderBy(asc(subjects.name));
    subjectsByClass.set(cls.id, rows);
  }

  // 3. Enrollments per class
  type EnrRow = { id: number; studentName: string };
  const enrollmentsByClass = new Map<number, EnrRow[]>();
  for (const cls of targetClasses) {
    const rows = await db
      .select({
        id: enrollments.id,
        studentName: users.name,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(
        and(
          eq(enrollments.classId, cls.id),
          eq(enrollments.status, "active"),
          isNull(enrollments.deletedAt),
        ),
      )
      .orderBy(asc(users.name));
    enrollmentsByClass.set(cls.id, rows);
  }

  // 4. Log the plan
  let totalPlanned = 0;
  for (const cls of targetClasses) {
    const enrs = enrollmentsByClass.get(cls.id) ?? [];
    const subs = subjectsByClass.get(cls.id) ?? [];
    console.log(`  ${cls.code} (class ${cls.id}): ${enrs.length} students × ${subs.length} subjects`);
    totalPlanned += enrs.length * subs.length;
  }

  // 5. Iterate dates
  let current = START_DATE;
  let dayCount = 0;
  let insertedCount = 0;
  let skippedWeekend = 0;

  const startTime = Date.now();

  while (current <= END_DATE) {
    const d = utcMidnight(current);
    if (!isSchoolDay(d)) {
      skippedWeekend++;
      current = addDays(current, 1);
      continue;
    }

    dayCount++;
    const sessionDate = d;

    for (const cls of targetClasses) {
      const enrs = enrollmentsByClass.get(cls.id) ?? [];
      const subs = subjectsByClass.get(cls.id) ?? [];

      if (enrs.length === 0 || subs.length === 0) continue;

      const batch = [];
      for (const enr of enrs) {
        for (const sub of subs) {
          batch.push({
            classId: cls.id,
            enrollmentId: enr.id,
            subjectId: sub.id,
            sessionDate,
            status: weightedRandom() as any,
            recordedById: null,
            notes: null,
          });
        }
      }

      await db
        .insert(attendance)
        .values(batch)
        .onDuplicateKeyUpdate({
          set: { status: attendance.status },
        });

      insertedCount += batch.length;
    }

    if (dayCount % 30 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  Day ${dayCount} (${current}) — ${insertedCount} rows so far (${elapsed}s)`);
    }

    current = addDays(current, 1);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone! ${dayCount} school days, ${insertedCount} attendance rows in ${elapsed}s`);
  console.log(`(skipped ${skippedWeekend} weekend days)`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
