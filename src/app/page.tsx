import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";

interface Edital {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  imageUrl?: string;
  slug: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  votingStartDate: Date;
  votingEndDate: Date;
  createdAt: Date;
}

async function getEditais(): Promise<{ openEditais: Edital[], closedEditais: Edital[] }> {
  try {
    const editaisRef = collection(db, "editais");
    const editaisQuery = query(editaisRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(editaisQuery);
    
    const now = new Date();
    const openEditais: Edital[] = [];
    const closedEditais: Edital[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const edital: Edital = {
        id: doc.id,
        name: data.name || "Edital sem nome",
        description: data.description || "Sem descrição",
        detailedDescription: data.detailedDescription,
        imageUrl: data.imageUrl,
        slug: data.slug || doc.id,
        subscriptionStartDate: data.subscriptionStartDate?.toDate() || new Date(),
        subscriptionEndDate: data.subscriptionEndDate?.toDate() || new Date(),
        votingStartDate: data.votingStartDate?.toDate() || new Date(),
        votingEndDate: data.votingEndDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
      
      // Check if edital is still open (either in subscription or voting phase)
      if (now <= edital.votingEndDate) {
        openEditais.push(edital);
      } else {
        closedEditais.push(edital);
      }
    });
    
    return { 
      openEditais: openEditais.sort((a, b) => a.subscriptionStartDate.getTime() - b.subscriptionStartDate.getTime()),
      closedEditais: closedEditais.sort((a, b) => b.votingEndDate.getTime() - a.votingEndDate.getTime())
    };
  } catch (error) {
    console.error("Erro ao buscar editais:", error);
    return { openEditais: [], closedEditais: [] };
  }
}

function getEditalStatus(edital: Edital): { status: string, color: string, icon: React.ReactNode } {
  const now = new Date();
  
  if (now < edital.subscriptionStartDate) {
    return { 
      status: "Em breve", 
      color: "text-blue-600", 
      icon: <Clock className="h-4 w-4" /> 
    };
  } else if (now <= edital.subscriptionEndDate) {
    return { 
      status: "Inscrições abertas", 
      color: "text-green-600", 
      icon: <Calendar className="h-4 w-4" /> 
    };
  } else if (now <= edital.votingEndDate) {
    return { 
      status: "Votação aberta", 
      color: "text-orange-600", 
      icon: <Calendar className="h-4 w-4" /> 
    };
  } else {
    return { 
      status: "Encerrado", 
      color: "text-gray-600", 
      icon: <CheckCircle className="h-4 w-4" /> 
    };
  }
}

function EditalCard({ edital, isOpen }: { edital: Edital, isOpen: boolean }) {
  const { status, color, icon } = getEditalStatus(edital);
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      {edital.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={edital.imageUrl}
            alt={edital.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline text-xl line-clamp-2">{edital.name}</CardTitle>
          <div className={`flex items-center gap-1 text-sm ${color}`}>
            {icon}
            <span>{status}</span>
          </div>
        </div>
        <CardDescription className="line-clamp-3">{edital.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Inscrições: {edital.subscriptionStartDate.toLocaleDateString()} - {edital.subscriptionEndDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Votação: {edital.votingStartDate.toLocaleDateString()} - {edital.votingEndDate.toLocaleDateString()}</span>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link href={`/edital/${edital.slug}`}>
            Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  const { openEditais, closedEditais } = await getEditais();

  return (
    <div className="min-h-screen">
      {/* Hero Section com imagem de header */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Participação cidadã"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold mb-6">
            Editais Participativos
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Transparência, participação e democracia na gestão de recursos públicos. 
            Submeta projetos, vote nas melhores propostas e acompanhe o desenvolvimento da sua comunidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Criar Conta
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="#editais-abertos">
                Ver Editais
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Editais Abertos */}
        <section id="editais-abertos" className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4 text-primary">
              Editais Abertos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Participe agora! Estes editais estão com inscrições ou votações abertas.
            </p>
          </div>
          
          {openEditais.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {openEditais.map((edital) => (
                <EditalCard key={edital.id} edital={edital} isOpen={true} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Clock className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Nenhum edital aberto no momento</h3>
                  <p className="text-muted-foreground">
                    Não há editais com inscrições ou votações abertas atualmente. 
                    Volte em breve para conferir novas oportunidades!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Editais Encerrados */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4 text-primary">
              Editais Encerrados
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Confira os resultados e projetos dos editais já finalizados.
            </p>
          </div>
          
          {closedEditais.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {closedEditais.map((edital) => (
                <EditalCard key={edital.id} edital={edital} isOpen={false} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Nenhum edital encerrado ainda</h3>
                  <p className="text-muted-foreground">
                    Quando os editais forem finalizados, você poderá consultar os resultados aqui.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Call to Action */}
        <section className="bg-secondary/30 rounded-lg p-8 text-center">
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4">
            Pronto para Participar?
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Faça parte da mudança! Crie sua conta e comece a participar dos editais da sua comunidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Criar Conta Gratuita
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">
                Já Tenho Conta
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
