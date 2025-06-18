import ProjectVoteForm from "@/components/edital/ProjectVoteForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// This page would typically fetch project details based on params
async function getProjectDetails(editalId: string, projectId: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 50));
  if (projectId === "projeto-exemplo-cultura") {
    return {
      id: projectId,
      editalId: editalId,
      name: "Festival de Arte Urbana Comunitária",
      description: "Um festival para celebrar a arte de rua e promover talentos locais, com workshops, murais e apresentações.",
      proponentName: "Coletivo Arte Viva",
      imageUrl: "https://placehold.co/600x400.png",
      // ... other details
    };
  }
  return null;
}

export default async function ProjectVotePage({ params }: { params: { editalId: string, projectId: string } }) {
  const projectDetails = await getProjectDetails(params.editalId, params.projectId);

  if (!projectDetails) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-destructive">Projeto não encontrado</h1>
        <p className="text-muted-foreground">O projeto que você está tentando acessar para votação não existe ou não está mais disponível.</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-8 overflow-hidden shadow-lg">
        {projectDetails.imageUrl && (
          <div className="relative h-64 w-full">
            <Image 
              src={projectDetails.imageUrl} 
              alt={projectDetails.name} 
              layout="fill" 
              objectFit="cover" 
              data-ai-hint="community art festival"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">{projectDetails.name}</CardTitle>
          <CardDescription className="text-sm">Proponente: {projectDetails.proponentName}</CardDescription>
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

// Example static generation for known projects (optional)
// export async function generateStaticParams() {
//   // Fetch list of active project IDs for specific editais
//   return [{ editalId: 'edital-exemplo-2024', projectId: 'projeto-exemplo-cultura' }];
// }
