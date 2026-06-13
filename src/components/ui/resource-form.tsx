"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResourceFormProps {
  title?: string;
  action: (formData: FormData) => Promise<unknown> | undefined;
  onCancel?: () => void;
  cancelHref?: string;
  submitLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  className?: string;
  layout?: "row" | "grid";
  children: React.ReactNode;
  onResult?: (result: unknown) => void;
}

export function ResourceForm({
  title,
  action,
  onCancel,
  cancelHref,
  submitLabel = "Simpan",
  cancelLabel = "Batal",
  pendingLabel = "Menyimpan...",
  className,
  layout = "row",
  children,
  onResult,
}: ResourceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }
    if (cancelHref) {
      router.push(cancelHref);
      return;
    }
    router.back();
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (onResult) onResult(result);
    });
  }

  return (
    <Card className={className}>
      {title ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent>
        <form
          action={handleSubmit}
          className={cn(
            layout === "row"
              ? "flex flex-wrap items-end gap-4"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          )}
        >
          {children}
          <div
            className={cn(
              "flex items-center gap-2",
              layout === "row" ? "pb-0" : "col-span-full"
            )}
          >
            <Button type="submit" disabled={isPending}>
              {isPending ? pendingLabel : submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
