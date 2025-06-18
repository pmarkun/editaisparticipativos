import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CalendarDays, Users, Vote as VoteIcon } from "lucide-react";
import Image from "next/image";

// Placeholder data for a specific edital and its projects
async function getEditalAndProjects(editalId: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 50));

  if (editalId === "edital-exemplo-2024") {
    return {
      id: "edital-exemplo-2024",
      name: "Edital de Fomento à Cultura Local 2024",
      description: "Este edital visa apoiar projetos culturais que valorizem a identidade e a diversidade da nossa comunidade, fomentando a participação cidadã e o desenvolvimento artístico local. Serão selecionados projetos nas áreas de música, teatro, dança, artes visuais e literatura.",
      subscriptionDeadline: "2024-08-30",
      votingDeadline: "2024-09-15",
      imageUrl: "https://placehold.co/1200x400.png", // Main edital image
      aiHint: "community culture art",
      projects: [
        {
          id: "projeto-exemplo-cultura",
          name: "Festival de Arte Urbana Comunitária",
          proponentName: "Coletivo Arte Viva",
          summary: "Um festival para celebrar a arte de rua e promover talentos locais.",
          imageUrl: "https://placehold.co/400x250.png",
          aiHint: "street art festival"
        },
        {
          id: "projeto-musica-na-praca",
          name: "Música na Praça: Talentos da Terra",
          proponentName: "Associação Som Local",
          summary: "Apresentações musicais gratuitas em praças públicas, valorizando artistas regionais.",
          imageUrl: "https://placehold.co/400x250.png",
          aiHint: "music outdoor concert"
        },
        {
          id: "projeto-oficinas-criativas",
          name: "Oficinas Criativas para Jovens",
          proponentName: "Instituto Aprender e Crescer",
          summary: "Oficinas de artes plásticas, escrita criativa e teatro para jovens da comunidade.",
          imageUrl: "https://placehold.co/400x250.png",
          aiHint: "youth workshop art"
        }
      ]
    };
  }
  return null;
}

function formatDate(dateString: string) {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function EditalDetailPage({ params }: { params: { editalId: string } }) {
  const editalData = await getEditalAndProjects(params.editalId);

  if (!editalData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-destructive">Edital não encontrado</h1>
        <p className="text-muted-foreground">O edital que você está tentando acessar não existe.</p>
      </div>
    );
  }

  const today = new Date();
  const subscriptionActive = new Date(editalData.subscriptionDeadline + 'T23:59:59') >= today;
  const votingActive = new Date(editalData.votingDeadline + 'T23:59:59') >= today && !subscriptionActive;

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-10 overflow-hidden shadow-xl">
        <div className="relative h-72 w-full bg-muted">
           <Image 
            src={editalData.imageUrl} 
            alt={editalData.name} 
            layout="fill" 
            objectFit="cover"
            data-ai-hint={editalData.aiHint}
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <PageTitle className="text-primary-foreground drop-shadow-lg !mb-2">{editalData.name}</PageTitle>
            <p className="text-lg text-primary-foreground/90 max-w-3xl drop-shadow-sm">{editalData.description.substring(0,150)}...</p>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Detalhes do Edital</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{editalData.description}</p>
            </div>
            <div className="flex-shrink-0 space-y-2 text-sm md:text-right border p-4 rounded-lg bg-secondary/30 min-w-[280px]">
              <p className="flex items-center md:justify-end gap-2"><CalendarDays className="h-4 w-4 text-primary" /> <strong>Inscrições até:</strong> {formatDate(editalData.subscriptionDeadline)}</p>
              <p className="flex items-center md:justify-end gap-2"><CalendarDays className="h-4 w-4 text-accent" /> <strong>Votação até:</strong> {formatDate(editalData.votingDeadline)}</p>
              {subscriptionActive && (
                <Button asChild size="sm" className="w-full md:w-auto mt-2">
                  <Link href={`/edital/${editalData.id}/submit`}>
                    <Users className="mr-2 h-4 w-4" /> Submeter Projeto
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-headline font-semibold mb-6 text-primary">Projetos Inscritos</h2>
          {editalData.projects && editalData.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editalData.projects.map((project) => (
                <Card key={project.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                   <div className="relative h-40 w-full">
                     <Image 
                        src={project.imageUrl} 
                        alt={project.name} 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint={project.aiHint}
                      />
                   </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-lg leading-tight">{project.name}</CardTitle>
                    <CardDescription className="text-xs">Proponente: {project.proponentName}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{project.summary}</p>
                  </CardContent>
                  <CardFooter>
                    {votingActive ? (
                      <Button asChild className="w-full" variant="default">
                        <Link href={`/edital/${editalData.id}/project/${project.id}/vote`}>
                          <VoteIcon className="mr-2 h-4 w-4" /> Votar Neste Projeto
                        </Link>
                      </Button>
                    ) : (
                       <Button asChild className="w-full" variant="outline" disabled={!subscriptionActive}>
                        <Link href={`/project/${project.id}`}> {/* Link to individual project page */}
                           Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {subscriptionActive ? "Ainda não há projetos inscritos. Seja o primeiro a submeter!" : "Nenhum projeto foi inscrito neste edital ou as inscrições ainda não foram abertas."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Example static generation for known editais (optional)
// export async function generateStaticParams() {
//   // Fetch list of active edital IDs
//   return [{ editalId: 'edital-exemplo-2024' }];
// }
