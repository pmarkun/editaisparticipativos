
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProponentProfileSchema, type ProponentProfileFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import EntitySubForm from "./EntitySubForm";
import { Loader2, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { auth, db } from "@/firebase/client";
import { collection, addDoc, Timestamp, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProponentProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        // Load existing profile data if it exists
        try {
          const profileDoc = await getDoc(doc(db, "proponents", currentUser.uid));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            form.reset({
              sex: profileData.sex || "",
              race: profileData.race || "",
              address: profileData.address || "",
              phone: profileData.phone || "",
              areaOfExpertise: profileData.areaOfExpertise || "",
              entities: profileData.entities || [],
            });
          }
        } catch (error) {
          console.error("Erro ao carregar perfil existente:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const form = useForm<ProponentProfileFormData>({
    resolver: zodResolver(ProponentProfileSchema),
    defaultValues: {
      sex: "",
      race: "",
      address: "",
      phone: "",
      areaOfExpertise: "",
      entities: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entities",
  });

  async function onSubmit(data: ProponentProfileFormData) {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para salvar o perfil. Faça login e tente novamente.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      // Check if user has any entities
      const hasEntity = data.entities && data.entities.length > 0;
      
      // Usar o UID do usuário autenticado como ID do documento do perfil
      const profileData = {
        ...data,
        hasEntity, // Add hasEntity flag
        userId: user.uid,
        userEmail: user.email,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(), // Será preservado se o documento já existir
      };

      // Usar setDoc com merge: true para preservar campos existentes ou criar novo documento
      await setDoc(doc(db, "proponents", user.uid), profileData, { merge: true });
      
      toast({
        title: "Perfil Salvo!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro ao Salvar Perfil",
        description: "Ocorreu um erro ao tentar salvar suas informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <PageTitle>Completar Perfil do Proponente</PageTitle>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <PageTitle>Completar Perfil do Proponente</PageTitle>
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar o perfil do proponente.
            </p>
            <Button onClick={() => router.push('/login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <PageTitle>Completar Perfil do Proponente</PageTitle>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Informações Pessoais</CardTitle>
              <CardDescription>Detalhes adicionais sobre você.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu sexo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Feminino">Feminino</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                          <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="race"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raça/Cor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione sua raça/cor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Branca">Branca</SelectItem>
                          <SelectItem value="Preta">Preta</SelectItem>
                          <SelectItem value="Parda">Parda</SelectItem>
                          <SelectItem value="Amarela">Amarela</SelectItem>
                          <SelectItem value="Indígena">Indígena</SelectItem>
                          <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua rua, número, bairro, cidade, estado, CEP" {...field} />
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
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areaOfExpertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área de Atuação Principal</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva sua principal área de atuação ou expertise (ex: Cultura, Educação, Tecnologia)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Informações da(s) Entidade(s)</CardTitle>
              <CardDescription>Adicione as entidades que você representa. Você pode adicionar mais de uma.</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <EntitySubForm key={field.id} control={form.control} index={index} remove={remove} field={field} />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: "", cnpj: "", municipalCode: "", address: "" })}
                className="w-full mt-4 border-dashed border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Entidade
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Perfil
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
