
'use client';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Map, PackageSearch, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      
      // Call the logout API route to clear the cookie
      await fetch('/api/logout', { method: 'POST' });
      
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

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
        <div className="p-2 mt-auto flex flex-col gap-2">
             <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto text-left" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <div className="text-sm font-semibold text-sidebar-foreground">
                    Déconnexion
                </div>
            </Button>
            <div className="flex items-center gap-2 p-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                    <p className="font-semibold text-sidebar-foreground">Admin</p>
                    <p className="text-xs text-sidebar-foreground/70">{auth.currentUser?.email}</p>
                </div>
            </div>
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
