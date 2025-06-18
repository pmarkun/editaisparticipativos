"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Eye, Trash2, Calendar, Users, FileText, MoreHorizontal } from "lucide-react";
import PageTitle from "@/components/shared/PageTitle";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

function getEditalStatus(edital: Edital): {
  status: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
} {
  const now = new Date();

  if (now < edital.subscriptionStartDate) {
    return {
      status: "Programado",
      variant: "outline",
      color: "text-blue-600",
    };
  } else if (now <= edital.subscriptionEndDate) {
    return {
      status: "Inscrições Abertas",
      variant: "default",
      color: "text-green-600",
    };
  } else if (now <= edital.votingEndDate) {
    return {
      status: "Votação Aberta",
      variant: "secondary",
      color: "text-orange-600",
    };
  } else {
    return {
      status: "Finalizado",
      variant: "destructive",
      color: "text-gray-600",
    };
  }
}

export default function AdminEditaisPage() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEditais();
  }, []);

  async function fetchEditais() {
    try {
      const editaisQuery = query(
        collection(db, "editais"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(editaisQuery);
      
      const editaisData: Edital[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        editaisData.push({
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
        });
      });
      
      setEditais(editaisData);
    } catch (error) {
      console.error("Erro ao buscar editais:", error);
      toast({
        title: "Erro ao carregar editais",
        description: "Não foi possível carregar a lista de editais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEdital(editalId: string, editalName: string) {
    try {
      await deleteDoc(doc(db, "editais", editalId));
      
      // Atualizar a lista local
      setEditais(editais.filter(edital => edital.id !== editalId));
      
      toast({
        title: "Edital excluído",
        description: `O edital "${editalName}" foi excluído com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao excluir edital:", error);
      toast({
        title: "Erro ao excluir edital",
        description: "Não foi possível excluir o edital. Tente novamente.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <PageTitle>Gerenciar Editais</PageTitle>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle>Gerenciar Editais</PageTitle>
        <Button asChild>
          <Link href="/admin/editais/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Edital
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Editais
          </CardTitle>
          <CardDescription>
            Gerencie todos os editais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editais.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum edital encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Não há editais cadastrados no sistema ainda.
              </p>
              <Button asChild>
                <Link href="/admin/editais/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Edital
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Edital</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Período de Inscrição</TableHead>
                    <TableHead>Período de Votação</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editais.map((edital) => {
                    const { status, variant } = getEditalStatus(edital);
                    
                    return (
                      <TableRow key={edital.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{edital.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {edital.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={variant}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {edital.subscriptionStartDate.toLocaleDateString("pt-BR")}
                            </div>
                            <div className="text-muted-foreground">
                              até {edital.subscriptionEndDate.toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {edital.votingStartDate.toLocaleDateString("pt-BR")}
                            </div>
                            <div className="text-muted-foreground">
                              até {edital.votingEndDate.toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {edital.createdAt.toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/edital/${edital.slug}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/editais/edit/${edital.id}`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. O edital "{edital.name}" 
                                      será permanentemente excluído do sistema, junto com todos 
                                      os projetos e votos associados.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteEdital(edital.id, edital.name)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Stats Card */}
      {editais.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Editais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{editais.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {editais.filter(e => {
                  const now = new Date();
                  return now >= e.subscriptionStartDate && now <= e.votingEndDate;
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Programados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {editais.filter(e => new Date() < e.subscriptionStartDate).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {editais.filter(e => new Date() > e.votingEndDate).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
