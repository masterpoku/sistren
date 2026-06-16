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
}

const NAV_ITEMS: NavItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Kalender", href: "/calendar", keywords: ["calendar", "acara"] },
    { title: "Akademik", href: "/academic", keywords: ["akademik", "academic"] },
    { title: "Kelas", href: "/academic/classes", keywords: ["class", "kelas"] },
    { title: "Mapel", href: "/academic/subjects", keywords: ["subject", "mata pelajaran"] },
    { title: "Jurusan", href: "/academic/majors", keywords: ["major", "jurusan"] },
    { title: "Semester", href: "/academic/semesters" },
    { title: "Tugas Guru", href: "/academic/assignments", keywords: ["assignment", "tugas"] },
    { title: "Nilai", href: "/academic/grades", keywords: ["grade", "nilai"] },
    { title: "Keuangan", href: "/finance", keywords: ["finance", "uang"] },
    { title: "Katalog Bayar", href: "/payments/catalog", keywords: ["katalog", "payment"] },
    { title: "Metode Bayar", href: "/payments/methods" },
    { title: "Siswa", href: "/students", keywords: ["student", "siswa"] },
    { title: "Guru", href: "/teachers", keywords: ["teacher", "guru"] },
    { title: "Pengguna", href: "/users", keywords: ["user", "pengguna"] },
    { title: "Pengumuman", href: "/announcements", keywords: ["announcement"] },
    { title: "Approvals", href: "/admin/approvals" },
    { title: "Staff", href: "/admin/users" },
    { title: "Transkrip", href: "/alumni/transcript" },
    { title: "Roles", href: "/roles" },
    { title: "Permissions", href: "/permissions" },
    { title: "Pengaturan", href: "/settings/system", keywords: ["settings"] },
];

export function HeaderSearch() {
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
                        {NAV_ITEMS.map((item) => (
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
