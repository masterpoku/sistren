import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, ArrowLeft, Send, CheckCircle2, School } from "lucide-react";
import { motion } from "motion/react";

interface RegisterProps {
  onGoToLogin: () => void;
}

export default function Register({ onGoToLogin }: RegisterProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl text-center">
            <CardHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl">Pendaftaran Berhasil!</CardTitle>
              <CardDescription className="text-base">
                Terima kasih telah mendaftar di SMK TERPADU. Data Anda sedang kami proses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4 text-left space-y-2">
                <p className="text-sm font-medium">Langkah Selanjutnya:</p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
                  <li>Cek email konfirmasi pendaftaran</li>
                  <li>Siapkan dokumen fisik untuk verifikasi</li>
                  <li>Pantau status pendaftaran di portal PPDB</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-11" onClick={onGoToLogin}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <School className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">SISTREN</h1>
          <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">PPDB SMK TERPADU 2026/2027</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Formulir Pendaftaran</CardTitle>
              <Button variant="ghost" size="sm" onClick={onGoToLogin}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
            <CardDescription>
              Lengkapi data berikut untuk mendaftar sebagai siswa baru
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2 text-primary">Data Pribadi</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input id="fullName" placeholder="Budi Santoso" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nisn">NISN</Label>
                    <Input id="nisn" placeholder="0012345678" required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">Tempat Lahir</Label>
                    <Input id="birthPlace" placeholder="Jakarta" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Tanggal Lahir</Label>
                    <Input id="birthDate" type="date" required />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold border-b pb-2 text-primary">Pilihan Kompetensi</h3>
                <div className="space-y-2">
                  <Label htmlFor="major">Kompetensi Keahlian</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kompetensi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tkj">Teknik Komputer & Jaringan</SelectItem>
                      <SelectItem value="rpl">Rekayasa Perangkat Lunak</SelectItem>
                      <SelectItem value="mm">Multimedia</SelectItem>
                      <SelectItem value="ak">Akuntansi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold border-b pb-2 text-primary">Kontak</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="nama@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input id="phone" placeholder="081234567890" required />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-11">
                <Send className="mr-2 h-4 w-4" />
                Kirim Pendaftaran
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Sudah mendaftar? <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onGoToLogin}>Cek status pendaftaran</Button>
        </p>
      </motion.div>
    </div>
  );
}
