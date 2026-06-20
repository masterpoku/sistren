"use client";

import { GraduationCap } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderSearch } from "./HeaderSearch";

interface AppHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    roleLevel: number;
    studentId?: string;
    employeeId?: string;
    image?: string;
  };
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || segments[0] === "dashboard") return "Dashboard";
  const last = segments[segments.length - 1];
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const displayId = user.studentId || user.employeeId || user.email;

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4 min-w-0">
        <SidebarTrigger className="h-9 w-9 shrink-0" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 transition-colors hover:text-foreground/80 shrink-0"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="font-semibold shrink-0">SISTREN</span>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="capitalize truncate">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <HeaderSearch roleLevel={user.roleLevel} />
        <HeaderNotifications />

        <Separator orientation="vertical" className="h-8 mx-1" />

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end md:flex">
            <span className="text-xs font-semibold leading-none">
              {user.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {displayId}
            </span>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/10">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : (
              <AvatarFallback>
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
    </header>
  );
}
