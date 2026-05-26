'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ClassSheetData {
  name: string;
  code: string;
}

interface ClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClassSheetData) => Promise<void>;
  initialData?: { id: number; name: string; code: string };
}

export function ClassSheet({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ClassSheetProps) {
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState(initialData?.name || '');
  const [code, setCode] = React.useState(initialData?.code || '');

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name || '');
      setCode(initialData?.code || '');
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, code });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="pb-4">
            <SheetTitle>
              {initialData ? 'Edit Kelas' : 'Tambah Kelas'}
            </SheetTitle>
            <SheetDescription>
              {initialData
                ? 'Perbarui data kelas.'
                : 'Tambah kelas baru untuk tingkat pendidikan.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Nama Kelas</Label>
              <Input
                id="class-name"
                placeholder="Contoh: X, XI, XII"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-code">Kode</Label>
              <Input
                id="class-code"
                placeholder="Contoh: 10, 11, 12"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Tambah'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
