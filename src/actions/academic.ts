'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  classes,
  majors,
  subjects,
  semesters,
  users,
  roles,
  teacherClassSubjects,
} from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { verifyRoleLevel } from '@/lib/auth/verify-session';

// Classes CRUD

export async function getClasses() {
  await verifyRoleLevel(60);
  return db
    .select()
    .from(classes)
    .where(isNull(classes.deletedAt))
    .orderBy(classes.name);
}

export async function createClass(formData: FormData) {
  await verifyRoleLevel(60);

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;

  if (!name?.trim() || !code?.trim()) {
    return { error: 'Nama dan kode wajib diisi.' };
  }

  // Check duplicate code
  const [existing] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.code, code.trim()), isNull(classes.deletedAt)))
    .limit(1);

  if (existing) {
    return { error: 'Kode kelas sudah ada.' };
  }

  await db.insert(classes).values({
    name: name.trim(),
    code: code.trim(),
  });

  revalidatePath('/academic/classes');
  return { success: true };
}

export async function updateClass(classId: string, formData: FormData) {
  await verifyRoleLevel(60);

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;

  if (!name?.trim() || !code?.trim()) {
    return { error: 'Nama dan kode wajib diisi.' };
  }

  // Check duplicate code (excluding self)
  const [existing] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.code, code.trim()), isNull(classes.deletedAt)))
    .limit(1);

  if (existing && existing.id !== Number(classId)) {
    return { error: 'Kode kelas sudah digunakan kelas lain.' };
  }

  await db
    .update(classes)
    .set({ name: name.trim(), code: code.trim() })
    .where(eq(classes.id, Number(classId)));

  revalidatePath('/academic/classes');
  return { success: true };
}

export async function deleteClass(classId: string) {
  await verifyRoleLevel(60);

  const [existing] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.id, Number(classId)), isNull(classes.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: 'Kelas tidak ditemukan.' };
  }

  // Soft delete
  await db
    .update(classes)
    .set({ deletedAt: new Date() })
    .where(eq(classes.id, Number(classId)));

  revalidatePath('/academic/classes');
  return { success: true };
}

// Majors CRUD

export async function getMajors() {
  await verifyRoleLevel(60);
  return db
    .select()
    .from(majors)
    .where(isNull(majors.deletedAt))
    .orderBy(majors.name);
}

export async function createMajor(formData: FormData) {
  await verifyRoleLevel(60);

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name?.trim()) {
    return { error: 'Nama jurusan wajib diisi.' };
  }

  const [existing] = await db
    .select({ id: majors.id })
    .from(majors)
    .where(and(eq(majors.name, name.trim()), isNull(majors.deletedAt)))
    .limit(1);

  if (existing) {
    return { error: 'Nama jurusan sudah ada.' };
  }

  await db.insert(majors).values({
    name: name.trim(),
    description: description?.trim() || undefined,
  });

  revalidatePath('/academic/majors');
  return { success: true };
}

export async function updateMajor(majorId: string, formData: FormData) {
  await verifyRoleLevel(60);

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name?.trim()) {
    return { error: 'Nama jurusan wajib diisi.' };
  }

  const [existing] = await db
    .select({ id: majors.id })
    .from(majors)
    .where(and(eq(majors.name, name.trim()), isNull(majors.deletedAt)))
    .limit(1);

  if (existing && existing.id !== Number(majorId)) {
    return { error: 'Nama jurusan sudah digunakan jurusan lain.' };
  }

  await db
    .update(majors)
    .set({ name: name.trim(), description: description?.trim() || undefined })
    .where(eq(majors.id, Number(majorId)));

  revalidatePath('/academic/majors');
  return { success: true };
}

export async function deleteMajor(majorId: string) {
  await verifyRoleLevel(60);

  const [existing] = await db
    .select({ id: majors.id })
    .from(majors)
    .where(and(eq(majors.id, Number(majorId)), isNull(majors.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: 'Jurusan tidak ditemukan.' };
  }

  await db
    .update(majors)
    .set({ deletedAt: new Date() })
    .where(eq(majors.id, Number(majorId)));

  revalidatePath('/academic/majors');
  return { success: true };
}

// Subjects CRUD

export async function getSubjects() {
  await verifyRoleLevel(60);
  return db
    .select({
      id: subjects.id,
      name: subjects.name,
      code: subjects.code,
      classId: subjects.classId,
      majorId: subjects.majorId,
      credits: subjects.credits,
      description: subjects.description,
      className: classes.name,
    })
    .from(subjects)
    .leftJoin(classes, eq(subjects.classId, classes.id))
    .where(isNull(subjects.deletedAt))
    .orderBy(subjects.name);
}

export async function createSubject(formData: FormData) {
  await verifyRoleLevel(60);

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const classId = formData.get('classId') as string;
  const majorId = formData.get('majorId') as string;
  const creditsStr = formData.get('credits') as string;

  if (!name?.trim() || !classId) {
    return { error: 'Nama dan kelas wajib diisi.' };
  }

  if (code?.trim()) {
    const [existing] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.code, code.trim()), isNull(subjects.deletedAt)))
      .limit(1);
    if (existing) {
      return { error: 'Kode mapel sudah ada.' };
    }
  }

  await db.insert(subjects).values({
    name: name.trim(),
    code: code?.trim() || null,
    classId: Number(classId),
    majorId: majorId ? Number(majorId) : null,
    credits: creditsStr ? Number(creditsStr) : 0,
  });

  revalidatePath('/academic/subjects');
  return { success: true };
}

