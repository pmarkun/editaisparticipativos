"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, User, FolderKanban, FileText, Users, BarChart3, Palette, Mail, LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppLogo from '@/components/layout/AppLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { AuthGuard } from '@/components/auth/AuthGuards';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const title = isAdmin ? 'Painel Administrativo' : 'Painel do Proponente';

  return (
    <AuthGuard>
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
                {isAdmin && (
                  <>
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
                  </>
                )}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2">
              <Button variant="outline" className="justify-start w-full text-muted-foreground hover:text-foreground">
                <LogOut className="mr-2" /> Sair
              </Button>
            </SidebarFooter>
          </Sidebar>
          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-xl font-semibold">{title}</h1>
            </header>
            <main className="flex-1 p-6 bg-muted/30">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
