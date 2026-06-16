"use client";

import { Bell, Check } from "@phosphor-icons/react";
import { useEffect, useState, useTransition } from "react";
import {
    getUnreadCount,
    listNotifications,
    markAllRead,
    markRead,
    type NotificationItem,
} from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatRelative(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "baru saja";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j`;
    const days = Math.floor(hours / 24);
    return `${days}h`;
}

export function HeaderNotifications() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unread, setUnread] = useState(0);
    const [, startTransition] = useTransition();

    const refresh = () => {
        startTransition(async () => {
            const [list, count] = await Promise.all([
                listNotifications(20),
                getUnreadCount(),
            ]);
            if ("items" in list) {
                setItems(list.items);
                setUnread(list.unread);
            } else {
                setUnread(count);
            }
        });
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <Bell className="h-5 w-5" />
                    {unread > 0 ? (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
                    ) : null}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-3 py-2">
                    <span className="text-sm font-semibold">Notifikasi</span>
                    {unread > 0 ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                startTransition(async () => {
                                    await markAllRead();
                                    refresh();
                                });
                            }}
                            className="h-7 px-2 text-xs"
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Tandai semua
                        </Button>
                    ) : null}
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            Belum ada notifikasi.
                        </div>
                    ) : (
                        items.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => {
                                    if (n.readAt === null) {
                                        startTransition(async () => {
                                            await markRead(n.id);
                                            refresh();
                                        });
                                    }
                                }}
                                className={cn(
                                    "flex w-full flex-col gap-1 border-b px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                                    n.readAt === null && "bg-muted/30"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="font-medium leading-tight">
                                        {n.title}
                                    </span>
                                    <span className="shrink-0 text-[10px] text-muted-foreground">
                                        {formatRelative(n.createdAt)}
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {n.message}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
