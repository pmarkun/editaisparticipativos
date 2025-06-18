import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import Image from "next/image";

// Placeholder data for editais
const openEditais = [
  {
    id: "edital-exemplo-2024",
    name: "Edital de Fomento à Cultura Local 2024",
    description: "Apoio a projetos culturais que valorizem a identidade e a diversidade da nossa comunidade.",
    subscriptionDeadline: "2024-08-30",
    votingDeadline: "2024-09-15",
    imageUrl: "https://placehold.co/400x250.png",
    aiHint: "culture community event"
  },
  {
    id: "edital-inovacao-ambiental-2024",
    name: "Edital Inovação Ambiental Sustentável",
    description: "Incentivo a soluções inovadoras para desafios ambientais urbanos e rurais.",
    subscriptionDeadline: "2024-09-10",
    votingDeadline: "2024-09-30",
    imageUrl: "https://placehold.co/400x250.png",
    aiHint: "nature innovation"
  },
  {
    id: "edital-esporte-para-todos-2024",
    name: "Edital Esporte para Todos",
    description: "Promoção da prática esportiva e inclusão social através do esporte.",
    subscriptionDeadline: "2024-08-20", // Example of past subscription
    votingDeadline: "2024-09-05",
    imageUrl: "https://placehold.co/400x250.png",
    aiHint: "sports people"
  }
];

function formatDate(dateString: string) {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function EditaisPage() {
  const today = new Date();

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
            const subscriptionActive = new Date(edital.subscriptionDeadline + 'T23:59:59') >= today;
            const votingActive = new Date(edital.votingDeadline + 'T23:59:59') >= today && !subscriptionActive;
            const isClosed = new Date(edital.votingDeadline + 'T23:59:59') < today;
            
            let statusText = "Ver Detalhes";
            let statusColor = "bg-primary/10 text-primary";
            let actionPath = `/edital/${edital.id}`;
            let actionButtonText = "Ver Edital";

            if (subscriptionActive) {
              statusText = "Inscrições Abertas";
              statusColor = "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300";
              actionPath = `/edital/${edital.id}/submit`;
              actionButtonText = "Submeter Projeto";
            } else if (votingActive) {
              statusText = "Votação Aberta";
              statusColor = "bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300";
              actionPath = `/edital/${edital.id}`; // Link to edital page which lists projects for voting
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
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={edital.aiHint}
                  />
                   <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                      {statusText}
                    </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="font-headline text-xl leading-tight hover:text-primary transition-colors">
                    <Link href={`/edital/${edital.id}`}>{edital.name}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="line-clamp-3 mb-3">{edital.description}</CardDescription>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-80" /> Inscrições até: {formatDate(edital.subscriptionDeadline)}</p>
                    <p className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-80" /> Votação até: {formatDate(edital.votingDeadline)}</p>
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
