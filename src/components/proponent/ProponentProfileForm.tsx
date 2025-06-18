
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { db } from "@/firebase/client";
import { collection, addDoc, Timestamp, doc, setDoc } from "firebase/firestore";

export default function ProponentProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProponentProfileFormData>({
    resolver: zodResolver(ProponentProfileSchema),
    defaultValues: {
      sex: "",
      race: "",
      address: "",
      phone: "",
      areaOfExpertise: "",
      entities: [],
      // Em um app real, você buscaria o email do usuário logado (Firebase Auth) e usaria como ID aqui.
      // Ou, se for um novo usuário, usaria o ID gerado pelo Firebase Auth.
      // Por agora, o `id` não é usado ativamente para `addDoc`, mas seria para `setDoc`.
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entities",
  });

  async function onSubmit(data: ProponentProfileFormData) {
    setIsLoading(true);
    try {
      // NOTA: Em uma aplicação real com autenticação, você usaria o ID do usuário logado
      // para criar ou atualizar o documento do perfil. Ex:
      // const userId = firebase.auth().currentUser.uid;
      // await setDoc(doc(db, "proponents", userId), { ...data, updatedAt: Timestamp.now() });
      //
      // Como não temos autenticação completa aqui, usaremos addDoc, que criará um novo perfil
      // a cada submissão. Isso é apenas para fins de demonstração da integração com Firestore.
      const profileData = {
        ...data,
        // Removendo o campo `id` se ele existir nos dados, pois `addDoc` gera o ID.
        // Se usasse `setDoc`, o `id` seria o ID do documento.
        id: undefined, 
        createdAt: Timestamp.now(), // Ou updatedAt se for uma atualização
      };

      const docRef = await addDoc(collection(db, "proponents"), profileData);
      
      toast({
        title: "Perfil Salvo!",
        description: `Suas informações foram salvas com sucesso. ID do Perfil: ${docRef.id}`,
      });
      // Não resetar o formulário aqui é comum para formulários de perfil,
      // permitindo que o usuário veja os dados que acabou de salvar.
      // form.reset(); 
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
