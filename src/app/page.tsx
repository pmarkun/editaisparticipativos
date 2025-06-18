import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, Vote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <header className="mb-12">
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary sm:text-6xl">
          Bem-vindo ao Edital Participativo
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/80 max-w-2xl mx-auto">
          Sua plataforma para criar, participar e votar em editais públicos de forma transparente e acessível.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-5xl w-full">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="font-headline text-2xl">Crie Editais</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Administradores podem facilmente criar e gerenciar editais, definindo prazos e critérios.
            </CardDescription>
            <Button variant="link" asChild className="mt-4 text-primary">
              <Link href="/admin/editais/new">
                Criar Novo Edital <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-4">
              <Vote className="h-6 w-6" />
            </div>
            <CardTitle className="font-headline text-2xl">Submeta Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Proponentes podem registrar suas iniciativas e submeter projetos para os editais abertos.
            </CardDescription>
             <Button variant="link" asChild className="mt-4 text-accent">
              <Link href="/editais"> {/* Placeholder link, direct to a specific edital or dashboard */}
                Ver Editais Abertos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground mb-4">
               <Image src="https://placehold.co/48x48.png" alt="Community Voting" width={32} height={32} data-ai-hint="community people" className="rounded-full" />
            </div>
            <CardTitle className="font-headline text-2xl">Vote e Participe</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              A comunidade pode votar nos projetos, influenciando diretamente as decisões.
            </CardDescription>
            <Button variant="link" asChild className="mt-4">
              <Link href="/editais">
                Explorar Projetos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button size="lg" asChild>
          <Link href="/signup">
            Comece Agora
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/sobre"> {/* Placeholder for an About page */}
            Saiba Mais <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <section className="mt-20 w-full max-w-5xl py-12 bg-card rounded-lg shadow-xl">
        <h2 className="font-headline text-3xl font-bold mb-8 text-primary">Como Funciona?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left px-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-3 text-lg font-bold">1</div>
            <h3 className="text-xl font-semibold mb-2">Registro</h3>
            <p className="text-muted-foreground">Crie sua conta como proponente ou administrador.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-3 text-lg font-bold">2</div>
            <h3 className="text-xl font-semibold mb-2">Submissão / Criação</h3>
            <p className="text-muted-foreground">Submeta seu projeto a um edital ou crie um novo edital para a comunidade.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-3 text-lg font-bold">3</div>
            <h3 className="text-xl font-semibold mb-2">Votação</h3>
            <p className="text-muted-foreground">Participe votando nos projetos que mais te inspiram.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
