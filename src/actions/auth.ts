"use server";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validation/schemas/auth";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { email, password } = parsed.data;

  const [user] = await db
    .select({ id: users.id, roleId: users.roleId })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return { error: "Email atau password salah." };
  }

  if (!user.roleId) {
    return {
      error:
        "Akun Anda belum diverifikasi. Silakan hubungi admin untuk verifikasi.",
    };
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    if ("error" in result && result.error) {
      return { error: "Email atau password salah." };
    }

    redirect("/dashboard");
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
