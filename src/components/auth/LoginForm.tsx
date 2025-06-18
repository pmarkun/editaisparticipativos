
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Importar useRouter
import { signInWithEmailAndPassword } from "firebase/auth"; // Importar do Firebase Auth
import { auth } from "@/firebase/client"; // Importar instância do Auth

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    console.log("[🧪] Auth object:", auth);
console.log("[🧪] Auth.app.options:", auth?.app?.options);
    setIsLoading(true);
    if (!auth) {
      toast({
        title: "Erro de Configuração do Firebase",
        description: "A autenticação não pôde ser inicializada. Verifique se as variáveis de ambiente do Firebase estão corretas no arquivo .env.local e reinicie o servidor de desenvolvimento.",
        variant: "destructive",
        duration: 7000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      // Login bem-sucedido
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${userCredential.user.email}!`,
      });
      // Redirecionar para o dashboard do proponente por padrão
      // Em uma app real, você pode verificar a role do usuário aqui e redirecionar apropriadamente
      router.push('/proponent/dashboard'); 
    } catch (error: any) {
      console.error("Erro no login:", error);
      let errorMessage = "Ocorreu um erro ao tentar fazer login. Tente novamente.";
      let errorTitle = "Erro no Login";

      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            errorMessage = "Email ou senha inválidos.";
            break;
          case "auth/invalid-email":
            errorMessage = "O formato do email é inválido.";
            break;
          case "auth/configuration-not-found":
            errorTitle = "Erro de Configuração do Firebase Auth";
            errorMessage = "Não foi possível conectar ao Firebase. Verifique se as variáveis de ambiente (como NEXT_PUBLIC_FIREBASE_API_KEY) estão corretas no arquivo .env.local e se o servidor de desenvolvimento foi reiniciado.";
            break;
          default:
            errorMessage = `Ocorreu um erro desconhecido: ${error.message || error.code}`;
        }
      }
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 9000, 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Login</CardTitle>
        <CardDescription>Acesse sua conta para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <Link href="/forgot-password" passHref>
            <Button variant="link" className="px-0 font-normal text-primary">Esqueceu sua senha?</Button>
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          Não tem uma conta?{" "}
          <Link href="/signup" passHref>
             <Button variant="link" className="px-1 font-semibold text-primary">Cadastre-se</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
