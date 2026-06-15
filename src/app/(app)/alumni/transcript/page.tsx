import { redirect } from "next/navigation";
import { getDocuments } from "@/actions/documents";
import { TranscriptClient } from "@/features/alumni/TranscriptClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";

export default async function AlumniTranscriptPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel !== 20) {
    redirect("/unauthorized");
  }

  let documents: Array<{ type: string }> = [];
  try {
    const docResult = await getDocuments(session.userId);
    if ("documents" in docResult && Array.isArray(docResult.documents)) {
      documents = docResult.documents;
    }
  } catch {
    documents = [];
  }

  return <TranscriptClient documents={documents} userId={session.userId} />;
}
