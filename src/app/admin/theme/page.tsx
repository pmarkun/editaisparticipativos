"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThemeConfigSchema, type ThemeConfigData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PageTitle from "@/components/shared/PageTitle";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useToast } from "@/hooks/use-toast";

export default function ThemePage() {
  const { toast } = useToast();
  const form = useForm<ThemeConfigData>({
    resolver: zodResolver(ThemeConfigSchema),
    defaultValues: {
      palette: "blue",
      heroTitle: "",
      heroSubtitle: "",
      heroImageUrl: "",
    },
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, "config", "theme"));
        if (snap.exists()) {
          const data = snap.data() as ThemeConfigData;
          form.reset({
            palette: data.palette || "blue",
            heroTitle: data.heroTitle || "",
            heroSubtitle: data.heroSubtitle || "",
            heroImageUrl: data.heroImageUrl || "",
          });
        }
      } catch (err) {
        console.error("Erro ao carregar configurações", err);
      }
    };
    fetchConfig();
  }, [form]);

  async function onSubmit(values: ThemeConfigData) {
    try {
      await setDoc(doc(db, "config", "theme"), values, { merge: true });
      toast({ title: "Configurações salvas" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageTitle>Personalizar Tema</PageTitle>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Paleta de Cores</CardTitle>
              <CardDescription>Escolha uma das opções disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="palette"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        className="flex flex-col gap-2"
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="blue" />
                          </FormControl>
                          <FormLabel className="!m-0">Azul</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="green" />
                          </FormControl>
                          <FormLabel className="!m-0">Verde</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="wine" />
                          </FormControl>
                          <FormLabel className="!m-0">Vinho</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Conteúdo da Home</CardTitle>
              <CardDescription>Frases e imagem exibidas na página inicial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="heroTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Principal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtítulo</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">Salvar Configurações</Button>
        </form>
      </Form>
    </div>
  );
}
