"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, FileText, Calendar, Building } from "lucide-react";
import PageTitle from "@/components/shared/PageTitle";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/firebase/client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  projectName: string;
  projectCategory: string;
  description: string;
  location: string;
  beneficiaries: string;
  value: number;
  editalId: string;
  editalName: string;
  slug: string;
  submittedAt: Date;
  userId: string;
  userEmail: string;
  userName: string;
}

interface Edital {
  id: string;
  name: string;
  slug: string;
  subscriptionEndDate: Date;
  votingEndDate: Date;
}

function getProjectStatus(project: Project, edital: Edital | null): { 
  status: "Pendente" | "Enviado" | "Em Votação" | "Finalizado", 
  variant: "default" | "secondary" | "destructive" | "outline",
  canEdit: boolean 
} {
  if (!edital) {
    return { status: "Enviado", variant: "secondary", canEdit: false };
  }

  const now = new Date();
  
  if (now <= edital.subscriptionEndDate) {
    return { status: "Pendente", variant: "outline", canEdit: true };
  } else if (now <= edital.votingEndDate) {
    return { status: "Em Votação", variant: "default", canEdit: false };
  } else {
    return { status: "Finalizado", variant: "secondary", canEdit: false };
  }
}

export default function MyProjectsPage() {
  const { userData, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editais, setEditais] = useState<Map<string, Edital>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      if (!userData?.uid) return;
      
      try {
        // Buscar projetos do usuário
        const projectsQuery = query(
          collection(db, "projects"),
          where("userId", "==", userData.uid),
          orderBy("submittedAt", "desc")
        );
        
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData: Project[] = [];
        const editalIds = new Set<string>();
        
        projectsSnapshot.forEach((doc) => {
          const data = doc.data();
          const project: Project = {
            id: doc.id,
            projectName: data.projectName || "Projeto sem nome",
            projectCategory: data.projectCategory || "Não informado",
            description: data.description || "",
            location: data.location || "",
            beneficiaries: data.beneficiaries || "",
            value: data.value || 0,
            editalId: data.editalId,
            editalName: data.editalName || "Edital não informado",
            slug: data.slug || doc.id,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            userId: data.userId,
            userEmail: data.userEmail || "",
            userName: data.userName || "",
          };
          
          projectsData.push(project);
          editalIds.add(data.editalId);
        });
        
        // Buscar dados dos editais
        const editaisMap = new Map<string, Edital>();
        const editalPromises = Array.from(editalIds).map(async (editalId) => {
          try {
            const editalQuery = query(
              collection(db, "editais"),
              where("__name__", "==", editalId)
            );
            const editalSnapshot = await getDocs(editalQuery);
            
            if (!editalSnapshot.empty) {
              const editalDoc = editalSnapshot.docs[0];
              const editalData = editalDoc.data();
              editaisMap.set(editalId, {
                id: editalDoc.id,
                name: editalData.name || "Edital não encontrado",
                slug: editalData.slug || editalDoc.id,
                subscriptionEndDate: editalData.subscriptionEndDate?.toDate() || new Date(),
                votingEndDate: editalData.votingEndDate?.toDate() || new Date(),
              });
            }
          } catch (error) {
            console.error(`Erro ao buscar edital ${editalId}:`, error);
          }
        });
        
        await Promise.all(editalPromises);
        
        setProjects(projectsData);
        setEditais(editaisMap);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchProjects();
    }
  }, [userData?.uid, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <PageTitle>Meus Projetos</PageTitle>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="space-y-6">
        <PageTitle>Meus Projetos</PageTitle>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Você precisa estar logado para ver seus projetos.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle>Meus Projetos</PageTitle>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Projetos Submetidos
          </CardTitle>
          <CardDescription>
            Gerencie todos os projetos que você submeteu para editais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não submeteu nenhum projeto para editais.
              </p>
              <Button asChild>
                <Link href="/editais">
                  Ver Editais Disponíveis
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Edital</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const edital = editais.get(project.editalId) || null;
                    const { status, variant, canEdit } = getProjectStatus(project, edital);
                    
                    return (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{project.projectName}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {project.projectCategory}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{project.editalName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {project.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {project.submittedAt.toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={variant}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <Link href={`/edital/${edital?.slug || project.editalId}/${project.slug}`}>
                                Ver Projeto
                              </Link>
                            </Button>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="default"
                                disabled={!canEdit}
                                asChild
                              >
                                <Link href={`/edital/${edital?.slug || project.editalId}/submit?edit=${project.id}`}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <Card className="bg-secondary/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Quer submeter mais projetos?</h3>
              <p className="text-muted-foreground mb-4">
                Explore os editais disponíveis e submeta novos projetos.
              </p>
              <Button asChild>
                <Link href="/editais">
                  Ver Editais Disponíveis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
