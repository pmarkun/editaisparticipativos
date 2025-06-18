
import ProjectSubmitForm from "@/components/edital/ProjectSubmitForm";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import PageTitle from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getEditalIdFromSlug } from "@/lib/slug-helpers";

interface EditalDetails {
  id: string;
  name: string;
  description: string;
  slug?: string;    // Slug gerado a partir do nome
  // subscriptionDeadline: Date; // Could be useful for validation here
}

async function getEditalDetails(editalId: string): Promise<EditalDetails | null> {
  try {
    const editalRef = doc(db, "editais", editalId);
    const editalSnap = await getDoc(editalRef);

    if (editalSnap.exists()) {
      const data = editalSnap.data();
      // Basic validation for subscription period (optional here, main check on edital list/detail)
      // const subDeadline = data.subscriptionDeadline instanceof Timestamp ? data.subscriptionDeadline.toDate() : new Date(0);
      // if (new Date() > subDeadline) {
      //   console.log("Subscription period for this edital has ended.");
      //   return null; // Or throw an error / return specific status
      // }

      return {
        id: editalSnap.id,
        name: data.name || "Edital não encontrado",
        description: data.description || "Sem descrição.",
        slug: data.slug || "", // Incluir slug se existir
        // subscriptionDeadline: subDeadline,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching edital details for submission: ", error);
    return null;
  }
}

export default async function ProjectSubmitPage({ params }: { params: { editalSlug: string } }) {
  // Primeiro, encontrar o ID do edital a partir do slug
  const editalId = await getEditalIdFromSlug(params.editalSlug);
  
  if (!editalId) {
    return (
      <div className="text-center py-10">
        <PageTitle className="text-2xl !text-destructive !mb-2">Edital não encontrado</PageTitle>
        <p className="text-muted-foreground mb-4">O edital para o qual você está tentando submeter um projeto não foi encontrado, não existe ou não está mais disponível para submissões.</p>
        <Button asChild variant="link">
          <Link href="/editais">Voltar para Editais</Link>
        </Button>
      </div>
    );
  }

  const editalDetails = await getEditalDetails(editalId);

  if (!editalDetails) {
    return (
      <div className="text-center py-10">
        <PageTitle className="text-2xl !text-destructive !mb-2">Edital não encontrado</PageTitle>
        <p className="text-muted-foreground mb-4">O edital para o qual você está tentando submeter um projeto não foi encontrado, não existe ou não está mais disponível para submissões.</p>
        <Button asChild variant="link">
          <Link href="/editais">Voltar para Editais</Link>
        </Button>
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