export async function updateSubject(subjectId: string, formData: FormData) {
  await verifyRoleLevel(60);

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const classId = formData.get('classId') as string;
  const majorId = formData.get('majorId') as string;
  const creditsStr = formData.get('credits') as string;

  if (!name?.trim() || !classId) {
    return { error: 'Nama dan kelas wajib diisi.' };
  }

  if (code?.trim()) {
    const [existing] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.code, code.trim()), isNull(subjects.deletedAt)))
      .limit(1);
    if (existing && existing.id !== Number(subjectId)) {
      return { error: 'Kode mapel sudah digunakan mapel lain.' };
    }
  }

  await db
    .update(subjects)
    .set({
      name: name.trim(),
      code: code?.trim() || null,
      classId: Number(classId),
      majorId: majorId ? Number(majorId) : null,
      credits: creditsStr ? Number(creditsStr) : 0,
    })
    .where(eq(subjects.id, Number(subjectId)));

  revalidatePath('/academic/subjects');
  return { success: true };
}

export async function deleteSubject(subjectId: string) {
  await verifyRoleLevel(60);

  const [existing] = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(and(eq(subjects.id, Number(subjectId)), isNull(subjects.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: 'Mapel tidak ditemukan.' };
  }

  await db
    .update(subjects)
    .set({ deletedAt: new Date() })
    .where(eq(subjects.id, Number(subjectId)));

  revalidatePath('/academic/subjects');
  return { success: true };
}

// Semesters CRUD

export async function getSemesters() {
  await verifyRoleLevel(60);
  return db
    .select()
    .from(semesters)
    .where(isNull(semesters.deletedAt))
    .orderBy(semesters.academicYear, semesters.name);
}

export async function createSemester(formData: FormData) {
  await verifyRoleLevel(60);

  const name = formData.get('name') as string;
  const academicYear = formData.get('academicYear') as string;
  const isActiveStr = formData.get('isActive') as string;

  if (!name?.trim() || !academicYear?.trim()) {
    return { error: 'Nama dan tahun ajaran wajib diisi.' };
  }

  const isActive = isActiveStr === 'true';

  // If setting as active, deactivate all others first
  if (isActive) {
    await db
      .update(semesters)
      .set({ isActive: false })
      .where(isNull(semesters.deletedAt));
  }

  await db.insert(semesters).values({
    name: name.trim(),
    academicYear: academicYear.trim(),
    isActive,
  });

  revalidatePath('/academic/semesters');
  return { success: true };
}

export async function setActiveSemester(semesterId: string) {
  await verifyRoleLevel(60);

  await db.transaction(async (tx) => {
    // Deactivate all
    await tx
      .update(semesters)
      .set({ isActive: false })
      .where(isNull(semesters.deletedAt));
    // Activate selected
    await tx
      .update(semesters)
      .set({ isActive: true })
      .where(eq(semesters.id, Number(semesterId)));
  });

  revalidatePath('/academic/semesters');
  return { success: true };
}

export async function updateSemester(semesterId: string, formData: FormData) {
  await verifyRoleLevel(60);

  const name = formData.get('name') as string;
  const academicYear = formData.get('academicYear') as string;
  const isActiveStr = formData.get('isActive') as string;

  if (!name?.trim() || !academicYear?.trim()) {
    return { error: 'Nama dan tahun ajaran wajib diisi.' };
  }

  const isActive = isActiveStr === 'true';

  // If setting as active, deactivate all others first
  if (isActive) {
    await db
      .update(semesters)
      .set({ isActive: false })
      .where(isNull(semesters.deletedAt));
  }

  await db
    .update(semesters)
    .set({
      name: name.trim(),
      academicYear: academicYear.trim(),
      isActive,
    })
    .where(eq(semesters.id, Number(semesterId)));

  revalidatePath('/academic/semesters');
  return { success: true };
}

export async function deleteSemester(semesterId: string) {
  await verifyRoleLevel(60);

  const [existing] = await db
    .select({ id: semesters.id })
    .from(semesters)
    .where(
      and(eq(semesters.id, Number(semesterId)), isNull(semesters.deletedAt))
    )
    .limit(1);

  if (!existing) {
    return { error: 'Semester tidak ditemukan.' };
  }

  await db
    .update(semesters)
    .set({ deletedAt: new Date() })
    .where(eq(semesters.id, Number(semesterId)));

  revalidatePath('/academic/semesters');
  return { success: true };
}

// Teacher Assignments CRUD

export async function getTeachers() {
  await verifyRoleLevel(60);
  // Get users with role level 60 (guru) via drizzle join
  const result = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(roles.level, 60), isNull(users.deletedAt)))
    .orderBy(users.name);
  return result;
}

