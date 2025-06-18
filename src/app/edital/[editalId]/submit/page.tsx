import ProjectSubmitForm from "@/components/edital/ProjectSubmitForm";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// This page would typically fetch edital details based on params.editalId
// For now, we'll use a placeholder.
async function getEditalDetails(editalId: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 50)); 
  if (editalId === "edital-exemplo-2024") {
    return {
      id: editalId,
      name: "Edital de Fomento à Cultura Local 2024",
      description: "Este edital visa apoiar projetos culturais na comunidade.",
      // ... other details
    };
  }
  return null;
}


export default async function ProjectSubmitPage({ params }: { params: { editalId: string } }) {
  const editalDetails = await getEditalDetails(params.editalId);

  if (!editalDetails) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-destructive">Edital não encontrado</h1>
        <p className="text-muted-foreground">O edital que você está tentando acessar não existe ou não está mais disponível para submissões.</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-8 bg-secondary/50 border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">{editalDetails.name}</CardTitle>
          <CardDescription>{editalDetails.description}</CardDescription>
        </CardHeader>
      </Card>
      <ProjectSubmitForm editalId={editalDetails.id} editalName={editalDetails.name} />
    </div>
  );
}

// Example static generation for known editais (optional)
// export async function generateStaticParams() {
//   // Fetch list of active edital IDs
//   return [{ editalId: 'edital-exemplo-2024' }];
// }
