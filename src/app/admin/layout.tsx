"use client"; // Required for SidebarProvider and useSidebar hooks

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, FileText, Settings, Users, BarChart3, Palette, PanelLeft, LogOut, Mail } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import AppLogo from '@/components/layout/AppLogo';
import { AuthGuard } from '@/components/auth/AuthGuards';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="admin">
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="p-4">
              <AppLogo />
            </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Painel Admin">
                  <Link href="/admin/dashboard">
                    <Home />
                    <span>Painel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Gerenciar Editais">
                  <Link href="/admin/editais">
                    <FileText />
                    <span>Editais</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Gerenciar Usuários">
                  <Link href="/admin/users">
                    <Users />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Mensagens">
                  <Link href="/admin/messages">
                    <Mail />
                    <span>Mensagens</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Relatórios e Votos">
                  <Link href="/admin/reports">
                    <BarChart3 />
                    <span>Relatórios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Personalizar Tema">
                  <Link href="/admin/theme">
                    <Palette />
                    <span>Tema</span>
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
            <SidebarTrigger className="md:hidden"/> {/* Mobile trigger */}
            <h1 className="text-xl font-semibold">Painel Administrativo</h1>
            {/* Add breadcrumbs or other header content here */}
          </header>
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
    </AuthGuard>
  );
}
