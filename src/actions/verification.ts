"use server";

import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { accounts, majors, profiles, religions, studentDocuments, users } from "@/lib/db/schema";
import { completeProfileSchema } from "@/lib/validation/schemas/verification";

export async function getMyProfile() {
  const session = await verifySession();
  const userId = session.userId;

  const [profile] = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      previousSchool: profiles.previousSchool,
      nik: profiles.nik,
      nisn: profiles.nisn,
      birthPlace: profiles.birthPlace,
      birthDate: profiles.birthDate,
      gender: profiles.gender,
      birthOrder: profiles.birthOrder,
      siblingsCount: profiles.siblingsCount,
      address: profiles.address,
      weightKg: profiles.weightKg,
      heightCm: profiles.heightCm,
      phone: profiles.phone,
      religionId: profiles.religionId,
      religionName: religions.name,
      diplomaNumber: profiles.diplomaNumber,
      skhuNumber: profiles.skhuNumber,
      fatherName: profiles.fatherName,
      fatherBirthPlace: profiles.fatherBirthPlace,
      fatherBirthDate: profiles.fatherBirthDate,
      fatherNik: profiles.fatherNik,
      fatherOccupation: profiles.fatherOccupation,
      motherName: profiles.motherName,
      motherBirthPlace: profiles.motherBirthPlace,
      motherBirthDate: profiles.motherBirthDate,
      motherNik: profiles.motherNik,
      motherOccupation: profiles.motherOccupation,
      parentsAddress: profiles.parentsAddress,
      parentsPhone: profiles.parentsPhone,
      majorId: profiles.majorId,
      uniformSize: profiles.uniformSize,
      rejectionReason: profiles.rejectionReason,
      verificationStatus: profiles.verificationStatus,
    })
    .from(profiles)
    .leftJoin(religions, eq(profiles.religionId, religions.id))
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
    .limit(1);

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return { profile, userName: user?.name ?? "" };
}

export async function getStudentReviewData(studentUserId: string) {
  await verifyRoleLevel(60);

  const [profile] = await db
    .select({
      id: profiles.id,
      previousSchool: profiles.previousSchool,
      nik: profiles.nik,
      nisn: profiles.nisn,
      birthPlace: profiles.birthPlace,
      birthDate: profiles.birthDate,
      gender: profiles.gender,
      birthOrder: profiles.birthOrder,
      siblingsCount: profiles.siblingsCount,
      address: profiles.address,
      weightKg: profiles.weightKg,
      heightCm: profiles.heightCm,
      phone: profiles.phone,
      religionId: profiles.religionId,
      religionName: religions.name,
      diplomaNumber: profiles.diplomaNumber,
      skhuNumber: profiles.skhuNumber,
      fatherName: profiles.fatherName,
      fatherBirthPlace: profiles.fatherBirthPlace,
      fatherBirthDate: profiles.fatherBirthDate,
      fatherNik: profiles.fatherNik,
      fatherOccupation: profiles.fatherOccupation,
      motherName: profiles.motherName,
      motherBirthPlace: profiles.motherBirthPlace,
      motherBirthDate: profiles.motherBirthDate,
      motherNik: profiles.motherNik,
      motherOccupation: profiles.motherOccupation,
      parentsAddress: profiles.parentsAddress,
      parentsPhone: profiles.parentsPhone,
      majorId: profiles.majorId,
      majorName: majors.name,
      uniformSize: profiles.uniformSize,
      rejectionReason: profiles.rejectionReason,
      verificationStatus: profiles.verificationStatus,
    })
    .from(profiles)
    .leftJoin(religions, eq(profiles.religionId, religions.id))
    .leftJoin(majors, eq(profiles.majorId, majors.id))
    .where(and(eq(profiles.userId, studentUserId), isNull(profiles.deletedAt)))
    .limit(1);

  const [user] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, studentUserId))
    .limit(1);

  const [docs] = await db
    .select()
    .from(studentDocuments)
    .where(
      and(
        eq(studentDocuments.studentId, studentUserId),
        isNull(studentDocuments.deletedAt)
      )
    )
    .limit(1);

  const DOCUMENT_LABELS: Record<string, string> = {
    kk: "Kartu Keluarga",
    ktpAyah: "KTP Ayah",
    ktpIbu: "KTP Ibu",
    ijasah: "Ijazah Legalisir Asli",
    aktaKelahiran: "Akta Kelahiran",
    nisnDocument: "NISN",
    kip: "KIP",
    passFoto: "Foto 3x4",
  };

  const documentFields = [
    "kk", "ktpAyah", "ktpIbu", "ijasah", "aktaKelahiran",
    "nisnDocument", "kip", "passFoto",
  ] as const;

  const documents = docs
    ? documentFields
        .filter((f) => docs[f])
        .map((f) => ({ key: f, label: DOCUMENT_LABELS[f] ?? f, uploaded: true }))
    : [];

  return {
    profile,
    userName: user?.name ?? "",
    userEmail: user?.email ?? "",
    documents,
  };
}

