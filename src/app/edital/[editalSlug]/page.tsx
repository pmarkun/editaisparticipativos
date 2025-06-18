
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import Image from "next/image";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { getEditalIdFromSlug } from "@/lib/slug-helpers";
import ProjectsList from "@/components/edital/ProjectsList";

interface EditalData {
  id: string;
  name: string;
  description: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  votingStartDate: Date;
  votingEndDate: Date;
  imageUrl: string; // For placeholder
  aiHint: string;   // For placeholder
  slug?: string;    // Slug gerado a partir do nome
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function EditalDetailPage({ params }: { params: Promise<{ editalSlug: string }> }) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  
  // Primeiro, encontrar o ID do edital a partir do slug
  const editalId = await getEditalIdFromSlug(resolvedParams.editalSlug);
  
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

  // Fetch only edital data since ProjectsList will handle projects
  const editalRef = doc(db, "editais", editalId);
  const editalSnap = await getDoc(editalRef);
  
  let editalData: EditalData | null = null;
  if (editalSnap.exists()) {
    const data = editalSnap.data();
    editalData = {
      id: editalSnap.id,
      name: data.name || "Edital não encontrado",
      description: data.description || "Sem descrição.",
      subscriptionStartDate: data.subscriptionStartDate instanceof Timestamp ? data.subscriptionStartDate.toDate() : new Date(),
      subscriptionEndDate: data.subscriptionEndDate instanceof Timestamp ? data.subscriptionEndDate.toDate() : new Date(),
      votingStartDate: data.votingStartDate instanceof Timestamp ? data.votingStartDate.toDate() : new Date(),
      votingEndDate: data.votingEndDate instanceof Timestamp ? data.votingEndDate.toDate() : new Date(),
      imageUrl: "https://placehold.co/1200x400.png", // Placeholder
      aiHint: data.name ? data.name.toLowerCase().split(" ").slice(0,2).join(" ") : "edital community", // Basic AI hint from name
      slug: data.slug || "", // Incluir slug se existir
    };
  }

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

  const subscriptionEndDate = new Date(editalData.subscriptionEndDate);
  subscriptionEndDate.setHours(23, 59, 59, 999);
  
  const votingEndDate = new Date(editalData.votingEndDate);
  votingEndDate.setHours(23, 59, 59, 999);

  const subscriptionActive = subscriptionEndDate >= today;
  const votingActive = votingEndDate >= today && !subscriptionActive;

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
              <p className="flex items-center md:justify-end gap-2"><CalendarDays className="h-4 w-4 text-primary" /> <strong>Inscrições até:</strong> {formatDate(editalData.subscriptionEndDate)}</p>
              <p className="flex items-center md:justify-end gap-2"><CalendarDays className="h-4 w-4 text-accent" /> <strong>Votação até:</strong> {formatDate(editalData.votingEndDate)}</p>
              {subscriptionActive && (
                <Button asChild size="sm" className="w-full md:w-auto mt-2">
                  <Link href={`/edital/${resolvedParams.editalSlug}/submit`}>
                    <Users className="mr-2 h-4 w-4" /> Submeter Projeto
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-headline font-semibold mb-6 text-primary">Projetos Inscritos</h2>
          <ProjectsList 
            editalId={editalData.id} 
            editalSlug={resolvedParams.editalSlug}
          />
        </CardContent>
      </Card>
    </div>
  );
}
