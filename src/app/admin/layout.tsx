
'use client';
import { useState } from 'react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Map, PackageSearch, LogOut, Package, PanelLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  const MobileNav = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground p-0">
        <nav className="flex flex-col h-full">
          <SidebarHeader className="p-4">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <Package className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-semibold text-sidebar-foreground">Colimove</h1>
              </div>
          </SidebarHeader>
           <SidebarContent className="p-4">
              <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                          <Link href="/admin" onClick={() => setOpen(false)}>
                              <LayoutDashboard />
                              <span>Dashboard</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                          <Link href="/admin/optimize" onClick={() => setOpen(false)}>
                              <Map />
                              <span>Optimiser la route</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-sidebar-border">
               <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto text-left" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                  <div className="text-sm font-semibold text-sidebar-foreground">
                      Déconnexion
                  </div>
              </Button>
              <div className="flex items-center gap-2 p-2 mt-2">
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
        </nav>
      </SheetContent>
    </Sheet>
  );

  const DesktopNav = (
      <Sidebar className="hidden sm:flex sm:flex-col fixed inset-y-0 left-0 z-10 w-64">
          <SidebarHeader>
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <Package className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-semibold text-sidebar-foreground">Colimove</h1>
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
  )

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full bg-background">
        {DesktopNav}
        <div className="flex flex-col sm:ml-64 flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-[60px] sm:px-6">
              {MobileNav}
              <div className="w-full flex-1">
                  {/* Optional Header Content */}
              </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
