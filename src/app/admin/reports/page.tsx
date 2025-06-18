import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/client";
import { ArrowRight } from "lucide-react";

interface SimpleEdital {
  id: string;
  name: string;
  slug?: string;
}

async function fetchEditais(): Promise<SimpleEdital[]> {
  try {
    const editaisCollection = collection(db, "editais");
    const q = query(editaisCollection, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Edital",
        slug: data.slug || "",
      };
    });
  } catch (err) {
    console.error("Erro ao buscar editais", err);
    return [];
  }
}

export default async function ReportsPage() {
  const editais = await fetchEditais();
  return (
    <div className="space-y-6">
      <PageTitle>Relatórios</PageTitle>
      {editais.length === 0 ? (
        <p className="text-muted-foreground">Nenhum edital encontrado.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {editais.map((edital) => (
            <Card key={edital.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-lg">{edital.name}</CardTitle>
                <CardDescription>Visualizar estatísticas de votos.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/admin/reports/${edital.slug || edital.id}`}>
                    Ver Relatório <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

