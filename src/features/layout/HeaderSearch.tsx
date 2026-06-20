"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface NavItem {
    title: string;
    href: string;
    keywords?: string[];
    minLevel?: number;
}

// Nav items annotated with minimum role level from ROLE_LEVEL_REQUIREMENTS.
// Items with no minLevel are accessible to all authenticated users.
const NAV_ITEMS: NavItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Kalender", href: "/calendar", keywords: ["calendar", "acara"], minLevel: 40 },
    { title: "Akademik", href: "/academic", keywords: ["akademik", "academic"], minLevel: 60 },
    { title: "Kelas", href: "/academic/classes", keywords: ["class", "kelas"], minLevel: 60 },
    { title: "Mapel", href: "/academic/subjects", keywords: ["subject", "mata pelajaran"], minLevel: 60 },
    { title: "Jurusan", href: "/academic/majors", keywords: ["major", "jurusan"], minLevel: 60 },
    { title: "Semester", href: "/academic/semesters", minLevel: 60 },
    { title: "Tugas Guru", href: "/academic/assignments", keywords: ["assignment", "tugas"], minLevel: 60 },
    { title: "Nilai", href: "/academic/grades", keywords: ["grade", "nilai"], minLevel: 60 },
    { title: "Keuangan", href: "/finance", keywords: ["finance", "uang"] },
    { title: "Katalog Bayar", href: "/payments/catalog", keywords: ["katalog", "payment"], minLevel: 80 },
    { title: "Metode Bayar", href: "/payments/methods", minLevel: 80 },
    { title: "Siswa", href: "/students", keywords: ["student", "siswa"] },
    { title: "Guru", href: "/teachers", keywords: ["teacher", "guru"] },
    { title: "Pengguna", href: "/users", keywords: ["user", "pengguna"], minLevel: 80 },
    { title: "Pengumuman", href: "/announcements", keywords: ["announcement"] },
    { title: "Approvals", href: "/admin/approvals", minLevel: 80 },
    { title: "Staff", href: "/admin/users", minLevel: 80 },
    { title: "Transkrip", href: "/alumni/transcript" },
    { title: "Roles", href: "/roles" },
    { title: "Permissions", href: "/permissions", minLevel: 100 },
    { title: "Pengaturan", href: "/settings/system", keywords: ["settings"], minLevel: 100 },
];

interface HeaderSearchProps {
    roleLevel: number;
}

export function HeaderSearch({ roleLevel }: HeaderSearchProps) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const visibleItems = NAV_ITEMS.filter(
        (item) => (item.minLevel ?? 0) <= roleLevel
    );

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(true)}
                className="hidden md:inline-flex h-9 w-[260px] items-center justify-start gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted"
            >
                <MagnifyingGlass className="h-4 w-4" />
                <span>Cari menu...</span>
                <kbd className="ml-auto rounded border bg-background px-1.5 text-[10px] font-mono">
                    ⌘K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Ketik untuk mencari menu..." />
                <CommandList>
                    <CommandEmpty>Tidak ada menu yang cocok.</CommandEmpty>
                    <CommandGroup heading="Menu">
                        {visibleItems.map((item) => (
                            <CommandItem
                                key={item.href}
                                value={`${item.title} ${item.keywords?.join(" ") ?? ""}`}
                                onSelect={() => {
                                    setOpen(false);
                                    router.push(item.href);
                                }}
                            >
                                {item.title}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
