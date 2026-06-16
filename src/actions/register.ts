"use server";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validation/schemas/register";

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
    nisn: formData.get("nisn") ?? "",
    birthPlace: formData.get("birthPlace") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    gender: formData.get("gender") ?? "",
    religionId: formData.get("religionId") ?? "",
    address: formData.get("address") ?? "",
    fatherName: formData.get("fatherName") ?? "",
    motherName: formData.get("motherName") ?? "",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

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
    userId: "",
    type: "siswa",
  };

  if (parsed.data.birthDate && parsed.data.birthDate.trim() !== "") {
    const date = new Date(parsed.data.birthDate);
    if (!Number.isNaN(date.getTime())) {
      profileValues.birthDate = date;
    }
  }

  if (parsed.data.nisn?.trim()) profileValues.nisn = parsed.data.nisn;
  if (parsed.data.birthPlace?.trim())
    profileValues.birthPlace = parsed.data.birthPlace;
  if (parsed.data.gender)
    profileValues.gender = parsed.data.gender as "male" | "female";
  if (parsed.data.religionId?.trim()) {
    const religionIdNum = parseInt(parsed.data.religionId, 10);
    if (!Number.isNaN(religionIdNum)) profileValues.religionId = religionIdNum;
  }
  if (parsed.data.address?.trim()) profileValues.address = parsed.data.address;
  if (parsed.data.fatherName?.trim())
    profileValues.fatherName = parsed.data.fatherName;
  if (parsed.data.motherName?.trim())
    profileValues.motherName = parsed.data.motherName;

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
