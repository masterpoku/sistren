"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { decryptBlob, encryptBlob } from "@/lib/crypto";
import { db } from "@/lib/db";
import {
  classes,
  enrollments,
  notifications,
  rppDocuments,
  subjects,
  users,
} from "@/lib/db/schema";
import {
  archiveRppSchema,
  createRppDraftSchema,
  reviewRppSchema,
  submitRppSchema,
} from "@/lib/validation/schemas/rppDocuments";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function uploadRpp(formData: FormData) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 60) {
    return { error: "Anda tidak memiliki izin." };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { error: "File wajib diisi." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran file maksimal 50MB." };
  }

  const parsed = createRppDraftSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    classId: formData.get("classId"),
    subjectId: formData.get("subjectId"),
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    encryptedData: "placeholder",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch {
    return { error: "Gagal membaca file." };
  }

  let encrypted: Buffer;
  try {
    encrypted = encryptBlob(buffer);
  } catch {
    return { error: "Gagal mengenkripsi file." };
  }

  await db.insert(rppDocuments).values({
    teacherId: session.userId,
    classId: parsed.data.classId,
    subjectId: parsed.data.subjectId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    fileName: parsed.data.fileName,
    fileType: parsed.data.fileType,
    fileSize: parsed.data.fileSize,
    encryptedData: encrypted.toString("base64"),
    status: "draft",
  });

  revalidatePath("/academic/rpp");
  return { success: true };
}

export async function submitRpp(input: { id: number }) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 60) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = submitRppSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  const [doc] = await db
    .select({
      id: rppDocuments.id,
      teacherId: rppDocuments.teacherId,
      status: rppDocuments.status,
    })
    .from(rppDocuments)
    .where(
      and(eq(rppDocuments.id, parsed.data.id), isNull(rppDocuments.deletedAt))
    )
    .limit(1);

  if (!doc) {
    return { error: "RPP tidak ditemukan." };
  }
  if (doc.teacherId !== session.userId) {
    return { error: "Anda bukan pemilik RPP ini." };
  }
  if (doc.status !== "draft") {
    return { error: "Hanya draft yang dapat disubmit." };
  }

  await db
    .update(rppDocuments)
    .set({ status: "submitted" })
    .where(eq(rppDocuments.id, parsed.data.id));

  revalidatePath("/academic/rpp");
  revalidatePath("/academic/rpp/admin");
  return { success: true };
}

export async function reviewRpp(input: {
  id: number;
  decision: "approved" | "rejected";
  rejectionReason?: string;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx?.permissions.has("documents.review_rpp")) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = reviewRppSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  if (parsed.data.decision === "rejected" && !parsed.data.rejectionReason) {
    return { error: "Alasan penolakan wajib diisi." };
  }

  const [doc] = await db
    .select({
      id: rppDocuments.id,
      teacherId: rppDocuments.teacherId,
      status: rppDocuments.status,
    })
    .from(rppDocuments)
    .where(
      and(eq(rppDocuments.id, parsed.data.id), isNull(rppDocuments.deletedAt))
    )
    .limit(1);

  if (!doc) {
    return { error: "RPP tidak ditemukan." };
  }
  if (doc.status !== "submitted") {
    return { error: "Hanya RPP berstatus submitted yang dapat direview." };
  }

  await db
    .update(rppDocuments)
    .set({
      status: parsed.data.decision,
      reviewedBy: session.userId,
      reviewedAt: new Date(),
      rejectionReason:
        parsed.data.decision === "rejected"
          ? (parsed.data.rejectionReason ?? null)
          : null,
    })
    .where(eq(rppDocuments.id, parsed.data.id));

  await db.insert(notifications).values({
    userId: doc.teacherId,
    title:
      parsed.data.decision === "approved" ? "RPP Disetujui" : "RPP Ditolak",
    message:
      parsed.data.decision === "approved"
        ? "RPP Anda telah disetujui dan dapat dilihat oleh siswa."
        : `RPP Anda ditolak. Alasan: ${parsed.data.rejectionReason}`,
    type: "system",
  });

  revalidatePath("/academic/rpp");
  revalidatePath("/academic/rpp/admin");
  return { success: true };
}

export async function archiveRpp(input: { id: number }) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 60) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = archiveRppSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  const [doc] = await db
    .select({ id: rppDocuments.id, teacherId: rppDocuments.teacherId })
    .from(rppDocuments)
    .where(
      and(eq(rppDocuments.id, parsed.data.id), isNull(rppDocuments.deletedAt))
    )
    .limit(1);

  if (!doc) {
    return { error: "RPP tidak ditemukan." };
  }
  if (doc.teacherId !== session.userId && ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  await db
    .update(rppDocuments)
    .set({ deletedAt: new Date() })
    .where(eq(rppDocuments.id, parsed.data.id));

  revalidatePath("/academic/rpp");
  return { success: true };
}

