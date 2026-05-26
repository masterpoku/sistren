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

export interface MajorSheetData {
  name: string;
  description?: string;
}

interface MajorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MajorSheetData) => Promise<void>;
  initialData?: { id: number; name: string; description?: string | null };
}

export function MajorSheet({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: MajorSheetProps) {
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState(initialData?.name || '');
  const [description, setDescription] = React.useState(
    initialData?.description || ''
  );

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, description: description || undefined });
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
              {initialData ? 'Edit Jurusan' : 'Tambah Jurusan'}
            </SheetTitle>
            <SheetDescription>
              {initialData
                ? 'Perbarui data jurusan.'
                : 'Tambah jurusan atau program keahlian baru.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="major-name">Nama Jurusan</Label>
              <Input
                id="major-name"
                placeholder="Contoh: Teknik Komputer & Jaringan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major-desc">Deskripsi</Label>
              <Input
                id="major-desc"
                placeholder="Contoh: TKJ - Computer Networking"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
