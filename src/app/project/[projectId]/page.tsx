
import PageTitle from "@/components/shared/PageTitle";
import ShareButton from "@/components/shared/ShareButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarCheck, DollarSign, Target, UserCircle, MapPin } from "lucide-react";
import Image from "next/image";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { getEditalSlugFromId } from "@/lib/slug-helpers";

interface ProjectDetailsData {
  id: string;
  name: string; // from projectName
  category: string; // from projectCategory
  description: string;
  location: string;
  beneficiaries: string;
  value: number;
  submissionDate: Date; // from submittedAt
  imageUrl: string; // placeholder
  aiHint: string;   // placeholder
  editalId: string;
  editalName: string;
  editalSlug?: string; // Slug do edital
  slug?: string;    // Slug gerado a partir do nome do projeto
  // proponentName: string; // Not directly available from project document
}

async function getProjectDetails(projectId: string): Promise<ProjectDetailsData | null> {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      const data = projectSnap.data();
      const editalId = data.editalId || "unknown-edital";
      const editalSlug = await getEditalSlugFromId(editalId);
      
      return {
        id: projectSnap.id,
        name: data.projectName || "Projeto Desconhecido",
        category: data.projectCategory || "Categoria Desconhecida",
        description: data.description || "Sem descrição disponível.",
        location: data.location || "Localização não informada.",
        beneficiaries: data.beneficiaries || "Beneficiários não informados.",
        value: data.value || 0,
        submissionDate: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date(),
        imageUrl: "https://placehold.co/800x450.png", // Placeholder
        aiHint: data.projectName ? data.projectName.toLowerCase().split(" ").slice(0,2).join(" ") : "project details",
        editalId: editalId,
        editalName: data.editalName || "Edital Desconhecido",
        editalSlug: editalSlug || editalId, // Use slug ou fallback para ID
        slug: data.slug || "", // Incluir slug se existir
        // proponentName: "Nome do Proponente" // This would need to be fetched/joined if stored separately
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching project details: ", error);
    return null;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
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
        <PageTitle className="text-2xl !text-destructive !mb-2">Projeto não encontrado</PageTitle>
        <p className="text-muted-foreground mb-4">O projeto que você está tentando acessar não existe.</p>
         <Button asChild variant="link">
          <Link href="/editais">Voltar para Editais</Link>
        </Button>
      </div>
    );
  }

  // Placeholder: this would depend on the associated edital's votingDeadline
  // For now, we assume voting might be closed or not relevant on this generic project page.
  // To implement this, fetch editalData based on project.editalId
  // const isVotingActive = false; 

  return (
    <div className="container mx-auto py-8">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative h-80 w-full bg-muted">
           <Image 
            src={project.imageUrl} 
            alt={project.name} 
            fill
            objectFit="cover" 
            data-ai-hint={project.aiHint}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground mb-2 inline-block">{project.category}</span>
            <PageTitle className="text-primary-foreground drop-shadow-lg !mb-1 !text-4xl">{project.name}</PageTitle>
            {/* Proponent name is not directly available from project document
            <p className="text-md text-primary-foreground/90 drop-shadow-sm">Proponente: {project.proponentName}</p> 
            */}
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
                {/* Proponent Name is not directly available
                <p className="font-medium text-foreground">{project.proponentName}</p> 
                */}
                <p className="text-muted-foreground text-sm">Informações do proponente não disponíveis diretamente aqui.</p>
                <Link href={`/edital/${project.editalSlug}`} className="text-xs text-primary hover:underline block mt-1">
                  Ver Edital: {project.editalName}
                </Link>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              {/* Voting button might not be relevant here or needs complex logic to determine if active
              {isVotingActive && (
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/edital/${project.editalSlug}/project/${project.id}/vote`}>
                    Votar neste Projeto
                  </Link>
                </Button>
              )}
              */}
              <ShareButton title={`Confira o projeto: ${project.name}`} />
            </div>
          </aside>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 md:p-6 text-center">
            <Link href={`/edital/${project.editalSlug}`} className="text-sm text-primary hover:underline">
                &larr; Voltar para a lista de projetos do edital: {project.editalName}
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
