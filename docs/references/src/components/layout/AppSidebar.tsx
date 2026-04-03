import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { User } from "@/src/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LogOut, 
  Settings, 
  ChevronUp, 
  User as UserIcon, 
  Shield, 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CreditCard, 
  BookOpen, 
  School, 
  BookMarked, 
  FileText, 
  Calendar, 
  ClipboardCheck, 
  GraduationCap,
  History,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

export function AppSidebar({ currentTab, setTab, user, onLogout }: AppSidebarProps) {
  const isAlumni = user.role === "alumni";
  const isSuperAdmin = user.role === "superadmin";
  const isAdmin = user.role === "administrator";
  const isGuru = user.role === "guru";
  const isSiswa = user.role === "siswa";

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "border-r border-sidebar-border transition-colors duration-300",
        isAlumni && "alumni-sidebar"
      )}
    >
      <SidebarHeader className="p-2 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 px-2">
          <div className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
            isAlumni ? "bg-yellow-600 text-white" : "bg-sidebar-primary text-sidebar-primary-foreground"
          )}>
            {isSuperAdmin || isAdmin ? (
              <Shield className="h-5 w-5" />
            ) : (
              <span className="text-lg font-bold">S</span>
            )}
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-none">SISTREN</span>
            <span className={cn(
              "text-[10px]",
              isAlumni ? "text-yellow-900/70" : "text-sidebar-foreground/70"
            )}>SMK TERPADU</span>
          </div>
        </div>
        {isAlumni && (
          <div className="mt-2 px-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5 rounded-md bg-yellow-500/30 px-2 py-1 text-[10px] font-bold text-yellow-900 border border-yellow-600/20">
              <GraduationCap className="h-3 w-3" />
              PORTAL ALUMNI
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "font-semibold",
            isAlumni ? "text-yellow-900/60" : "text-sidebar-foreground/50"
          )}>
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard - All roles */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Dashboard"
                  isActive={currentTab === "dashboard"}
                  onClick={() => setTab("dashboard")}
                  className={cn(
                    "transition-colors",
                    isAlumni ? "hover:bg-yellow-500/40 data-[active=true]:bg-yellow-600/30 data-[active=true]:text-yellow-950" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Superadmin & Admin Menus */}
              {(isSuperAdmin || isAdmin) && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Data Siswa" onClick={() => setTab("students")}>
                      <Users className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Data Siswa</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Data Guru" onClick={() => setTab("teachers")}>
                      <UserSquare2 className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Data Guru</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Data Pembayaran" onClick={() => setTab("finance-admin")}>
                      <CreditCard className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Data Pembayaran</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Data Akademik" onClick={() => setTab("academic-admin")}>
                      <BookOpen className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Data Akademik</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Data Kelas" onClick={() => setTab("classes")}>
                      <School className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Data Kelas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Data Matapelajaran" onClick={() => setTab("subjects")}>
                      <BookMarked className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Data Matapelajaran</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Dokumen & Surat" onClick={() => setTab("documents")}>
                      <FileText className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Dokumen & Surat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isSuperAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Data Users" onClick={() => setTab("users")}>
                        <Shield className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">Data Users</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </>
              )}

              {/* Guru Menus */}
              {isGuru && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Jadwal Mengajar" onClick={() => setTab("schedule")}>
                      <Calendar className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Jadwal Mengajar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Nilai Siswa" onClick={() => setTab("grades")}>
                      <ClipboardCheck className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Nilai Siswa</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Input Raport" onClick={() => setTab("raport-input")}>
                      <FileText className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Input Raport</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* Siswa Menus */}
              {isSiswa && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Akademik" onClick={() => setTab("academic")}>
                      <BookOpen className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Akademik</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Pembayaran" onClick={() => setTab("finance")}>
                      <CreditCard className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Pembayaran</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* Alumni Menus */}
              {isAlumni && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      tooltip="Riwayat Akademik" 
                      onClick={() => setTab("academic-history")}
                      className="hover:bg-yellow-500/40"
                    >
                      <History className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Riwayat Akademik</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      tooltip="Tunggakan Keuangan" 
                      onClick={() => setTab("finance-alumni")}
                      className="hover:bg-yellow-500/40"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Tunggakan</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger 
                render={
                  <SidebarMenuButton className={cn(
                    "h-12 w-full justify-start gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                    isAlumni ? "hover:bg-yellow-500/40" : "hover:bg-sidebar-accent"
                  )}>
                    <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium leading-none">{user.name}</span>
                      <span className={cn(
                        "text-[10px]",
                        isAlumni ? "text-yellow-900/70" : "text-sidebar-foreground/70"
                      )}>{user.studentId || user.employeeId}</span>
                    </div>
                    <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => setTab("profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profil Saya</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
