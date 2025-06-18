"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { collection, query, where, orderBy, limit, startAfter, getDocs, getCountFromServer, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/firebase/client";
import { ProjectCategoryEnum } from "@/lib/schemas";
import Link from "next/link";
import Image from "next/image";

interface Project {
  id: string;
  projectName: string;
  entityName?: string;
  projectCategory: string;
  description: string;
  location: string;
  value: number;
  imageUrl?: string;
  editalId: string;
  editalName?: string;
  editalSlug?: string;
  submissionDate: Date;
}

interface ProjectsListProps {
  editalId: string;
  editalSlug?: string;
}

const ITEMS_PER_PAGE = 9;

export default function ProjectsList({ editalId, editalSlug }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const totalPages = Math.ceil(totalProjects / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchProjects();
  }, [editalId, categoryFilter, currentPage]);

  useEffect(() => {
    // Reset pagination when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchProjects();
    }
  }, [searchTerm]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Build query constraints
      const constraints = [
        where("editalId", "==", editalId),
        orderBy("submissionDate", "desc")
      ];

      // Add category filter if specified
      if (categoryFilter !== "all") {
        constraints.splice(1, 0, where("projectCategory", "==", categoryFilter));
      }

      // Build the query
      let projectsQuery = query(
        collection(db, "projects"),
        ...constraints,
        limit(ITEMS_PER_PAGE)
      );

      // Handle pagination
      if (currentPage > 1 && lastDoc) {
        projectsQuery = query(
          collection(db, "projects"),
          ...constraints,
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(projectsQuery);
      
      const projectsList: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projectsList.push({
          id: doc.id,
          projectName: data.projectName || "",
          entityName: data.entityName || "",
          projectCategory: data.projectCategory || "",
          description: data.description || "",
          location: data.location || "",
          value: data.value || 0,
          imageUrl: data.imageUrl || "https://placehold.co/400x300.png",
          editalId: data.editalId || "",
          editalName: data.editalName || "",
          editalSlug: data.editalSlug || "",
          submissionDate: data.submissionDate?.toDate() || new Date(),
        });
      });

      // Filter by search term (client-side for now)
      let filteredProjects = projectsList;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredProjects = projectsList.filter(project => 
          project.projectName.toLowerCase().includes(searchLower) ||
          (project.entityName && project.entityName.toLowerCase().includes(searchLower))
        );
      }

      setProjects(filteredProjects);
      
      // Update pagination documents
      if (querySnapshot.docs.length > 0) {
        setFirstDoc(querySnapshot.docs[0]);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      // Get total count for pagination
      await fetchTotalCount();

    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const constraints = [where("editalId", "==", editalId)];
      
      if (categoryFilter !== "all") {
        constraints.push(where("projectCategory", "==", categoryFilter));
      }

      const countQuery = query(collection(db, "projects"), ...constraints);
      const snapshot = await getCountFromServer(countQuery);
      setTotalProjects(snapshot.data().count);
    } catch (error) {
      console.error("Erro ao contar projetos:", error);
      setTotalProjects(0);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProjects();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
          <CardDescription>
            Filtre os projetos por nome do projeto, entidade ou categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome do projeto ou entidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {ProjectCategoryEnum.options.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Projetos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== "all" 
                ? "Nenhum projeto encontrado com os filtros aplicados."
                : "Nenhum projeto inscrito neste edital ainda."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={project.imageUrl || "https://placehold.co/400x300.png"}
                    alt={project.projectName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                      {project.projectCategory}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {project.projectName}
                  </CardTitle>
                  {project.entityName && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.entityName}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p><strong>Local:</strong> {project.location}</p>
                    <p><strong>Valor:</strong> {formatCurrency(project.value)}</p>
                    <p><strong>Submetido em:</strong> {formatDate(project.submissionDate)}</p>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full" size="sm">
                      <Link href={`/edital/${editalSlug || editalId}/${project.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, totalProjects)} de {totalProjects} projetos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
