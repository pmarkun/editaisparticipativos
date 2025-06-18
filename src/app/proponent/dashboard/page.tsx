"use client";

import { useEffect, useState } from "react";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, PlusCircle, Vote, Mail } from "lucide-react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useAuth } from "@/lib/auth";

export default function ProponentDashboardPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{id:string; title:string; createdAt:any; read:boolean}>>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const q = query(
        collection(db, "messages"),
        where("recipients", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setMessages(
        snap.docs.map((d) => {
          const data = d.data() as any;
          const read = (data.readBy || []).includes(user.uid);
          return { id: d.id, title: data.title, createdAt: data.createdAt, read };
        })
      );
    }
    load();
  }, [user]);

  return (
    <div className="space-y-8">
      <PageTitle>Painel do Proponente</PageTitle>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span>Meus Projetos</span>
            </CardTitle>
            <CardDescription>Visualize e gerencie os projetos que você submeteu.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gerencie seus projetos submetidos e acompanhe o status.</p>
            <Button asChild>
              <Link href="/proponent/projects">
                <FileText className="mr-2 h-4 w-4" /> Ver Meus Projetos
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-accent" />
              <span>Submeter Projeto</span>
            </CardTitle>
            <CardDescription>Explore os editais abertos e submeta seus projetos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Veja os editais disponíveis para submissão de projetos.</p>
            <Button variant="outline" asChild>
              <Link href="/editais">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ver Editais Disponíveis
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-6 w-6 text-secondary" />
              <span>Participar da Votação</span>
            </CardTitle>
            <CardDescription>Vote nos projetos submetidos em editais ativos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Participe da votação dos projetos em andamento.</p>
            <Button variant="secondary" asChild>
              <Link href="/editais">
                <Vote className="mr-2 h-4 w-4" />
                Ver Votações Ativas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {messages.length === 0 && (
            <p className="text-muted-foreground">Nenhuma mensagem.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="flex justify-between items-center">
              <Link href={`/proponent/messages/${m.id}`} className={m.read ? "" : "font-semibold"}>
                {m.title}
              </Link>
              <span className="text-xs text-muted-foreground">
                {new Date((m.createdAt as any).seconds ? (m.createdAt as any).seconds * 1000 : m.createdAt as any).toLocaleDateString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
