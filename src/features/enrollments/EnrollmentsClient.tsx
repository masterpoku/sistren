"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/page-shell";
import { ReviewStudentDialog } from "@/features/enrollments/ReviewStudentDialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";
import { useToast } from "@/hooks/use-toast";

type StudentItem = {
  id: string;
  name: string;
  email: string;
  nisn: string | null;
  createdAt: Date | null;
};

type Tab = "pending" | "verified" | "rejected";

const TAB_LABELS: Record<Tab, string> = {
  pending: "Menunggu",
  verified: "Disetujui",
  rejected: "Ditolak",
};

const TAB_COLORS: Record<Tab, string> = {
  pending: "",
  verified: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  rejected: "bg-red-100 text-red-700 hover:bg-red-200",
};

export function EnrollmentsClient({
  pending,
  verified,
  rejected,
}: {
  pending: StudentItem[];
  verified: StudentItem[];
  rejected: StudentItem[];
}) {
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");

  const list = { pending, verified, rejected }[tab];

  const filtered = list.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.nisn && s.nisn.includes(search)) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell
      title="Verifikasi Data Siswa"
      description="Review dan setujui data siswa baru yang mendaftar melalui PPDB."
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Siswa</CardTitle>
            <div className="flex gap-1">
              {(["pending", "verified", "rejected"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : TAB_COLORS[t] || "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {TAB_LABELS[t]} ({({ pending, verified, rejected }[t]).length})
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Cari nama, NISN, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 max-w-sm"
          />
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {search
                ? "Tidak ada hasil yang cocok."
                : "Tidak ada siswa."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Nama</th>
                    <th className="pb-2 font-medium">NISN</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Tanggal Daftar</th>
                    <th className="pb-2 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{s.nisn ?? "-"}</td>
                      <td className="py-2">{s.email}</td>
                      <td className="py-2">{formatDate(s.createdAt)}</td>
                      <td className="py-2">
                        {tab === "pending" ? (
                          <VerificationActions id={s.id} email={s.email} name={s.name} />
                        ) : (
                          <div className="flex items-center gap-2">
                            <ReviewStudentDialog studentId={s.id} />
                            <ResetPasswordAction id={s.id} email={s.email} name={s.name} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function ResetPasswordAction({ id, email, name }: { id: string; email: string; name: string }) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  async function handleResetPassword() {
    const { resetStudentPassword } = await import("@/actions/verification");
    const result = await resetStudentPassword(id);
    if (result && typeof result === "object" && "error" in result) {
      toast({
        variant: "destructive",
        description: (result as { error: string }).error,
      });
    } else {
      setPassword((result as { password: string }).password);
    }
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={handleResetPassword}>
        Reset Password
      </Button>
      <Dialog open={!!password} onOpenChange={(o) => !o && setPassword("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Baru</DialogTitle>
            <DialogDescription>
              Password untuk <strong>{name}</strong> ({email}) telah direset.
              Salin password berikut:
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded bg-muted p-3 font-mono text-sm">
            {password}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(password);
              toast({ description: "Password disalin." });
              setPassword("");
            }}
          >
            Salin Password
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function VerificationActions({ id, email, name }: { id: string; email: string; name: string }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectBusy, setRejectBusy] = useState(false);
  const { toast } = useToast();
  const [handleApprove] = useActionWithToast(
    async () => {
      const { approveProfile } = await import("@/actions/verification");
      return await approveProfile(id);
    },
    { successMessage: "Data siswa disetujui." }
  );

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast({ variant: "destructive", description: "Alasan penolakan wajib diisi." });
      return;
    }
    setRejectBusy(true);
    const { rejectProfile } = await import("@/actions/verification");
    const result = await rejectProfile(id, rejectReason.trim());
    setRejectBusy(false);
    if ("error" in result) {
      toast({ variant: "destructive", description: (result as { error: string }).error });
      return;
    }
    toast({ description: "Data siswa ditolak." });
    setRejectOpen(false);
    setRejectReason("");
  }

  return (
    <div className="flex items-center gap-2">
      <ReviewStudentDialog studentId={id} />
      <Button type="button" size="sm" onClick={handleApprove}>
        Setujui
      </Button>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="destructive">
            Tolak
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Data Siswa</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk <strong>{name}</strong> ({email}).
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Contoh: Foto tidak sesuai, NISN tidak valid, data orang tua tidak lengkap..."
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || rejectBusy}>
              {rejectBusy ? "Memproses..." : "Tolak"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ResetPasswordAction id={id} email={email} name={name} />
    </div>
  );
}
