"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useToast } from "@/hooks/use-toast";

const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false });

const MessageSchema = z.object({
  title: z.string().min(3, "Título é obrigatório."),
  emails: z.string().optional(),
  text: z.string().min(5, "Texto é obrigatório."),
  sendEmail: z.boolean().optional(),
});

export type MessageFormData = z.infer<typeof MessageSchema>;

export default function MessageCreateForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<MessageFormData>({
    resolver: zodResolver(MessageSchema),
    defaultValues: { title: "", emails: "", text: "", sendEmail: false },
  });

  async function onSubmit(data: MessageFormData) {
    setIsLoading(true);
    try {
      let recipients: string[] = [];
      if (data.emails && data.emails.trim().length > 0) {
        const emailList = data.emails.split(/[,\n]+/).map((e) => e.trim()).filter(Boolean);
        const q = query(collection(db, "users"), where("email", "in", emailList));
        const snap = await getDocs(q);
        recipients = snap.docs.map((d) => d.id);
      } else {
        const q = query(collection(db, "users"), where("role", "==", "proponent"));
        const snap = await getDocs(q);
        recipients = snap.docs.map((d) => d.id);
      }

      await addDoc(collection(db, "messages"), {
        title: data.title,
        text: data.text,
        createdAt: new Date(),
        recipients,
        readBy: [],
      });

      if (data.sendEmail) {
        try {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails: data.emails, title: data.title, text: data.text }),
          });
        } catch (e) {
          console.error("Erro ao enviar email", e);
        }
      }

      toast({ title: "Mensagem enviada" });
      form.reset();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Nova Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da mensagem" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emails dos destinatários (deixe vazio para todos)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="email1@example.com, email2@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto</FormLabel>
                    <FormControl>
                      <MDEditor {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} id="sendEmail" />
                    </FormControl>
                    <FormLabel htmlFor="sendEmail">Enviar também por email</FormLabel>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
