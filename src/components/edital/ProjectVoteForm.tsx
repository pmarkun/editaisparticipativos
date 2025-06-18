
"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectVoteSchema, type ProjectVoteFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PageTitle from "@/components/shared/PageTitle";
import { db } from "@/firebase/client";
import { collection, addDoc, Timestamp } from "firebase/firestore";

type VoteFormData = ProjectVoteFormData & { captcha: string };

interface ProjectVoteFormProps {
  editalId: string;
  projectId: string;
  projectName: string;
}

export default function ProjectVoteForm({ editalId, projectId, projectName }: ProjectVoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<VoteFormData>({
    resolver: zodResolver(ProjectVoteSchema) as unknown as Resolver<VoteFormData>,
    defaultValues: {
      fullName: "",
      cpf: "",
      email: "",
      phone: "",
      captcha: "",
    },
  });

  const [captcha, setCaptcha] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    setCaptcha([Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1]);
  }, []);

  async function onSubmit(data: VoteFormData) {
    setIsLoading(true);
    if (parseInt(data.captcha) !== captcha[0] + captcha[1]) {
      toast({ title: "Captcha incorreto", variant: "destructive" });
      setIsLoading(false);
      return;
    }
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

      const token = crypto.randomUUID();
      const voteData = {
        fullName: data.fullName,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        editalId: editalId,
        projectId: projectId,
        projectName: projectName,
        status: "Pendente" as const,
        token,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "pendingVotes"), voteData);

      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emails: [data.email],
            title: "Confirme seu voto",
            text: `Clique no link para confirmar seu voto: ${window.location.origin}/api/confirm-vote?token=${token}`,
          }),
        });
      } catch (e) {
        console.error("Erro ao disparar email", e);
      }

      toast({
        title: "Confirmação enviada",
        description: "Enviamos um email com o link para confirmar seu voto.",
      });
      form.reset();
      setCaptcha([Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1]);
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
          <FormField
            control={form.control}
            name="captcha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quanto é {captcha[0]} + {captcha[1]}?</FormLabel>
                <FormControl>
                  <Input placeholder="Resultado" {...field} />
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
