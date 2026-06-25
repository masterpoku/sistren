"use client";

import { useState } from "react";
import { archiveRpp, submitRpp, uploadRpp } from "@/actions/rpp";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/ui/page-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Menunggu Review", variant: "outline" },
  approved: { label: "Disetujui", variant: "default" },
  rejected: { label: "Ditolak", variant: "destructive" },
  archived: { label: "Diarsipkan", variant: "outline" },
};

export interface RppDocument {
  id: number;
  teacherId: string;
  teacherName: string | null;
  classId: number;
  className: string | null;
  subjectId: number;
  subjectName: string | null;
  title: string;
  description: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date | null;
}

interface RppTeacherClientProps {
  documents: RppDocument[];
  classes: { id: number; name: string }[];
}

function UploadDialog({
  classes,
  onUploaded,
}: {
  classes: { id: number; name: string }[];
  onUploaded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [handleUpload, isPending] = useActionWithToast(
    async () => {
      if (!file) return { error: "Pilih file terlebih dahulu." };
      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      formData.append("classId", classId);
      formData.append("subjectId", subjectId);
      formData.append("file", file);
      return await uploadRpp(formData);
    },
    {
      successMessage: "RPP berhasil diupload.",
      errorMessage: "Gagal mengupload RPP.",
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Upload RPP</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload RPP</DialogTitle>
          <DialogDescription>
            Upload Rencana Pelaksanaan Pembelajaran untuk review admin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="rpp-title">Judul</Label>
            <Input
              id="rpp-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="RPP Matematika Kelas X Semester 1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rpp-class">Kelas</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="rpp-class">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rpp-subject">Mata Pelajaran</Label>
            <Input
              id="rpp-subject"
              type="number"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="ID Mata Pelajaran"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rpp-description">Deskripsi</Label>
            <Textarea
              id="rpp-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rpp-file">File (PDF/DOCX/JPG/PNG, maks 50MB)</Label>
            <Input
              id="rpp-file"
              type="file"
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
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
            disabled={isPending || !title || !classId || !subjectId || !file}
            onClick={async () => {
              await handleUpload();
              setOpen(false);
              setTitle("");
              setDescription("");
              setClassId("");
              setSubjectId("");
              setFile(null);
              onUploaded?.();
            }}
          >
            {isPending ? "Mengupload..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] ?? {
    label: status,
    variant: "outline" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function RppTeacherClient({
  documents,
  classes,
}: RppTeacherClientProps) {
  return (
    <PageShell
      title="RPP Saya"
      description="Upload dan kelola Rencana Pelaksanaan Pembelajaran Anda."
      actions={<UploadDialog classes={classes} />}
    >
      <Card>
        <CardHeader>
          <CardTitle>Daftar RPP</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada RPP. Upload RPP pertama Anda.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <RppRow key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function RppRow({ doc }: { doc: RppDocument }) {
  const [handleSubmit] = useActionWithToast(
    async () => submitRpp({ id: doc.id }),
    { successMessage: "RPP disubmit untuk review." }
  );
  const [handleArchive] = useActionWithToast(
    async () => archiveRpp({ id: doc.id }),
    { successMessage: "RPP diarsipkan." }
  );

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{doc.title}</h3>
          <StatusBadge status={doc.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {doc.className ?? "-"} - {doc.subjectName ?? "-"}
        </p>
        {doc.description && (
          <p className="text-sm text-muted-foreground">{doc.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {doc.fileName} ({Math.round(doc.fileSize / 1024)} KB)
        </p>
        {doc.status === "rejected" && doc.rejectionReason && (
          <p className="text-sm text-destructive">
            Ditolak: {doc.rejectionReason}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {doc.status === "draft" && (
          <Button size="sm" variant="outline" onClick={handleSubmit}>
            Submit
          </Button>
        )}
        {doc.status !== "archived" && (
          <Button size="sm" variant="ghost" onClick={handleArchive}>
            Arsipkan
          </Button>
        )}
      </div>
    </div>
  );
}
