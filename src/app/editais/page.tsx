
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import Image from "next/image";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";

interface Edital {
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
  // createdAt is fetched for sorting but not directly displayed on card here
}

async function fetchEditais(): Promise<Edital[]> {
  try {
    const editaisCollection = collection(db, "editais");
    const q = query(editaisCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const editaisList = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Edital sem nome",
        description: data.description || "Sem descrição.",
        // Firestore Timestamps to JS Date
        subscriptionStartDate: data.subscriptionStartDate instanceof Timestamp ? data.subscriptionStartDate.toDate() : new Date(),
        subscriptionEndDate: data.subscriptionEndDate instanceof Timestamp ? data.subscriptionEndDate.toDate() : new Date(),
        votingStartDate: data.votingStartDate instanceof Timestamp ? data.votingStartDate.toDate() : new Date(),
        votingEndDate: data.votingEndDate instanceof Timestamp ? data.votingEndDate.toDate() : new Date(),
        imageUrl: "https://placehold.co/400x250.png", // Placeholder
        aiHint: data.name ? data.name.toLowerCase().split(" ").slice(0,2).join(" ") : "culture community", // Basic AI hint from name
        slug: data.slug || "", // Incluir slug se existir
      };
    });
    return editaisList;
  } catch (error) {
    console.error("Error fetching editais: ", error);
    return []; // Return empty array on error
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function EditaisPage() {
  const openEditais = await fetchEditais();
  const today = new Date();
  // Clear time part for accurate date comparison
  today.setHours(0, 0, 0, 0);


  return (
    <div className="container mx-auto py-8">
      <PageTitle>Editais Abertos</PageTitle>
      <p className="mb-10 text-lg text-center text-muted-foreground max-w-2xl mx-auto">
        Explore os editais disponíveis para submissão de projetos ou participação na votação. Sua voz faz a diferença!
      </p>

      {openEditais.length === 0 ? (
        <p className="text-center text-muted-foreground text-xl">Nenhum edital aberto no momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {openEditais.map((edital) => {
            const subscriptionEndDate = new Date(edital.subscriptionEndDate);
            subscriptionEndDate.setHours(23, 59, 59, 999); // End of day
            const votingEndDate = new Date(edital.votingEndDate);
            votingEndDate.setHours(23, 59, 59, 999); // End of day
            
            const subscriptionActive = subscriptionEndDate >= today;
            const votingActive = votingEndDate >= today && !subscriptionActive;
            const isClosed = votingEndDate < today;
            
            let statusText = "Ver Detalhes";
            let statusColor = "bg-primary/10 text-primary";
            let actionPath = `/edital/${edital.slug || edital.id}`;
            let actionButtonText = "Ver Edital";

            if (subscriptionActive) {
              statusText = "Inscrições Abertas";
              statusColor = "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300";
              actionPath = `/edital/${edital.slug || edital.id}/submit`;
              actionButtonText = "Submeter Projeto";
            } else if (votingActive) {
              statusText = "Votação Aberta";
              statusColor = "bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300";
              actionPath = `/edital/${edital.slug || edital.id}`; 
              actionButtonText = "Ver Projetos e Votar";
            } else if (isClosed) {
                statusText = "Encerrado";
                statusColor = "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400";
            }

            return (
              <Card key={edital.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="relative h-48 w-full">
                  <Image 
                    src={edital.imageUrl} 
                    alt={edital.name} 
                    fill // Use fill instead of layout
                    objectFit="cover" 
                    data-ai-hint={edital.aiHint}
                  />
                   <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                      {statusText}
                    </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="font-headline text-xl leading-tight hover:text-primary transition-colors">
                    <Link href={`/edital/${edital.slug || edital.id}`}>{edital.name}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="line-clamp-3 mb-3">{edital.description}</CardDescription>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-80" /> Inscrições até: {formatDate(edital.subscriptionEndDate)}</p>
                    <p className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-80" /> Votação até: {formatDate(edital.votingEndDate)}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={isClosed ? "secondary" : "default"} disabled={isClosed && statusText !== "Ver Detalhes"}>
                    <Link href={actionPath}>
                      {actionButtonText} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
