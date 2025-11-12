'use client';
import { useState } from 'react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Map, LogOut, Package, PanelLeft, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const NavContent = ({isMobile = false}: {isMobile?: boolean}) => (
    <nav className="flex flex-col h-full">
        <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-sidebar-primary rounded-lg">
                    <Package className="h-7 w-7 text-sidebar-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-sidebar-foreground">Colimove</h1>
            </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/admin" onClick={() => isMobile && setOpen(false)}>
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/admin/optimize" onClick={() => isMobile && setOpen(false)}>
                            <Map />
                            <span>Optimiser la route</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <div className="p-4 mt-auto border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                <Avatar className="h-10 w-10 border-2 border-sidebar-accent">
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                    <p className="font-semibold text-sidebar-foreground">Admin</p>
                    <p className="text-xs text-sidebar-foreground/70">{auth.currentUser?.email}</p>
                </div>
                 <Button variant="ghost" size="icon" className="w-8 h-8 ml-auto rounded-full hover:bg-black/30" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </nav>
  );

  const MobileNav = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 sm:max-w-xs bg-sidebar text-sidebar-foreground border-r-0">
        <NavContent isMobile={true} />
      </SheetContent>
    </Sheet>
  );

  const DesktopNav = (
      <Sidebar className="hidden sm:flex sm:flex-col fixed inset-y-0 left-0 z-10 w-64">
          <NavContent />
      </Sidebar>
  );

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {DesktopNav}
        <div className="flex flex-col flex-1 sm:ml-64">
          <header className="sticky top-0 z-30 flex items-center h-16 gap-4 px-4 bg-white border-b shadow-sm sm:h-20 sm:px-6">
              <div className="sm:hidden">
                {MobileNav}
              </div>
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un colis..."
                  className="w-full pl-10 pr-4 bg-secondary h-11"
                />
              </div>
          </header>
          <main className="flex-1 p-4 bg-secondary/60 sm:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
