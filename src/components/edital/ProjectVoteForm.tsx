
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectVoteSchema, type ProjectVoteFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PageTitle from "@/components/shared/PageTitle";
import { db } from "@/firebase/client";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";

interface ProjectVoteFormProps {
  editalId: string;
  projectId: string;
  projectName: string;
}

export default function ProjectVoteForm({ editalId, projectId, projectName }: ProjectVoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectVoteFormData>({
    resolver: zodResolver(ProjectVoteSchema),
    defaultValues: {
      fullName: "",
      cpf: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit(data: ProjectVoteFormData) {
    setIsLoading(true);
    try {
      // Opcional: Verificar se o CPF já votou neste projeto
      // const votesQuery = query(
      //   collection(db, "votes"),
      //   where("projectId", "==", projectId),
      //   where("cpf", "==", data.cpf)
      // );
      // const existingVotes = await getDocs(votesQuery);
      // if (!existingVotes.empty) {
      //   toast({
      //     title: "Voto Duplicado",
      //     description: "Este CPF já votou neste projeto.",
      //     variant: "destructive",
      //   });
      //   setIsLoading(false);
      //   return;
      // }

      const voteData = {
        ...data,
        editalId: editalId,
        projectId: projectId,
        projectName: projectName, // Storing for easier reference
        votedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "votes"), voteData);
      
      toast({
        title: "Voto Registrado!",
        description: `Seu voto para o projeto "${projectName}" (ID: ${docRef.id}) foi computado com sucesso. Obrigado por participar!`,
        duration: 7000,
      });
      form.reset();
    } catch (error) {
      console.error("Erro ao registrar voto:", error);
      toast({
        title: "Erro ao Registrar Voto",
        description: "Ocorreu um erro ao tentar salvar seu voto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <PageTitle>Votar no Projeto: <span className="text-accent">{projectName}</span></PageTitle>
      <p className="mb-6 text-muted-foreground text-center">
        Sua participação é fundamental! Para garantir a transparência do processo, por favor, preencha seus dados.
        Lembre-se que cada CPF pode votar apenas uma vez neste projeto.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card shadow-xl rounded-lg">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome como aparece no documento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="XXX.XXX.XXX-XX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (com DDD)</FormLabel>
                <FormControl>
                  <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center pt-4">
            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Voto
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
