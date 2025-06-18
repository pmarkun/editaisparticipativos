"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useAuth } from "@/lib/auth";
import dynamic from "next/dynamic";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent } from "@/components/ui/card";

const Markdown = dynamic<any>(
  () => import("@uiw/react-md-editor").then((mod) => (mod.default as any).Markdown),
  { ssr: false }
);

interface Message { title: string; text: string; createdAt: { seconds: number } | Date; readBy: string[]; }

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    async function load() {
      const ref = doc(db, "messages", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Message;
        setMessage(data);
        if (user && !(data.readBy || []).includes(user.uid)) {
          await updateDoc(ref, { readBy: arrayUnion(user.uid) });
        }
      }
    }
    if (id) load();
  }, [id, user]);

  if (!message) return null;

  return (
    <div className="space-y-4">
      <PageTitle>{message.title}</PageTitle>
      <div className="text-sm text-muted-foreground">
        {new Date((message.createdAt as any).seconds ? (message.createdAt as any).seconds * 1000 : message.createdAt as any).toLocaleString()}
      </div>
      <Card className="p-4">
        <CardContent>
          <Markdown source={message.text} style={{ whiteSpace: "pre-wrap" }} />
        </CardContent>
      </Card>
    </div>
  );
}
