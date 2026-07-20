"use client";

import {
  CheckCircle,
  Clipboard,
  Eye,
  EyeSlash,
  GraduationCap,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
import { checkNisn, registerAction } from "@/actions/register";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nisnStatus, setNisnStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [registered, setRegistered] = useState<{
    nisn: string;
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleNisnChange(value: string) {
    if (!value || value.length < 4) {
      setNisnStatus("idle");
      return;
    }
    setNisnStatus("checking");
    const result = await checkNisn(value);
    setNisnStatus(result.exists ? "taken" : "available");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await registerAction(formData);
      if (!result) return;
      if ("error" in result) {
        setError(result.error ?? null);
      } else {
        setRegistered({
          nisn: result.nisn,
          name: result.name,
          email: result.email,
          password: result.password,
        });
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function copyData() {
    if (!registered) return;
    const text = `NISN: ${registered.nisn}\nNama: ${registered.name}\nEmail: ${registered.email}\nPassword: ${registered.password}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Pendaftaran Berhasil
            </h1>
            <p className="text-slate-500">
              Simpan data berikut untuk login
            </p>
          </div>

          <Card className="border-none shadow-xl">
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    NISN
                  </p>
                  <p className="text-lg font-bold">{registered.nisn}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama
                  </p>
                  <p className="text-lg font-bold">{registered.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-lg font-bold">{registered.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Password
                  </p>
                  <p className="text-lg font-bold font-mono tracking-wider">
                    {registered.password}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={copyData}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                {copied ? "Tersalin!" : "Salin Data"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Silahkan login untuk melengkapi data diri
              </p>
            </CardContent>
            <CardFooter>
              <a href="/login" className="w-full">
                <Button className="w-full h-11">Login</Button>
              </a>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            PPDB
          </h1>
          <p className="text-slate-500">Penerimaan Siswa Baru - SMK TERPADU</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Formulir Pendaftaran</CardTitle>
            <CardDescription>
              Isi data dengan lengkap untuk mendaftar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <Warning className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <div className="relative">
                  <Input
                    id="nisn"
                    name="nisn"
                    placeholder="1234567890"
                    required
                    onChange={(e) => handleNisnChange(e.target.value)}
                    className={
                      nisnStatus === "taken"
                        ? "border-destructive pr-10"
                        : nisnStatus === "available"
                          ? "border-emerald-500 pr-10"
                          : ""
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nisnStatus === "checking" && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    )}
                    {nisnStatus === "available" && (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    )}
                    {nisnStatus === "taken" && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </span>
                </div>
                {nisnStatus === "taken" && (
                  <p className="text-xs text-destructive">
                    NISN sudah terdaftar
                  </p>
                )}
                {nisnStatus === "available" && (
                  <p className="text-xs text-emerald-500">NISN tersedia</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nama lengkap sesuai KK"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@ortu.id"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeSlash className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? (
                      <EyeSlash className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={
                  loading || nisnStatus === "taken" || nisnStatus === "checking"
                }
              >
                {loading ? "Memuat..." : "Daftar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Login di sini
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
