"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, PlusCircle } from "lucide-react";

interface Message {
  id: string;
  title: string;
  createdAt: { seconds: number } | Date;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Message[]);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "messages", id));
    setMessages((msgs) => msgs.filter((m) => m.id !== id));
    toast({ title: "Mensagem apagada" });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mensagens</h2>
        <Button asChild>
          <Link href="/admin/messages/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Mensagem
          </Link>
        </Button>
      </div>
      {messages.map((m) => (
        <Card key={m.id} className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{m.title}</CardTitle>
            <Button variant="ghost" onClick={() => handleDelete(m.id)} size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {new Date((m.createdAt as any).seconds ? (m.createdAt as any).seconds * 1000 : m.createdAt as any).toLocaleString()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
