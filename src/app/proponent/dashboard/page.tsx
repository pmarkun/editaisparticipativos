import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, PlusCircle, Vote } from "lucide-react";

export default function ProponentDashboardPage() {
  return (
    <div className="space-y-8">
      <PageTitle>Painel do Proponente</PageTitle>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span>Meus Projetos</span>
            </CardTitle>
            <CardDescription>Visualize e gerencie os projetos que você submeteu.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gerencie seus projetos submetidos e acompanhe o status.</p>
            <Button asChild>
              <Link href="/proponent/projects">
                <FileText className="mr-2 h-4 w-4" /> Ver Meus Projetos
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-accent" />
              <span>Submeter Projeto</span>
            </CardTitle>
            <CardDescription>Explore os editais abertos e submeta seus projetos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Veja os editais disponíveis para submissão de projetos.</p>
            <Button variant="outline" asChild>
              <Link href="/editais">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ver Editais Disponíveis
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-6 w-6 text-secondary" />
              <span>Participar da Votação</span>
            </CardTitle>
            <CardDescription>Vote nos projetos submetidos em editais ativos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Participe da votação dos projetos em andamento.</p>
            <Button variant="secondary" asChild>
              <Link href="/editais">
                <Vote className="mr-2 h-4 w-4" />
                Ver Votações Ativas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future content, e.g., notifications, quick stats */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma notificação nova.</p>
        </CardContent>
      </Card>
    </div>
  );
}
