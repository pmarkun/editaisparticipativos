"use client"; // Required for SidebarProvider and useSidebar hooks

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, User, FolderKanban, Settings, PanelLeft, LogOut } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import AppLogo from '@/components/layout/AppLogo';
import { Button } from '@/components/ui/button';
// import AuthGuard from '@/components/shared/AuthGuard'; // Hypothetical AuthGuard

export default function ProponentLayout({ children }: { children: ReactNode }) {
  // In a real app, AuthGuard would handle redirecting unauthenticated users.
  // For now, we assume the user is authenticated if they reach this layout.

  return (
    // <AuthGuard role="proponent"> // Wrap with AuthGuard
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="p-4">
            <AppLogo />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Painel">
                  <Link href="/dashboard">
                    <Home />
                    <span>Painel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Meu Perfil">
                  <Link href="/proponent/profile">
                    <User />
                    <span>Meu Perfil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Meus Projetos">
                  <Link href="/proponent/projects">
                    <FolderKanban />
                    <span>Meus Projetos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
             <SidebarMenuButton variant="outline" className="justify-start text-muted-foreground hover:text-foreground">
               <LogOut className="mr-2" /> Sair
             </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger className="md:hidden" /> {/* Mobile trigger */}
            <h1 className="text-xl font-semibold">Painel do Proponente</h1>
            {/* Add breadcrumbs or other header content here */}
          </header>
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
    // </AuthGuard>
  );
}
