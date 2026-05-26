'use server';

import { db } from '@/lib/db';
import { studentDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import { encryptBlob, decryptBlob } from '@/lib/crypto';

type DocumentType =
  | 'ijasah'
  | 'skhun'
  | 'skl'
  | 'aktaKelahiran'
  | 'kk'
  | 'ktpAyah'
  | 'ktpIbu'
  | 'kip'
  | 'passFoto'
  | 'rapor';

const DOCUMENT_TYPES: DocumentType[] = [
  'ijasah',
  'skhun',
  'skl',
  'aktaKelahiran',
  'kk',
  'ktpAyah',
  'ktpIbu',
  'kip',
  'passFoto',
  'rapor',
];

function isValidDocumentType(s: string): s is DocumentType {
  return DOCUMENT_TYPES.includes(s as DocumentType);
}

export async function getDocuments(studentId: string) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  // Permission: profile.edit_any (admin/guru) OR own profile
  if (
    !ctx ||
    (!ctx.permissions.has('profile.edit_any') && session.userId !== studentId)
  ) {
    return { error: 'Anda tidak memiliki izin untuk melihat dokumen ini.' };
  }

  const [doc] = await db
    .select()
    .from(studentDocuments)
    .where(eq(studentDocuments.studentId, studentId))
    .limit(1);

  if (!doc) {
    return { documents: [] };
  }

  // Return list of which columns have data
  const documents = DOCUMENT_TYPES.filter((type) => {
    const col = doc[type];
    return col !== null && col !== undefined;
  }).map((type) => ({
    type,
    hasData: true,
  }));

  return { documents };
}

export async function uploadDocument(formData: FormData) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  const file = formData.get('file') as File | null;
  const studentId = formData.get('studentId') as string;
  const documentType = formData.get('documentType') as string;

  if (!file || !studentId || !documentType) {
    return { error: 'File, studentId, dan documentType wajib diisi.' };
  }

  if (!isValidDocumentType(documentType)) {
    return { error: 'Jenis dokumen tidak valid.' };
  }

  // Permission: profile.edit_any OR own profile
  if (
    !ctx ||
    (!ctx.permissions.has('profile.edit_any') && session.userId !== studentId)
  ) {
    return { error: 'Anda tidak memiliki izin untuk mengunggah dokumen ini.' };
  }

  // File size check
  if (file.size > 16 * 1024 * 1024) {
    return { error: 'Ukuran file maksimal 16MB.' };
  }

  // Read and encrypt file
  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch {
    return { error: 'Gagal membaca file.' };
  }

  let encrypted: Buffer;
  try {
    encrypted = encryptBlob(buffer);
  } catch {
    return { error: 'Gagal mengenkripsi file. Coba lagi.' };
  }

  // Upsert: update if exists, insert if not
  const [existing] = await db
    .select({ studentId: studentDocuments.studentId })
    .from(studentDocuments)
    .where(eq(studentDocuments.studentId, studentId))
    .limit(1);

  if (existing) {
    // Update the specific column
    await db
      .update(studentDocuments)
      .set({ [documentType]: encrypted, updatedAt: new Date() })
      .where(eq(studentDocuments.studentId, studentId));
  } else {
    // Insert new row with only this document
    await db.insert(studentDocuments).values({
      studentId,
      [documentType]: encrypted,
    });
  }

  return { success: true };
}

export async function downloadDocument(
  studentId: string,
  documentType: string
) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (!isValidDocumentType(documentType)) {
    return { error: 'Jenis dokumen tidak valid.' };
  }

  // Permission: profile.edit_any OR own profile
  if (
    !ctx ||
    (!ctx.permissions.has('profile.edit_any') && session.userId !== studentId)
  ) {
    return { error: 'Anda tidak memiliki izin untuk mengunduh dokumen ini.' };
  }

  const [doc] = await db
    .select()
    .from(studentDocuments)
    .where(eq(studentDocuments.studentId, studentId))
    .limit(1);

  if (!doc) {
    return { error: 'Dokumen tidak ditemukan.' };
  }

  const blob = doc[documentType as DocumentType];
  if (!blob) {
    return { error: 'Dokumen tidak tersedia.' };
  }

  // Decrypt
  let decrypted: Buffer;
  try {
    decrypted = decryptBlob(Buffer.from(blob as unknown as Buffer));
  } catch {
    return { error: 'File korup atau tidak dapat dibaca.' };
  }

  // Determine MIME type from document type
  const mimeTypes: Record<DocumentType, string> = {
    ijasah: 'application/pdf',
    skhun: 'application/pdf',
    skl: 'application/pdf',
    aktaKelahiran: 'application/pdf',
    kk: 'application/pdf',
    ktpAyah: 'image/jpeg',
    ktpIbu: 'image/jpeg',
    kip: 'application/pdf',
    passFoto: 'image/jpeg',
    rapor: 'application/pdf',
  };

  const contentType =
    mimeTypes[documentType as DocumentType] || 'application/octet-stream';
  const filename = `${documentType}_${studentId}.pdf`;

  return new Response(decrypted as unknown as BodyInit, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}
