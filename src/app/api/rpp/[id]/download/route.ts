import { type NextRequest, NextResponse } from "next/server";
import { downloadRpp } from "@/actions/rpp";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const result = await downloadRpp(numericId);

  if ("error" in result) {
    const status = result.error?.includes("izin") ? 403 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  return new Response(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.fileType,
      "Content-Disposition": `attachment; filename="${result.fileName}"`,
    },
  });
}
