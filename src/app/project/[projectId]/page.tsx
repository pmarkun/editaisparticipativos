import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarCheck, DollarSign, Target, UserCircle, MapPin, Share2 } from "lucide-react";
import Image from "next/image";

// Placeholder data for a specific project
async function getProjectDetails(projectId: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 50));

  if (projectId === "projeto-exemplo-cultura" || projectId.startsWith("festival-de-arte-urbana-comunitaria")) { // Match slugified names
    return {
      id: projectId,
      editalId: "edital-exemplo-2024", // Example edital ID
      editalName: "Edital de Fomento à Cultura Local 2024",
      name: "Festival de Arte Urbana Comunitária",
      proponentName: "Coletivo Arte Viva",
      category: "Cultura",
      description: "O Festival de Arte Urbana Comunitária visa transformar espaços públicos através da arte, promovendo a cultura local e o engajamento da comunidade. O projeto inclui a pintura de murais por artistas locais, workshops de grafite e stencil para jovens, apresentações de dança de rua e batalhas de rima. Buscamos revitalizar áreas degradadas, oferecer oportunidades para novos talentos e criar um ambiente de intercâmbio cultural e expressão artística, fortalecendo os laços comunitários e o sentimento de pertencimento.",
      location: "Diversas praças e muros da Região Central",
      beneficiaries: "Jovens artistas, moradores da Região Central, comunidade em geral.",
      value: 15000.00,
      submissionDate: "2024-07-15",
      imageUrl: "https://placehold.co/800x450.png",
      aiHint: "urban art community"
      // votes: 125, // Example vote count
    };
  }
  return null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateString: string) {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const project = await getProjectDetails(params.projectId);

  if (!project) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-destructive">Projeto não encontrado</h1>
        <p className="text-muted-foreground">O projeto que você está tentando acessar não existe.</p>
      </div>
    );
  }

  // Determine if voting is active based on edital data (needs to be fetched or passed)
  const isVotingActive = false; // Placeholder: this would depend on the associated edital's votingDeadline

  return (
    <div className="container mx-auto py-8">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative h-80 w-full bg-muted">
           <Image 
            src={project.imageUrl} 
            alt={project.name} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={project.aiHint}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground mb-2 inline-block">{project.category}</span>
            <PageTitle className="text-primary-foreground drop-shadow-lg !mb-1 !text-4xl">{project.name}</PageTitle>
            <p className="text-md text-primary-foreground/90 drop-shadow-sm">Proponente: {project.proponentName}</p>
          </div>
        </div>
        
        <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h2 className="text-xl font-headline font-semibold mb-3 text-primary">Sobre o Projeto</h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{project.description}</p>
            </section>
            
            <section>
              <h2 className="text-xl font-headline font-semibold mb-4 text-primary">Informações Adicionais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded-md">
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-foreground">Localização:</strong>
                    <span className="text-muted-foreground">{project.location}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded-md">
                  <Target className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-foreground">Beneficiários:</strong>
                    <span className="text-muted-foreground">{project.beneficiaries}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded-md">
                  <DollarSign className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-foreground">Valor Solicitado:</strong>
                    <span className="text-muted-foreground">{formatCurrency(project.value)}</span>
                  </div>
                </div>
                 <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded-md">
                  <CalendarCheck className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-foreground">Data de Submissão:</strong>
                    <span className="text-muted-foreground">{formatDate(project.submissionDate)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="bg-background shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" /> Proponente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground">{project.proponentName}</p>
                <Link href={`/edital/${project.editalId}`} className="text-xs text-primary hover:underline">
                  Ver Edital: {project.editalName}
                </Link>
              </CardContent>
            </Card>

            {/* Placeholder for vote count - would come from DB */}
            {/* {project.votes !== undefined && (
            <Card className="bg-background shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><VoteIcon className="h-5 w-5 text-primary" /> Votos Recebidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{project.votes}</p>
                <p className="text-xs text-muted-foreground">Votos até o momento.</p>
              </CardContent>
            </Card>
            )} */}
            
            <div className="space-y-3">
              {isVotingActive && (
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/edital/${project.editalId}/project/${project.id}/vote`}>
                    Votar neste Projeto
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="w-full" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copiado!'))}>
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar Projeto
              </Button>
            </div>
          </aside>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 md:p-6 text-center">
            <Link href={`/edital/${project.editalId}`} className="text-sm text-primary hover:underline">
                &larr; Voltar para a lista de projetos do edital
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// export async function generateStaticParams() {
//   // Fetch list of all project IDs if you want to pre-render them
//   // For now, an example:
//   return [{ projectId: 'projeto-exemplo-cultura' }];
// }
