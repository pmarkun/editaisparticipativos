
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditalCreateSchema, type EditalCreateFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PageTitle from "@/components/shared/PageTitle";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/client"; // Importar configuração do Firebase

export default function EditalCreateForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditalCreateFormData>({
    resolver: zodResolver(EditalCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      // subscriptionDeadline and votingDeadline will be undefined initially
    },
  });

  async function onSubmit(data: EditalCreateFormData) {
    setIsLoading(true);
    try {
      // Salvar dados no Firestore
      const docRef = await addDoc(collection(db, "editais"), {
        ...data,
        createdAt: new Date(), // Adicionar timestamp de criação
      });
      
      toast({
        title: "Edital Criado!",
        description: `O edital "${data.name}" foi criado com sucesso. ID: ${docRef.id}`,
      });
      form.reset();
    } catch (error) {
      console.error("Erro ao criar edital:", error);
      toast({
        title: "Erro ao Criar Edital",
        description: "Ocorreu um erro ao tentar salvar o edital. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageTitle>Criar Novo Edital</PageTitle>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 bg-card shadow-xl rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Edital</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Edital de Fomento à Cultura Local 2024" {...field} />
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
                <FormLabel>Descrição Completa do Edital</FormLabel>
                <FormControl>
                  <Textarea rows={5} placeholder="Detalhe os objetivos, regras, público-alvo e outras informações relevantes do edital." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="subscriptionDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Limite para Inscrição de Projetos</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="votingDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Limite para Votação nos Projetos</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                             format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const subDeadline = form.getValues("subscriptionDeadline");
                          // Voting deadline must be after subscription deadline, or after today if subDeadline is not set
                          const minDate = subDeadline || new Date(new Date().setHours(0,0,0,0));
                          return date <= minDate; // Allow same day as subDeadline but not before
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={isLoading}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Edital
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
