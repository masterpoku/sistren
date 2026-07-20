"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  classes,
  majors,
  roles,
  semesters,
  subjects,
  teacherClassSubjects,
  users,
} from "@/lib/db/schema";
import {
  assignTeacherSchema,
  classSchema,
  idSchema,
  majorSchema,
  semesterSchema,
  subjectSchema,
  updateClassSchema,
  updateMajorSchema,
  updateSemesterSchema,
  updateSubjectSchema,
} from "@/lib/validation/schemas/academic";

// Assignments are immutable: edits are delete+create, no updateAssignment action.

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

  const parsed = classSchema.safeParse({
    name: formData.get("name"),
    majorId: formData.get("majorId"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, majorId, capacity } = parsed.data;

  const [major] = await db
    .select({ name: majors.name })
    .from(majors)
    .where(eq(majors.id, majorId))
    .limit(1);

  if (!major) return { error: "Jurusan tidak ditemukan." };

  const code = `${name.trim()}-${major.name.trim()}`;

  const [existing] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.code, code), isNull(classes.deletedAt)))
    .limit(1);

  if (existing) {
    return { error: "Kombinasi kelas & jurusan sudah ada." };
  }

  await db.insert(classes).values({
    name: name.trim(),
    code,
    majorId,
    capacity: capacity ?? null,
  });

  revalidatePath("/academic/classes");
  return { success: true };
}

export async function updateClass(classId: string, formData: FormData) {
  await verifyRoleLevel(60);

  const parsed = updateClassSchema.safeParse({
    classId,
    name: formData.get("name"),
    majorId: formData.get("majorId"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, majorId, capacity } = parsed.data;

  const [major] = await db
    .select({ name: majors.name })
    .from(majors)
    .where(eq(majors.id, majorId))
    .limit(1);

  if (!major) return { error: "Jurusan tidak ditemukan." };

  const code = `${name.trim()}-${major.name.trim()}`;

  const [existing] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.code, code), isNull(classes.deletedAt)))
    .limit(1);

  if (existing && existing.id !== parsed.data.classId) {
    return { error: "Kode kelas sudah digunakan kelas lain." };
  }

  await db
    .update(classes)
    .set({ name: name.trim(), code, majorId, capacity: capacity ?? null })
    .where(eq(classes.id, parsed.data.classId));

  revalidatePath("/academic/classes");
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
    return { error: "Kelas tidak ditemukan." };
  }

  // Soft delete
  await db
    .update(classes)
    .set({ deletedAt: new Date() })
    .where(eq(classes.id, Number(classId)));

  revalidatePath("/academic/classes");
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

  const parsed = majorSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, description } = parsed.data;

  const [existing] = await db
    .select({ id: majors.id })
    .from(majors)
    .where(and(eq(majors.name, name.trim()), isNull(majors.deletedAt)))
    .limit(1);

  if (existing) {
    return { error: "Nama jurusan sudah ada." };
  }

  await db.insert(majors).values({
    name: name.trim(),
    description: description?.trim() || null,
  });

  revalidatePath("/academic/classes");
  return { success: true };
}

export async function updateMajor(majorId: string, formData: FormData) {
  await verifyRoleLevel(60);

  const parsed = updateMajorSchema.safeParse({
    majorId,
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, description } = parsed.data;

  const [existing] = await db
    .select({ id: majors.id })
    .from(majors)
    .where(and(eq(majors.name, name.trim()), isNull(majors.deletedAt)))
    .limit(1);

  if (existing && existing.id !== parsed.data.majorId) {
    return { error: "Nama jurusan sudah digunakan." };
  }

  await db
    .update(majors)
    .set({ name: name.trim(), description: description?.trim() || null })
    .where(eq(majors.id, parsed.data.majorId));

  revalidatePath("/academic/classes");
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
    return { error: "Jurusan tidak ditemukan." };
  }

  await db
    .update(majors)
    .set({ deletedAt: new Date() })
    .where(eq(majors.id, Number(majorId)));

  revalidatePath("/academic/classes");
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
      classCode: classes.code,
    })
    .from(subjects)
    .leftJoin(classes, eq(subjects.classId, classes.id))
    .where(isNull(subjects.deletedAt))
    .orderBy(subjects.name);
}

export async function createSubject(formData: FormData) {
  await verifyRoleLevel(60);

  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || null,
    classId: formData.get("classId"),
    majorId: formData.get("majorId") || null,
    credits: formData.get("credits") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, code, classId, majorId, credits } = parsed.data;

  if (code?.trim()) {
    const [existing] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.code, code.trim()), isNull(subjects.deletedAt)))
      .limit(1);
    if (existing) {
      return { error: "Kode mapel sudah ada." };
    }
  }

  await db.insert(subjects).values({
    name: name.trim(),
    code: code?.trim() || null,
    classId,
    majorId: majorId ?? null,
    credits,
  });

  revalidatePath("/academic/subjects");
  return { success: true };
}

