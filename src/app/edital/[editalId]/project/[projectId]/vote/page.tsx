
import ProjectVoteForm from "@/components/edital/ProjectVoteForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import PageTitle from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProjectDetails {
  id: string;
  editalId: string;
  name: string; // from projectName
  description: string;
  // proponentName: string; // Not directly available from project document
  imageUrl: string; // Placeholder
  aiHint: string; // Placeholder
  // You might want to fetch edital voting deadlines here to ensure voting is still active
}

async function getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      const data = projectSnap.data();
      return {
        id: projectSnap.id,
        editalId: data.editalId || "unknown-edital",
        name: data.projectName || "Projeto Desconhecido",
        description: data.description || "Sem descrição disponível.",
        imageUrl: "https://placehold.co/600x400.png", // Placeholder
        aiHint: data.projectName ? data.projectName.toLowerCase().split(" ").slice(0,2).join(" ") : "project idea",
        // proponentName: "Nome do Proponente" // This would need to be fetched/joined if stored separately
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching project details for voting: ", error);
    return null;
  }
}

export default async function ProjectVotePage({ params }: { params: { editalId: string, projectId: string } }) {
  const projectDetails = await getProjectDetails(params.projectId);

  if (!projectDetails) {
    return (
      <div className="text-center py-10">
        <PageTitle className="text-2xl !text-destructive !mb-2">Projeto não encontrado</PageTitle>
        <p className="text-muted-foreground mb-4">O projeto que você está tentando acessar para votação não existe ou não está mais disponível.</p>
        <Button asChild variant="link">
          <Link href={`/edital/${params.editalId || 'default-edital-id'}`}>Voltar ao Edital</Link>
        </Button>
      </div>
    );
  }

  // Optional: Add logic here to check if edital voting period is active
  // by fetching edital details (params.editalId) and comparing dates.
  // If not active, display a message and disable the form.

  return (
    <div>
      <Card className="mb-8 overflow-hidden shadow-lg">
        {projectDetails.imageUrl && (
          <div className="relative h-64 w-full">
            <Image 
              src={projectDetails.imageUrl} 
              alt={projectDetails.name} 
              fill
              objectFit="cover" 
              data-ai-hint={projectDetails.aiHint}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">{projectDetails.name}</CardTitle>
          {/* Proponent name is not directly available 
          <CardDescription className="text-sm">Proponente: {projectDetails.proponentName}</CardDescription>
          */}
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 leading-relaxed">{projectDetails.description}</p>
        </CardContent>
      </Card>
      <ProjectVoteForm 
        editalId={projectDetails.editalId} 
        projectId={projectDetails.id} 
        projectName={projectDetails.name} 
      />
    </div>
  );
}
