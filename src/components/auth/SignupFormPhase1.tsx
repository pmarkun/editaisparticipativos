
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchemaPhase1, type SignupFormDataPhase1 } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Import Firebase Auth functions
import { doc, setDoc, Timestamp } from "firebase/firestore"; // Import Firestore functions
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/client";

export default function SignupFormPhase1() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignupFormDataPhase1>({
    resolver: zodResolver(SignupSchemaPhase1),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignupFormDataPhase1) {
    setIsLoading(true);

    // Aguardar um pouco para garantir que o Firebase foi inicializado
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!auth || !db) {
      toast({
        title: "Erro de Configuração",
        description: "Firebase Auth ou Firestore não estão configurados corretamente. Aguarde um momento e tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Atualizar o perfil do usuário no Firebase Auth (adicionar nome)
      await updateProfile(user, {
        displayName: data.name,
      });

      // Salvar informações adicionais do usuário no Firestore
      // Usar o UID do Firebase Auth como ID do documento na coleção 'users'
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: data.name,
        email: data.email,
        role: "proponent", // Definir role padrão como proponente
        createdAt: Timestamp.now(),
      });
      
      toast({
        title: "Conta Criada com Sucesso!",
        description: `Bem-vindo, ${data.name}! Sua conta foi criada. Você será redirecionado para o login.`,
      });
      form.reset();
      // Redirecionar para a página de login após o cadastro bem-sucedido
      router.push('/login'); 
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      let errorMessage = "Ocorreu um erro ao tentar criar sua conta. Tente novamente.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Este email já está sendo utilizado por outra conta.";
            break;
          case "auth/invalid-email":
            errorMessage = "O formato do email é inválido.";
            break;
          case "auth/weak-password":
            errorMessage = "A senha é muito fraca. Tente uma senha mais forte.";
            break;
          default:
            errorMessage = `Erro: ${error.message}`;
        }
      }
      toast({
        title: "Erro no Cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Criar Conta</CardTitle>
        <CardDescription>Preencha os campos abaixo para se registrar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Repita sua senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          Já tem uma conta?{" "}
          <Link href="/login" passHref>
            <Button variant="link" className="px-1 font-semibold text-primary">Faça login</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