export async function updateSubject(subjectId: string, formData: FormData) {
  await verifyRoleLevel(60);

  const parsed = updateSubjectSchema.safeParse({
    subjectId,
    name: formData.get("name"),
    code: formData.get("code") || null,
    classId: formData.get("classId"),
    majorId: formData.get("majorId") || null,
    credits: formData.get("credits") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, code, classId, majorId, credits } = parsed.data;

  if (code?.trim()) {
    const [existing] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.code, code.trim()), isNull(subjects.deletedAt)))
      .limit(1);
    if (existing && existing.id !== parsed.data.subjectId) {
      return { error: "Kode mapel sudah digunakan mapel lain." };
    }
  }

  await db
    .update(subjects)
    .set({
      name: name.trim(),
      code: code?.trim() || null,
      classId,
      majorId: majorId ?? null,
      credits,
    })
    .where(eq(subjects.id, parsed.data.subjectId));

  revalidatePath("/academic/subjects");
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
    return { error: "Mapel tidak ditemukan." };
  }

  await db
    .update(subjects)
    .set({ deletedAt: new Date() })
    .where(eq(subjects.id, Number(subjectId)));

  revalidatePath("/academic/subjects");
  return { success: true };
}

// Semesters CRUD

export async function getSemesters() {
  await verifySession();
  return db
    .select()
    .from(semesters)
    .where(isNull(semesters.deletedAt))
    .orderBy(semesters.academicYear, semesters.name);
}

export async function createSemester(formData: FormData) {
  await verifyRoleLevel(60);

  const parsed = semesterSchema.safeParse({
    name: formData.get("name"),
    academicYear: formData.get("academicYear"),
    isActive:
      formData.get("isActive") === "true" || formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, academicYear, isActive } = parsed.data;

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

  revalidatePath("/academic/semesters");
  return { success: true };
}

export async function setActiveSemester(semesterId: string) {
  await verifyRoleLevel(60);

  const parsed = idSchema.safeParse(semesterId);
  if (!parsed.success) {
    return { error: "ID semester tidak valid" };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(semesters)
      .set({ isActive: false })
      .where(isNull(semesters.deletedAt));
    await tx
      .update(semesters)
      .set({ isActive: true })
      .where(eq(semesters.id, parsed.data));
  });

  revalidatePath("/academic/semesters");
  return { success: true };
}

export async function updateSemester(semesterId: string, formData: FormData) {
  await verifyRoleLevel(60);

  const parsed = updateSemesterSchema.safeParse({
    semesterId,
    name: formData.get("name"),
    academicYear: formData.get("academicYear"),
    isActive:
      formData.get("isActive") === "true" || formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, academicYear, isActive } = parsed.data;

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
    .where(eq(semesters.id, parsed.data.semesterId));

  revalidatePath("/academic/semesters");
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
    return { error: "Semester tidak ditemukan." };
  }

  await db
    .update(semesters)
    .set({ deletedAt: new Date() })
    .where(eq(semesters.id, Number(semesterId)));

  revalidatePath("/academic/semesters");
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
      classCode: classes.code,
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
  await verifyRoleLevel(80);

  const parsed = assignTeacherSchema.safeParse({
    teacherId: formData.get("teacherId"),
    classId: formData.get("classId"),
    subjectId: formData.get("subjectId"),
    semesterId: formData.get("semesterId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { teacherId, classId, subjectId, semesterId } = parsed.data;

  const [teacher] = await db
    .select({ id: users.id, roleId: users.roleId })
    .from(users)
    .where(and(eq(users.id, teacherId), isNull(users.deletedAt)))
    .limit(1);

  if (!teacher) {
    return { error: "Guru tidak ditemukan." };
  }

  if (teacher.roleId !== 60) {
    return { error: "Hanya guru yang bisa ditugaskan." };
  }

  const [existing] = await db
    .select({ id: teacherClassSubjects.id })
    .from(teacherClassSubjects)
    .where(
      and(
        eq(teacherClassSubjects.teacherId, teacherId),
        eq(teacherClassSubjects.classId, classId),
        eq(teacherClassSubjects.subjectId, subjectId),
        eq(teacherClassSubjects.semesterId, semesterId),
        isNull(teacherClassSubjects.deletedAt)
      )
    )
    .limit(1);

  if (existing) {
    return { error: "Tugas sudah ada." };
  }

  await db.insert(teacherClassSubjects).values({
    teacherId,
    classId,
    subjectId,
    semesterId,
  });

  revalidatePath("/academic/assignments");
  return { success: true };
}

export async function removeAssignment(assignmentId: string) {
  await verifyRoleLevel(80);

  const parsed = idSchema.safeParse(assignmentId);
  if (!parsed.success) {
    return { error: "ID tugas tidak valid" };
  }

  await db
    .update(teacherClassSubjects)
    .set({ deletedAt: new Date() })
    .where(eq(teacherClassSubjects.id, parsed.data));

  revalidatePath("/academic/assignments");
  return { success: true };
}

// Form action wrappers — return void for Next.js form action compatibility.
