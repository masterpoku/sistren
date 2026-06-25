import { type NextRequest, NextResponse } from "next/server";
import { getSchoolDocumentForDownload } from "@/actions/documents-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const result = await getSchoolDocumentForDownload(numericId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return new Response(new Uint8Array(result.file), {
    headers: {
      "Content-Type": result.fileType,
      "Content-Disposition": `inline; filename="${result.fileName}"`,
    },
  });
}
