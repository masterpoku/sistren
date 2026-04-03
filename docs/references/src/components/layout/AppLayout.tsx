import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useState } from "react";
import Dashboard from "@/src/features/dashboard/Dashboard";
import Academic from "@/src/features/academic/Academic";
import Profile from "@/src/features/profile/Profile";
import Attendance from "@/src/features/attendance/Attendance";
import Finance from "@/src/features/finance/Finance";
import StudentList from "@/src/features/students/StudentList";
import TeacherList from "@/src/features/teachers/TeacherList";
import PaymentList from "@/src/features/finance/PaymentList";
import UserManagementList from "@/src/features/users/UserManagementList";
import Announcements from "@/src/features/announcements/Announcements";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/src/constants";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

interface AppLayoutProps {
  user: User;
  onLogout: () => void;
}

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [currentTab, setCurrentTab] = useState("dashboard");

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard user={user} />;
      case "students":
        return <StudentList />;
      case "teachers":
        return <TeacherList />;
      case "finance-admin":
        return <PaymentList />;
      case "users":
        return <UserManagementList />;
      case "academic":
        return <Academic />;
      case "announcements":
        return <Announcements />;
      case "profile":
        return <Profile />;
      case "attendance":
        return <Attendance />;
      case "finance":
        return <Finance />;
      default:
        return (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Fitur "{currentTab}" sedang dalam pengembangan.
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <AppSidebar currentTab={currentTab} setTab={setCurrentTab} user={user} onLogout={onLogout} />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-9 w-9" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">SISTREN</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize">{currentTab}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari menu..."
                  className="w-[300px] pl-8 bg-muted/50 border-none focus-visible:ring-primary/20"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
              </Button>
              <div className="h-8 w-[1px] bg-border mx-1" />
              <div className="flex items-center gap-3">
                <div className="hidden flex-col items-end md:flex">
                  <span className="text-xs font-semibold leading-none">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground">{user.studentId || user.employeeId}</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
