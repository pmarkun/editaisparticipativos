import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, PlusCircle, Users, BarChart3, Palette } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageTitle>Painel Administrativo</PageTitle>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span>Gerenciar Editais</span>
            </CardTitle>
            <CardDescription>Crie, edite e visualize todos os editais da plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                <Button asChild className="w-full">
                <Link href="/admin/editais/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Edital
                </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                <Link href="/admin/editais">
                    Ver Todos Editais
                </Link>
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-accent" />
              <span>Gerenciar Usuários</span>
            </CardTitle>
            <CardDescription>Visualize e gerencie os proponentes e administradores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/users">
                Ver Usuários
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-secondary-foreground" />
              <span>Relatórios</span>
            </CardTitle>
            <CardDescription>Acesse relatórios de projetos, votos e participação.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/reports">
                Ver Relatórios
              </Link>
            </Button>
          </CardContent>
        </Card>

         <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <span>Personalizar Tema</span>
            </CardTitle>
            <CardDescription>Ajuste as cores e a aparência da plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/theme">
                Customizar Aparência
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
