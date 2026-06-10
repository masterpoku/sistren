import Link from "next/link";
import { LoginFormClient } from "@/features/auth/LoginFormClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AlumniLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-2xl font-bold">S</span>
          </div>
          <CardTitle className="text-2xl">Login Alumni</CardTitle>
          <CardDescription>Akses transkrip nilai海外 graduate</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginFormClient />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4">
              Login sebagai siswa/guru
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
