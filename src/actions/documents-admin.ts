"use server";

import { and, desc, eq, isNull, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { decryptBlob, encryptBlob } from "@/lib/crypto";
import { db } from "@/lib/db";
import { schoolDocuments, users } from "@/lib/db/schema";
import { uploadSchoolDocumentSchema } from "@/lib/validation/schemas/schoolDocuments";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function getSchoolDocuments(options?: {
    category?: string;
    search?: string;
}) {
    const session = await verifySession();
    const ctx = await getAuthContext(session.userId);
    if (!ctx || ctx.roleLevel < 80) {
        return { error: "Anda tidak memiliki izin." };
    }

    const conditions = [isNull(schoolDocuments.deletedAt)];
    if (options?.category) {
        conditions.push(eq(schoolDocuments.category, options.category));
    }
    if (options?.search) {
        conditions.push(like(schoolDocuments.title, `%${options.search}%`));
    }

    const rows = await db
        .select({
            id: schoolDocuments.id,
            title: schoolDocuments.title,
            description: schoolDocuments.description,
            fileName: schoolDocuments.fileName,
            fileType: schoolDocuments.fileType,
            fileSize: schoolDocuments.fileSize,
            category: schoolDocuments.category,
            isPublic: schoolDocuments.isPublic,
            uploadedBy: schoolDocuments.uploadedBy,
            uploaderName: users.name,
            createdAt: schoolDocuments.createdAt,
        })
        .from(schoolDocuments)
        .leftJoin(users, eq(schoolDocuments.uploadedBy, users.id))
        .where(and(...conditions))
        .orderBy(desc(schoolDocuments.createdAt));

    return { documents: rows };
}

export async function uploadSchoolDocument(formData: FormData) {
    const session = await verifySession();
    const ctx = await getAuthContext(session.userId);
    if (!ctx || ctx.roleLevel < 80) {
        return { error: "Anda tidak memiliki izin." };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        return { error: "File wajib diisi." };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { error: "Ukuran file maksimal 10MB." };
    }

    const parsed = uploadSchoolDocumentSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        category: formData.get("category") || undefined,
        isPublic: formData.get("isPublic") === "true",
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

    await db.insert(schoolDocuments).values({
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        encryptedData: encrypted.toString("base64"),
        category: parsed.data.category ?? null,
        isPublic: parsed.data.isPublic,
        uploadedBy: session.userId,
    });

    revalidatePath("/documents");
    return { success: true };
}

export async function deleteSchoolDocument(id: number) {
    const session = await verifySession();
    const ctx = await getAuthContext(session.userId);
    if (!ctx || ctx.roleLevel < 80) {
        return { error: "Anda tidak memiliki izin." };
    }

    const [doc] = await db
        .select({ id: schoolDocuments.id })
        .from(schoolDocuments)
        .where(and(eq(schoolDocuments.id, id), isNull(schoolDocuments.deletedAt)))
        .limit(1);

    if (!doc) {
        return { error: "Dokumen tidak ditemukan." };
    }

    await db
        .update(schoolDocuments)
        .set({ deletedAt: new Date() })
        .where(eq(schoolDocuments.id, id));

    revalidatePath("/documents");
    return { success: true };
}

export async function getSchoolDocumentForDownload(id: number) {
    const session = await verifySession();
    const ctx = await getAuthContext(session.userId);

    const [doc] = await db
        .select()
        .from(schoolDocuments)
        .where(and(eq(schoolDocuments.id, id), isNull(schoolDocuments.deletedAt)))
        .limit(1);

    if (!doc) {
        return { error: "Dokumen tidak ditemukan." };
    }

    const canDownload =
        doc.isPublic || doc.uploadedBy === session.userId || (ctx?.roleLevel ?? 0) >= 80;
    if (!canDownload) {
        return { error: "Anda tidak memiliki izin untuk mengunduh dokumen ini." };
    }

    let decrypted: Buffer;
    try {
        decrypted = decryptBlob(Buffer.from(doc.encryptedData, "base64"));
    } catch {
        return { error: "File korup atau tidak dapat dibaca." };
    }

    return {
        file: decrypted,
        fileName: doc.fileName,
        fileType: doc.fileType,
    };
}