export async function getReligions() {
  return db
    .select({ id: religions.id, name: religions.name })
    .from(religions)
    .where(isNull(religions.deletedAt))
    .orderBy(religions.name);
}

export async function getMajors() {
  return db
    .select({ id: majors.id, name: majors.name })
    .from(majors)
    .where(isNull(majors.deletedAt))
    .orderBy(majors.name);
}

export async function submitProfile(formData: FormData) {
  const session = await verifySession();

  const raw = {
    previousSchool: formData.get("previousSchool") ?? "",
    nik: formData.get("nik") ?? "",
    birthPlace: formData.get("birthPlace") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    gender: formData.get("gender") ?? "",
    birthOrder: formData.get("birthOrder") ?? "",
    siblingsCount: formData.get("siblingsCount") ?? "",
    address: formData.get("address") ?? "",
    weightKg: formData.get("weightKg") ?? "",
    heightCm: formData.get("heightCm") ?? "",
    phone: formData.get("phone") ?? "",
    religionId: formData.get("religionId") ?? "",
    diplomaNumber: formData.get("diplomaNumber") ?? "",
    skhuNumber: formData.get("skhuNumber") ?? "",
    fatherName: formData.get("fatherName") ?? "",
    fatherBirthPlace: formData.get("fatherBirthPlace") ?? "",
    fatherBirthDate: formData.get("fatherBirthDate") ?? "",
    fatherNik: formData.get("fatherNik") ?? "",
    fatherOccupation: formData.get("fatherOccupation") ?? "",
    motherName: formData.get("motherName") ?? "",
    motherBirthPlace: formData.get("motherBirthPlace") ?? "",
    motherBirthDate: formData.get("motherBirthDate") ?? "",
    motherNik: formData.get("motherNik") ?? "",
    motherOccupation: formData.get("motherOccupation") ?? "",
    parentsAddress: formData.get("parentsAddress") ?? "",
    parentsPhone: formData.get("parentsPhone") ?? "",
    majorId: formData.get("majorId") ?? "",
    uniformSize: formData.get("uniformSize") ?? "",
  };

  const parsed = completeProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const updateValues: Record<string, string | number | Date | null> = {};

  if (parsed.data.previousSchool?.trim()) updateValues.previousSchool = parsed.data.previousSchool;
  if (parsed.data.nik?.trim()) updateValues.nik = parsed.data.nik;
  if (parsed.data.birthPlace?.trim()) updateValues.birthPlace = parsed.data.birthPlace;
  if (parsed.data.birthDate?.trim()) {
    const date = new Date(parsed.data.birthDate);
    if (!Number.isNaN(date.getTime())) updateValues.birthDate = date;
  }
  if (parsed.data.gender) updateValues.gender = parsed.data.gender;
  if (parsed.data.birthOrder?.trim()) updateValues.birthOrder = parseInt(parsed.data.birthOrder, 10);
  if (parsed.data.siblingsCount?.trim()) updateValues.siblingsCount = parseInt(parsed.data.siblingsCount, 10);
  if (parsed.data.address?.trim()) updateValues.address = parsed.data.address;
  if (parsed.data.weightKg?.trim()) updateValues.weightKg = parseInt(parsed.data.weightKg, 10);
  if (parsed.data.heightCm?.trim()) updateValues.heightCm = parseInt(parsed.data.heightCm, 10);
  if (parsed.data.phone?.trim()) updateValues.phone = parsed.data.phone;
  if (parsed.data.religionId?.trim()) updateValues.religionId = parseInt(parsed.data.religionId, 10);
  if (parsed.data.diplomaNumber?.trim()) updateValues.diplomaNumber = parsed.data.diplomaNumber;
  if (parsed.data.skhuNumber?.trim()) updateValues.skhuNumber = parsed.data.skhuNumber;
  if (parsed.data.fatherName?.trim()) updateValues.fatherName = parsed.data.fatherName;
  if (parsed.data.fatherBirthPlace?.trim()) updateValues.fatherBirthPlace = parsed.data.fatherBirthPlace;
  if (parsed.data.fatherBirthDate?.trim()) {
    const date = new Date(parsed.data.fatherBirthDate);
    if (!Number.isNaN(date.getTime())) updateValues.fatherBirthDate = date;
  }
  if (parsed.data.fatherNik?.trim()) updateValues.fatherNik = parsed.data.fatherNik;
  if (parsed.data.fatherOccupation?.trim()) updateValues.fatherOccupation = parsed.data.fatherOccupation;
  if (parsed.data.motherName?.trim()) updateValues.motherName = parsed.data.motherName;
  if (parsed.data.motherBirthPlace?.trim()) updateValues.motherBirthPlace = parsed.data.motherBirthPlace;
  if (parsed.data.motherBirthDate?.trim()) {
    const date = new Date(parsed.data.motherBirthDate);
    if (!Number.isNaN(date.getTime())) updateValues.motherBirthDate = date;
  }
  if (parsed.data.motherNik?.trim()) updateValues.motherNik = parsed.data.motherNik;
  if (parsed.data.motherOccupation?.trim()) updateValues.motherOccupation = parsed.data.motherOccupation;
  if (parsed.data.parentsAddress?.trim()) updateValues.parentsAddress = parsed.data.parentsAddress;
  if (parsed.data.parentsPhone?.trim()) updateValues.parentsPhone = parsed.data.parentsPhone;
  if (parsed.data.majorId?.trim()) updateValues.majorId = parseInt(parsed.data.majorId, 10);
  if (parsed.data.uniformSize?.trim()) updateValues.uniformSize = parsed.data.uniformSize;

  updateValues.verificationStatus = "pending";

  await db
    .update(profiles)
    .set(updateValues)
    .where(and(eq(profiles.userId, session.userId), isNull(profiles.deletedAt)));

  revalidatePath("/dashboard");
  revalidatePath("/students/profile/complete");

  return { success: true };
}