export async function getAssignments() {
  await verifyRoleLevel(60);
  // Use drizzle's query builder for type-safe joins
  const result = await db
    .select({
      id: teacherClassSubjects.id,
      teacherId: teacherClassSubjects.teacherId,
      classId: teacherClassSubjects.classId,
      subjectId: teacherClassSubjects.subjectId,
      semesterId: teacherClassSubjects.semesterId,
      teacherName: users.name,
      className: classes.name,
      subjectName: subjects.name,
      semesterName: semesters.name,
      academicYear: semesters.academicYear,
    })
    .from(teacherClassSubjects)
    .innerJoin(users, eq(teacherClassSubjects.teacherId, users.id))
    .innerJoin(classes, eq(teacherClassSubjects.classId, classes.id))
    .innerJoin(subjects, eq(teacherClassSubjects.subjectId, subjects.id))
    .innerJoin(semesters, eq(teacherClassSubjects.semesterId, semesters.id))
    .where(isNull(teacherClassSubjects.deletedAt))
    .orderBy(
      semesters.academicYear,
      semesters.name,
      classes.name,
      subjects.name
    );

  return result;
}

export async function assignTeacher(formData: FormData) {
  await verifyRoleLevel(80); // admin only

  const teacherId = formData.get('teacherId') as string;
  const classId = formData.get('classId') as string;
  const subjectId = formData.get('subjectId') as string;
  const semesterId = formData.get('semesterId') as string;

  if (!teacherId || !classId || !subjectId || !semesterId) {
    return { error: 'Semua field wajib diisi.' };
  }

  // Verify teacher has guru role (roleId = 60)
  const [teacher] = await db
    .select({ id: users.id, roleId: users.roleId })
    .from(users)
    .where(and(eq(users.id, teacherId), isNull(users.deletedAt)))
    .limit(1);

  if (!teacher) {
    return { error: 'Guru tidak ditemukan.' };
  }

  if (teacher.roleId !== 60) {
    return { error: 'Hanya guru yang bisa ditugaskan.' };
  }

  // Check for duplicate
  const [existing] = await db
    .select({ id: teacherClassSubjects.id })
    .from(teacherClassSubjects)
    .where(
      and(
        eq(teacherClassSubjects.teacherId, teacherId),
        eq(teacherClassSubjects.classId, Number(classId)),
        eq(teacherClassSubjects.subjectId, Number(subjectId)),
        eq(teacherClassSubjects.semesterId, Number(semesterId)),
        isNull(teacherClassSubjects.deletedAt)
      )
    )
    .limit(1);

  if (existing) {
    return { error: 'Tugas sudah ada.' };
  }

  await db.insert(teacherClassSubjects).values({
    teacherId,
    classId: Number(classId),
    subjectId: Number(subjectId),
    semesterId: Number(semesterId),
  });

  revalidatePath('/academic/assignments');
  return { success: true };
}

export async function removeAssignment(assignmentId: string) {
  await verifyRoleLevel(80);

  await db
    .update(teacherClassSubjects)
    .set({ deletedAt: new Date() })
    .where(eq(teacherClassSubjects.id, Number(assignmentId)));

  revalidatePath('/academic/assignments');
  return { success: true };
}

// Form action wrappers — return void for Next.js form action compatibility.
// TODO: Refactor to useActionState for proper error feedback + toast.

export async function createClassAction(formData: FormData) {
  await createClass(formData);
}

export async function createMajorAction(formData: FormData) {
  await createMajor(formData);
}

export async function createSubjectAction(formData: FormData) {
  await createSubject(formData);
}

export async function createSemesterAction(formData: FormData) {
  await createSemester(formData);
}
