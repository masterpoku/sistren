import { NextResponse } from "next/server";
import { getPaymentSlipForDownload } from "@/actions/payments";

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slipId = Number(id);

  if (Number.isNaN(slipId)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const result = await getPaymentSlipForDownload(slipId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return new NextResponse(new Uint8Array(result.file), {
    headers: {
      "Content-Type": result.mimeType,
      "Content-Disposition": `inline; filename="${result.fileName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