export async function getAdminVerificationLists() {
  await verifyRoleLevel(60);

  const all = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      nisn: profiles.nisn,
      createdAt: profiles.createdAt,
      status: profiles.verificationStatus,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(
      and(
        isNull(profiles.deletedAt),
        isNull(users.deletedAt)
      )
    );

  return {
    pending: all.filter((s) => s.status === "pending"),
    verified: all.filter((s) => s.status === "verified"),
    rejected: all.filter((s) => s.status === "rejected"),
  };
}

export async function approveProfile(userId: string) {
  await verifyRoleLevel(80);
  await db
    .update(profiles)
    .set({ verificationStatus: "verified" })
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)));

  revalidatePath("/enrollments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function rejectProfile(userId: string, reason?: string) {
  await verifyRoleLevel(80);
  await db
    .update(profiles)
    .set({ verificationStatus: "rejected", rejectionReason: reason ?? null })
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)));

  revalidatePath("/enrollments");
  revalidatePath("/students/profile/complete");
  return { success: true };
}

export async function cancelVerification() {
  const session = await verifySession();

  const [profile] = await db
    .select({ id: profiles.id, verificationStatus: profiles.verificationStatus })
    .from(profiles)
    .where(and(eq(profiles.userId, session.userId), isNull(profiles.deletedAt)))
    .limit(1);

  if (!profile || profile.verificationStatus !== "pending") {
    return { error: "Pengajuan tidak dapat dibatalkan." };
  }

  await db
    .update(profiles)
    .set({ verificationStatus: "draft", rejectionReason: null })
    .where(eq(profiles.userId, session.userId));

  revalidatePath("/dashboard");
  revalidatePath("/students/pending");
  revalidatePath("/students/profile/complete");
  return { success: true };
}

export async function getPendingVerifications() {
  const session = await verifySession();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.userId))
    .where(
      and(
        eq(users.id, session.userId),
        eq(profiles.verificationStatus, "pending"),
        isNull(users.deletedAt),
        isNull(profiles.deletedAt)
      )
    )
    .limit(1);

  if (!user) return null;

  const result = await getMyProfile();
  return result.profile;
}

export async function resetStudentPassword(userId: string) {
  await verifyRoleLevel(80);

  const password =
    crypto.randomBytes(6).toString("hex") + "A1";
  const passwordHash = await hashPassword(password);

  try {
    await db
      .update(accounts)
      .set({ password: passwordHash })
      .where(and(eq(accounts.userId, userId), eq(accounts.providerId, "credential")));
  } catch {
    return { error: "Gagal mereset password." };
  }

  revalidatePath("/enrollments");
  return { password };
}
