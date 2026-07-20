"use client";

import { useState } from "react";
import { reviewRpp } from "@/actions/rpp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/ui/page-shell";
import { Textarea } from "@/components/ui/textarea";
import type { RppDocument } from "@/features/rpp/RppTeacherClient";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

interface RppAdminClientProps {
  documents: RppDocument[];
}

function RejectDialog({
  doc,
  onResolved,
}: {
  doc: RppDocument;
  onResolved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const [handleReject, isPending] = useActionWithToast(
    async () =>
      reviewRpp({ id: doc.id, decision: "rejected", rejectionReason: reason }),
    { successMessage: "RPP ditolak." }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>
        Tolak
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak RPP</DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan untuk {doc.title}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="reason">Alasan</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Alasan penolakan..."
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !reason.trim()}
            onClick={async () => {
              await handleReject();
              setOpen(false);
              setReason("");
              onResolved?.();
            }}
          >
            {isPending ? "Menolak..." : "Tolak RPP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RppReviewRow({ doc }: { doc: RppDocument }) {
  const [handleApprove] = useActionWithToast(
    async () => reviewRpp({ id: doc.id, decision: "approved" }),
    { successMessage: "RPP disetujui." }
  );

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{doc.title}</h3>
          <Badge variant="outline">Menunggu</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Guru: {doc.teacherName ?? doc.teacherId}
        </p>
        <p className="text-sm text-muted-foreground">
          {doc.classCode ?? "-"} - {doc.subjectName ?? "-"}
        </p>
        {doc.description && (
          <p className="text-sm text-muted-foreground">{doc.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {doc.fileName} ({Math.round(doc.fileSize / 1024)} KB)
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="default" onClick={handleApprove}>
          Setujui
        </Button>
        <RejectDialog doc={doc} />
      </div>
    </div>
  );
}

export function RppAdminClient({ documents }: RppAdminClientProps) {
  return (
    <PageShell
      title="Validasi RPP"
      description="Review dan setujui RPP yang diajukan guru."
    >
      <Card>
        <CardHeader>
          <CardTitle>Antrian Review</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Tidak ada RPP yang menunggu review.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <RppReviewRow key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