export async function getRppDocuments(options?: {
  status?: "draft" | "submitted" | "approved" | "rejected" | "archived";
  teacherId?: string;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    return { error: "Anda tidak memiliki izin." };
  }

  const conditions = [isNull(rppDocuments.deletedAt)];

  if (ctx.roleLevel < 80) {
    conditions.push(eq(rppDocuments.teacherId, session.userId));
  } else if (options?.teacherId) {
    conditions.push(eq(rppDocuments.teacherId, options.teacherId));
  }

  if (options?.status) {
    conditions.push(eq(rppDocuments.status, options.status));
  } else if (ctx.roleLevel >= 80 && !options?.teacherId) {
    // admin sees all non-archived by default
    conditions.push(eq(rppDocuments.status, "submitted"));
  }

  const rows = await db
    .select({
      id: rppDocuments.id,
      teacherId: rppDocuments.teacherId,
      teacherName: users.name,
      classId: rppDocuments.classId,
      className: classes.name,
      subjectId: rppDocuments.subjectId,
      subjectName: subjects.name,
      title: rppDocuments.title,
      description: rppDocuments.description,
      fileName: rppDocuments.fileName,
      fileType: rppDocuments.fileType,
      fileSize: rppDocuments.fileSize,
      status: rppDocuments.status,
      reviewedBy: rppDocuments.reviewedBy,
      reviewedAt: rppDocuments.reviewedAt,
      rejectionReason: rppDocuments.rejectionReason,
      createdAt: rppDocuments.createdAt,
    })
    .from(rppDocuments)
    .leftJoin(users, eq(rppDocuments.teacherId, users.id))
    .leftJoin(classes, eq(rppDocuments.classId, classes.id))
    .leftJoin(subjects, eq(rppDocuments.subjectId, subjects.id))
    .where(and(...conditions))
    .orderBy(desc(rppDocuments.createdAt));

  return { documents: rows };
}

export async function getRppForClass(classId: number) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    return { error: "Anda tidak memiliki izin." };
  }

  const rows = await db
    .select({
      id: rppDocuments.id,
      title: rppDocuments.title,
      description: rppDocuments.description,
      fileName: rppDocuments.fileName,
      fileType: rppDocuments.fileType,
      fileSize: rppDocuments.fileSize,
      subjectName: subjects.name,
      teacherName: users.name,
      createdAt: rppDocuments.createdAt,
    })
    .from(rppDocuments)
    .leftJoin(users, eq(rppDocuments.teacherId, users.id))
    .leftJoin(subjects, eq(rppDocuments.subjectId, subjects.id))
    .where(
      and(
        eq(rppDocuments.classId, classId),
        eq(rppDocuments.status, "approved"),
        isNull(rppDocuments.deletedAt)
      )
    )
    .orderBy(desc(rppDocuments.createdAt));

  return { documents: rows };
}

export async function getRppForCurrentStudent() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [activeEnrollment] = await db
    .select({ classId: enrollments.classId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, session.userId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .orderBy(desc(enrollments.createdAt))
    .limit(1);

  if (!activeEnrollment) {
    return { documents: [] };
  }

  return getRppForClass(activeEnrollment.classId);
}

export async function downloadRpp(id: number) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [doc] = await db
    .select({
      id: rppDocuments.id,
      teacherId: rppDocuments.teacherId,
      classId: rppDocuments.classId,
      fileName: rppDocuments.fileName,
      fileType: rppDocuments.fileType,
      encryptedData: rppDocuments.encryptedData,
      status: rppDocuments.status,
    })
    .from(rppDocuments)
    .where(and(eq(rppDocuments.id, id), isNull(rppDocuments.deletedAt)))
    .limit(1);

  if (!doc) {
    return { error: "RPP tidak ditemukan." };
  }

  const isOwner = doc.teacherId === session.userId;
  const isAdmin = ctx.roleLevel >= 80;
  let canAccess = isOwner || isAdmin;

  if (!canAccess && doc.status === "approved") {
    const [activeEnrollment] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, session.userId),
          eq(enrollments.classId, doc.classId),
          eq(enrollments.status, "active"),
          isNull(enrollments.deletedAt)
        )
      )
      .limit(1);
    canAccess = Boolean(activeEnrollment);
  }

  if (!canAccess) {
    return { error: "Anda tidak memiliki izin untuk mengunduh RPP ini." };
  }

  try {
    const buffer = Buffer.from(doc.encryptedData, "base64");
    const decrypted = decryptBlob(buffer);
    return {
      buffer: decrypted,
      fileName: doc.fileName,
      fileType: doc.fileType,
    };
  } catch {
    return { error: "Gagal mendekripsi file." };
  }
}
