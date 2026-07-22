"use client";

import {
  Eye,
  EyeSlash,
  GraduationCap,
  ShieldCheck,
  Student,
  UserCircle,
  Warning,
} from "@phosphor-icons/react";
import { createAuthClient } from "better-auth/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loginAction } from "@/actions/auth";
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
import { useToast } from "@/hooks/use-toast";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

const QUICK_LOGIN_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

const QUICK_LOGIN_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

type QuickAccount = {
  label: string;
  email: string;
  icon: "shield" | "student" | "user";
};

const QUICK_ACCOUNTS: QuickAccount[] = [
  {
    label: "Superadmin",
    email:
      process.env.NEXT_PUBLIC_DEMO_SUPERADMIN_EMAIL ?? "superadmin@sister.com",
    icon: "shield",
  },
  {
    label: "Admin",
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@sister.com",
    icon: "shield",
  },
  {
    label: "Guru",
    email: process.env.NEXT_PUBLIC_DEMO_GURU_EMAIL ?? "guru@sister.com",
    icon: "shield",
  },
  {
    label: "Siswa",
    email: process.env.NEXT_PUBLIC_DEMO_SISWA_EMAIL ?? "siswa@sister.com",
    icon: "student",
  },
  {
    label: "Alumni",
    email: process.env.NEXT_PUBLIC_DEMO_ALUMNI_EMAIL ?? "alumni@sister.com",
    icon: "user",
  },
];

function QuickIcon({ icon }: { icon: QuickAccount["icon"] }) {
  if (icon === "shield") return <ShieldCheck className="mr-1 h-3 w-3" />;
  if (icon === "student") return <Student className="mr-1 h-3 w-3" />;
  return <UserCircle className="mr-1 h-3 w-3" />;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [registeredMsg] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.has("registered")
        ? "Pendaftaran berhasil! Silakan login."
        : null;
    }
    return null;
  });

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginAction(formData);
      if (result && "error" in result) {
        setError(result.error);
        toast({ variant: "destructive", description: result.error });
      }
    } catch (_err) {
      const msg = "Terjadi kesalahan. Silakan coba lagi.";
      setError(msg);
      toast({ variant: "destructive", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", QUICK_LOGIN_PASSWORD);
    setLoading(true);
    loginAction(formData)
      .then((result) => {
        if (result && "error" in result) {
          setError(result.error);
          toast({ variant: "destructive", description: result.error });
          setLoading(false);
        }
      })
      .catch(() => {
        const msg = "Terjadi kesalahan.";
        setError(msg);
        toast({ variant: "destructive", description: msg });
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div
        className="w-full max-w-md space-y-8"
        style={{ animation: "fadeUp 500ms ease" }}
      >
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            SISTREN
          </h1>
          <p className="text-slate-500">
            Sistem Informasi Pesantren - SMK PESANTREN TERPADU
          </p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Masuk</CardTitle>
            <CardDescription>
              Masukkan email Anda untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CardContent className="space-y-4">
              {registeredMsg && (
                <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
                  {registeredMsg}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <Warning className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {!error && forgotMsg && (
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  {forgotMsg}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@sistren.sch.id"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    onClick={() =>
                      setForgotMsg(
                        "Hubungi administrator untuk reset password."
                      )
                    }
                  >
                    Lupa password?
                  </button>
                </div>
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
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Memuat..." : "Masuk"}
              </Button>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Atau
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full h-11"
                type="button"
                onClick={() => router.push("/register")}
              >
                PPDB - Pendaftaran Siswa Baru
              </Button>
            </CardFooter>
          </form>
        </Card>

        {QUICK_LOGIN_ENABLED && QUICK_LOGIN_PASSWORD && (
          <div className="space-y-3">
            <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
              Quick Login (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACCOUNTS.map((acc) => (
                <Button
                  key={acc.email}
                  variant="secondary"
                  size="sm"
                  className={`text-[10px] h-8 ${acc.label === "Alumni" ? "col-span-2" : ""}`}
                  onClick={() => quickLogin(acc.email)}
                >
                  <QuickIcon icon={acc.icon} />
                  {acc.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
