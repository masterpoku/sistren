import { type NextRequest, NextResponse } from "next/server";
import { downloadDocument } from "@/actions/documents";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  const { id: studentId, type: documentType } = await params;

  const result = await downloadDocument(studentId, documentType);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // result is a Response object
  return result;
}
