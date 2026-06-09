"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Basic validation
  if (!name || !email || !password || !confirmPassword) {
    return { error: "Semua field wajib diisi." };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  if (password !== confirmPassword) {
    return { error: "Password dan konfirmasi password tidak cocok." };
  }

  // Check if email already exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  // Gender validation — reject malformed values
  const gender = formData.get("gender") as string;
  if (gender && !["male", "female"].includes(gender)) {
    return { error: "Jenis kelamin tidak valid." };
  }

  // Prepare profile values — only non-empty fields
  const profileValues: {
    userId: string;
    type: "siswa";
    nisn?: string;
    birthPlace?: string;
    birthDate?: Date;
    gender?: "male" | "female";
    religionId?: number;
    address?: string;
    fatherName?: string;
    motherName?: string;
  } = {
    userId: "", // placeholder, set in transaction
    type: "siswa",
  };

  // birthDate — check for empty/invalid before inserting
  const birthDateRaw = formData.get("birthDate") as string;
  if (birthDateRaw && birthDateRaw.trim() !== "") {
    const date = new Date(birthDateRaw);
    if (!Number.isNaN(date.getTime())) {
      profileValues.birthDate = date;
    }
  }

  // Optional fields — only add if non-empty
  const nisn = formData.get("nisn") as string;
  if (nisn?.trim()) profileValues.nisn = nisn;

  const birthPlace = formData.get("birthPlace") as string;
  if (birthPlace?.trim()) profileValues.birthPlace = birthPlace;

  if (gender) profileValues.gender = gender as "male" | "female";

  const religionId = formData.get("religionId") as string;
  if (religionId?.trim()) {
    const parsed = parseInt(religionId, 10);
    if (!Number.isNaN(parsed)) profileValues.religionId = parsed;
  }

  const address = formData.get("address") as string;
  if (address?.trim()) profileValues.address = address;

  const fatherName = formData.get("fatherName") as string;
  if (fatherName?.trim()) profileValues.fatherName = fatherName;

  const motherName = formData.get("motherName") as string;
  if (motherName?.trim()) profileValues.motherName = motherName;

  // Transaction: create user + profile atomically
  try {
    let userId = "";
    await db.transaction(async (tx) => {
      const userResult = await auth.api.signUpEmail({
        body: { email, password, name },
        headers: await headers(),
      });

      userId = (
        "id" in userResult ? userResult.id : userResult.user.id
      ) as string;

      await tx.insert(profiles).values({
        userId,
        type: "siswa",
        nisn: profileValues.nisn,
        birthPlace: profileValues.birthPlace,
        birthDate: profileValues.birthDate,
        gender: profileValues.gender,
        religionId: profileValues.religionId,
        address: profileValues.address,
        fatherName: profileValues.fatherName,
        motherName: profileValues.motherName,
      });
    });

    redirect("/login");
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
