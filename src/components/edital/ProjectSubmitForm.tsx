
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectSubmitSchema, type ProjectSubmitFormData, ProjectCategoryEnum } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PageTitle from "@/components/shared/PageTitle";
import { db } from "@/firebase/client";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { generateSlug } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface ProjectSubmitFormProps {
  editalId: string; // To associate the project with an edital
  editalName: string; // To display on the form
  editalSlug?: string; // Para gerar a URL correta do projeto
}

export default function ProjectSubmitForm({ editalId, editalName, editalSlug }: ProjectSubmitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const { toast } = useToast();
  const { userData } = useAuth();
  const searchParams = useSearchParams();

  const form = useForm<ProjectSubmitFormData>({
    resolver: zodResolver(ProjectSubmitSchema),
    defaultValues: {
      entityIndex: "",
      projectCategory: "Cultura",
      projectName: "",
      description: "",
      location: "",
      beneficiaries: "",
      value: 0,
      agreedToTerms: false,
    },
  });

  // Check if we're editing an existing project
  useEffect(() => {
    const editProjectId = searchParams.get('edit');
    if (editProjectId) {
      setIsEditing(true);
      setEditingProjectId(editProjectId);
      loadProjectData(editProjectId);
    }
  }, [searchParams]);

  async function loadProjectData(projectId: string) {
    try {
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        // Verify that the project belongs to the current user
        if (data.userId !== userData?.uid) {
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para editar este projeto.",
            variant: "destructive",
          });
          return;
        }
        
        const idx =
          userData?.entities && data.proponentEntity
            ? userData.entities.findIndex((e) => e.cnpj === data.proponentEntity.cnpj)
            : -1;

        form.reset({
          entityIndex: idx >= 0 ? idx.toString() : "",
          projectCategory: data.projectCategory || "Cultura",
          projectName: data.projectName || "",
          description: data.description || "",
          location: data.location || "",
          beneficiaries: data.beneficiaries || "",
          value: data.value || 0,
          agreedToTerms: true, // Already agreed when first submitted
        });
      } else {
        toast({
          title: "Projeto não encontrado",
          description: "O projeto que você está tentando editar não foi encontrado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar projeto:", error);
      toast({
        title: "Erro ao carregar projeto",
        description: "Não foi possível carregar os dados do projeto.",
        variant: "destructive",
      });
    }
  }

  async function onSubmit(data: ProjectSubmitFormData) {
    setIsLoading(true);
    try {
      if (isEditing && editingProjectId) {
        // Update existing project
        const projectRef = doc(db, "projects", editingProjectId);
        const entity =
          userData?.entities && data.entityIndex !== ""
            ? userData.entities[parseInt(data.entityIndex, 10)]
            : null;

        const { entityIndex, ...updateValues } = data;

        await updateDoc(projectRef, {
          ...updateValues,
          entityName: entity?.name,
          proponentEntity: entity,
          updatedAt: Timestamp.now(),
        });

        toast({
          title: "Projeto Atualizado!",
          description: `Seu projeto "${data.projectName}" foi atualizado com sucesso.`,
          duration: 5000,
        });
      } else {
        // Create new project
        const slug = generateSlug(data.projectName);

        const entity =
          userData?.entities && data.entityIndex !== ""
            ? userData.entities[parseInt(data.entityIndex, 10)]
            : null;

        const { entityIndex, ...projectValues } = data;

        const projectData = {
          ...projectValues,
          slug: slug,
          editalId: editalId,
          editalName: editalName,
          submittedAt: Timestamp.now(),
          userId: userData?.uid,
          userEmail: userData?.email,
          userName: userData?.name,
          entityName: entity?.name,
          proponentEntity: entity,
        };

        const docRef = await addDoc(collection(db, "projects"), projectData);
        
        const projectUrl = editalSlug 
          ? `/edital/${editalSlug}/${slug}` 
          : `/edital/${editalId}/${slug}`;

        toast({
          title: "Projeto Submetido!",
          description: (
            <div>
              <p>Seu projeto "{data.projectName}" foi submetido com sucesso para o edital "{editalName}".</p>
              <p className="mt-2">Slug: {slug}</p>
              <p className="mt-1">URL do Projeto (exemplo): <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="underline">{projectUrl}</a></p>
            </div>
          ),
          duration: 7000,
        });
      }
      
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      toast({
        title: isEditing ? "Erro ao Atualizar Projeto" : "Erro ao Submeter Projeto",
        description: "Ocorreu um erro ao tentar salvar o projeto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageTitle>
        {isEditing ? "Editar Projeto" : `Submeter Projeto para: `}
        {!isEditing && <span className="text-accent">{editalName}</span>}
      </PageTitle>
      {isEditing && (
        <p className="text-center text-muted-foreground mb-6">
          Edite as informações do seu projeto abaixo.
        </p>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 bg-card shadow-xl rounded-lg">
          {userData?.entities && userData.entities.length > 0 ? (
            <FormField
              control={form.control}
              name="entityIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entidade Proponente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a entidade proponente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userData?.entities?.map((entity, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>{entity.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Confirme qual entidade está vinculada a este projeto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma entidade cadastrada. Adicione uma em seu perfil antes de submeter projetos.
            </p>
          )}
          <FormField
            control={form.control}
            name="projectCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria do Projeto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria principal do seu projeto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ProjectCategoryEnum.Values).map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto</FormLabel>
                <FormControl>
                  <Input placeholder="Título conciso e impactante para seu projeto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição Detalhada do Projeto</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="Descreva os objetivos, metodologia, impacto esperado, cronograma, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização/Abrangência</FormLabel>
                <FormControl>
                  <Input placeholder="Onde o projeto será realizado? (Bairro, Cidade, Região)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="beneficiaries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Público-Alvo / Beneficiários</FormLabel>
                <FormControl>
                  <Input placeholder="Quem será diretamente beneficiado pelo projeto?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Solicitado (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} 
                    onChange={event => field.onChange(event.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agreedToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Li e concordo com os termos e condições do edital.
                  </FormLabel>
                  <FormDescription>
                    Certifico que todas as informações fornecidas são verdadeiras.
                  </FormDescription>
                   <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Atualizar Projeto" : "Submeter Projeto"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
