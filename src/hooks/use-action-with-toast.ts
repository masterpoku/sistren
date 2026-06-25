"use client";

import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

type ActionResult = { error?: string } | { success: boolean } | unknown;

interface UseActionWithToastOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useActionWithToast(
  action: () => Promise<ActionResult>,
  options: UseActionWithToastOptions = {}
) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleAction() {
    startTransition(async () => {
      const result = await action();
      if (result && typeof result === "object" && "error" in result) {
        toast({
          variant: "destructive",
          description:
            (result as { error: string }).error ??
            options.errorMessage ??
            "Terjadi kesalahan.",
        });
        return;
      }
      toast({
        description: options.successMessage ?? "Berhasil.",
      });
    });
  }

  return [handleAction, isPending] as const;
}
