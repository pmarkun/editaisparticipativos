
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CalendarDays, Users, Vote as VoteIcon } from "lucide-react";
import Image from "next/image";
import { doc, getDoc, collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { getEditalIdFromSlug } from "@/lib/slug-helpers";

interface EditalData {
  id: string;
  name: string;
  description: string;
  subscriptionDeadline: Date;
  votingDeadline: Date;
  imageUrl: string; // For placeholder
  aiHint: string;   // For placeholder
  slug?: string;    // Slug gerado a partir do nome
}

interface ProjectData {
  id: string;
  name: string; // from project.projectName
  // proponentName is not directly available from the project document currently
  summary: string; // from project.description
  imageUrl: string; // For placeholder
  aiHint: string;   // For placeholder
  slug?: string;    // Slug gerado a partir do nome do projeto
}

async function getEditalAndProjects(editalId: string): Promise<{ edital: EditalData | null; projects: ProjectData[] }> {
  try {
    // Fetch Edital Details
    const editalRef = doc(db, "editais", editalId);
    const editalSnap = await getDoc(editalRef);

    let edital: EditalData | null = null;
    if (editalSnap.exists()) {
      const data = editalSnap.data();
      edital = {
        id: editalSnap.id,
        name: data.name || "Edital não encontrado",
        description: data.description || "Sem descrição.",
        subscriptionDeadline: data.subscriptionDeadline instanceof Timestamp ? data.subscriptionDeadline.toDate() : new Date(),
        votingDeadline: data.votingDeadline instanceof Timestamp ? data.votingDeadline.toDate() : new Date(),
        imageUrl: "https://placehold.co/1200x400.png", // Placeholder
        aiHint: data.name ? data.name.toLowerCase().split(" ").slice(0,2).join(" ") : "community art", // Basic AI hint
        slug: data.slug || "", // Incluir slug se existir
      };
    }

    // Fetch Projects for this Edital
    const projectsCollection = collection(db, "projects");
    const q = query(projectsCollection, where("editalId", "==", editalId), orderBy("submittedAt", "desc"));
    const projectsSnapshot = await getDocs(q);
    const projects: ProjectData[] = projectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.projectName || "Projeto sem nome",
        summary: data.description || "Sem resumo.",
        imageUrl: "https://placehold.co/400x250.png", // Placeholder
        aiHint: data.projectName ? data.projectName.toLowerCase().split(" ").slice(0,2).join(" ") : "project idea", // Basic AI hint
        slug: data.slug || "", // Incluir slug se existir
      };
    });

    return { edital, projects };

  } catch (error) {
    console.error("Error fetching edital and projects: ", error);
    return { edital: null, projects: [] };
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function EditalDetailPage({ params }: { params: { editalSlug: string } }) {
  // Primeiro, encontrar o ID do edital a partir do slug
  const editalId = await getEditalIdFromSlug(params.editalSlug);
  
  if (!editalId) {
    return (
      <div className="text-center py-10">
        <PageTitle className="text-2xl !text-destructive !mb-2">Edital não encontrado</PageTitle>
        <p className="text-muted-foreground">O edital que você está tentando acessar não existe ou não foi encontrado.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/editais">Voltar para Editais</Link>
        </Button>
      </div>
    );
  }

  const { edital: editalData, projects } = await getEditalAndProjects(editalId);

  if (!editalData) {
    return (
      <div className="text-center py-10">
        <PageTitle className="text-2xl !text-destructive !mb-2">Edital não encontrado</PageTitle>
        <p className="text-muted-foreground">O edital que você está tentando acessar não existe ou não foi encontrado.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/editais">Voltar para Editais</Link>
        </Button>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0,0,0,0); // For accurate date comparison

  const subscriptionDeadlineDate = new Date(editalData.subscriptionDeadline);
  subscriptionDeadlineDate.setHours(23, 59, 59, 999);
  
  const votingDeadlineDate = new Date(editalData.votingDeadline);
  votingDeadlineDate.setHours(23, 59, 59, 999);

  const subscriptionActive = subscriptionDeadlineDate >= today;
  const votingActive = votingDeadlineDate >= today && !subscriptionActive;

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-10 overflow-hidden shadow-xl">
        <div className="relative h-72 w-full bg-muted">
           <Image 
            src={editalData.imageUrl} 
            alt={editalData.name} 
            fill
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
                  <Link href={`/edital/${params.editalSlug}/submit`}>
                    <Users className="mr-2 h-4 w-4" /> Submeter Projeto
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-headline font-semibold mb-6 text-primary">Projetos Inscritos</h2>
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                   <div className="relative h-40 w-full">
                     <Image 
                        src={project.imageUrl} 
                        alt={project.name} 
                        fill
                        objectFit="cover" 
                        data-ai-hint={project.aiHint}
                      />
                   </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-lg leading-tight">{project.name}</CardTitle>
                    {/* Proponent Name is not available on project document from Firestore directly 
                    <CardDescription className="text-xs">Proponente: {project.proponentName}</CardDescription> 
                    */}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{project.summary}</p>
                  </CardContent>
                  <CardFooter>
                    {votingActive ? (
                      <Button asChild className="w-full" variant="default">
                        <Link href={`/edital/${params.editalSlug}/${project.slug || project.id}/vote`}>
                          <VoteIcon className="mr-2 h-4 w-4" /> Votar Neste Projeto
                        </Link>
                      </Button>
                    ) : (
                       <Button asChild className="w-full" variant="outline">
                        <Link href={`/edital/${params.editalSlug}/${project.slug || project.id}`}> 
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
