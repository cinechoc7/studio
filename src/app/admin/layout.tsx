import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Map, PackageSearch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <PackageSearch className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold text-sidebar-foreground">Colis Suivi Pro</h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard">
                        <Link href="/admin">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Optimiser la route">
                        <Link href="/admin/optimize">
                            <Map />
                            <span>Optimiser la route</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <div className="p-2 mt-auto">
            <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto text-left">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                    <p className="font-semibold text-sidebar-foreground">Admin</p>
                    <p className="text-xs text-sidebar-foreground/70">admin@colis-suivi.pro</p>
                </div>
            </Button>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
                {/* Optional Header Content */}
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
