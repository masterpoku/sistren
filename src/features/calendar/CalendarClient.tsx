"use client";

import type { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { createEvent, deleteEvent, updateEvent } from "@/actions/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean | null;
  category: string | null;
  isPublic: boolean | null;
}

interface Props {
  initialEvents: CalendarEvent[];
  canManage: boolean;
}

export function CalendarClient({ initialEvents, canManage }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const mappedEvents = initialEvents.map((e) => ({
    id: String(e.id),
    title: e.title,
    start: e.startAt,
    end: e.endAt ?? undefined,
    allDay: e.allDay ?? false,
    extendedProps: {
      category: e.category,
      description: e.description,
      isPublic: e.isPublic,
    },
  }));

  const handleDateClick = useCallback(
    (info: { dateStr: string }) => {
      if (!canManage) return;
      setSelectedDate(info.dateStr);
      setEditingEvent(null);
      setMode("create");
      setDialogOpen(true);
    },
    [canManage]
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      if (!canManage) return;
      const ext = arg.event.extendedProps as {
        description: string | null;
        category: string | null;
        isPublic: boolean | null;
      };
      setEditingEvent({
        id: parseInt(arg.event.id, 10),
        title: arg.event.title,
        description: ext.description ?? null,
        startAt: arg.event.start ?? new Date(),
        endAt: arg.event.end ?? null,
        allDay: arg.event.allDay,
        category: ext.category ?? "event",
        isPublic: ext.isPublic ?? true,
      });
      setMode("edit");
      setDialogOpen(true);
    },
    [canManage]
  );

  const handleSubmit = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        let result: { success?: boolean; error?: string };

        if (mode === "create") {
          result = await createEvent(formData);
        } else if (editingEvent) {
          result = await updateEvent(editingEvent.id, formData);
        } else {
          return;
        }

        if (result.success) {
          setDialogOpen(false);
          router.refresh();
        }
      });
    },
    [mode, editingEvent, router]
  );

  const handleDelete = useCallback(() => {
    if (!editingEvent) return;
    startTransition(async () => {
      const result = await deleteEvent(editingEvent.id);
      if (result.success) {
        setDialogOpen(false);
        router.refresh();
      }
    });
  }, [editingEvent, router]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kalender Sekolah</h1>
        <p className="text-muted-foreground">
          Jadwal akademik, hari libur, dan acara sekolah.
        </p>
      </div>

      <div className="bg-card rounded-lg p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={mappedEvents}
          editable={canManage}
          selectable={canManage}
          dateClick={canManage ? handleDateClick : undefined}
          eventClick={canManage ? handleEventClick : undefined}
          height="auto"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Tambah Acara" : "Edit Acara"}
            </DialogTitle>
          </DialogHeader>

          <EventForm
            event={editingEvent}
            selectedDate={selectedDate}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            onDelete={canManage && mode === "edit" ? handleDelete : undefined}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EventFormProps {
  event: CalendarEvent | null;
  selectedDate: string;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isPending: boolean;
}

function EventForm({
  event,
  selectedDate,
  onSubmit,
  onCancel,
  onDelete,
  isPending,
}: EventFormProps) {
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) {
      if (!selectedDate) return "";
      return `${selectedDate}T00:00`;
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          name="title"
          defaultValue={event?.title ?? ""}
          placeholder="Nama acara"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          name="description"
          defaultValue={event?.description ?? ""}
          placeholder="Detail acara (opsional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startAt">Mulai</Label>
          <Input
            id="startAt"
            name="startAt"
            type="datetime-local"
            defaultValue={formatDateForInput(event?.startAt ?? null)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endAt">Selesai</Label>
          <Input
            id="endAt"
            name="endAt"
            type="datetime-local"
            defaultValue={formatDateForInput(event?.endAt)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select name="category" defaultValue={event?.category ?? "event"}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="academic">Akademik</SelectItem>
            <SelectItem value="holiday">Hari Libur</SelectItem>
            <SelectItem value="event">Acara</SelectItem>
            <SelectItem value="meeting">Rapat</SelectItem>
            <SelectItem value="exam">Ujian</SelectItem>
            <SelectItem value="other">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="allDay"
            name="allDay"
            defaultChecked={event?.allDay ?? false}
            onCheckedChange={(checked) => {
              const input = document.getElementById(
                "allDay"
              ) as HTMLInputElement;
              if (input) input.value = String(checked);
            }}
          />
          <Label htmlFor="allDay">Seharian</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="isPublic"
            name="isPublic"
            defaultChecked={event?.isPublic ?? true}
            onCheckedChange={(checked) => {
              const input = document.getElementById(
                "isPublic"
              ) as HTMLInputElement;
              if (input) input.value = String(checked);
            }}
          />
          <Label htmlFor="isPublic">Publik — siswa dapat melihat</Label>
        </div>
      </div>

      <div className="flex justify-between gap-4 pt-4">
        <div>
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isPending}
            >
              <Trash className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            <PencilSimple className="h-4 w-4 mr-2" />
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}
