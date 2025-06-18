"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "users"));
        const data: UserData[] = snap.docs.map((d) => {
          const u = d.data();
          return {
            id: d.id,
            name: u.name || "",
            email: u.email || "",
            role: u.role || "proponent",
            createdAt: u.createdAt?.toDate() || new Date(),
          };
        });
        setUsers(data);
      } catch (err) {
        console.error("Erro ao carregar usuários", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleRole(user: UserData) {
    const newRole = user.role === "admin" ? "proponent" : "admin";
    try {
      await updateDoc(doc(db, "users", user.id), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      toast({ title: "Função atualizada" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="w-full h-40" />
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role === "admin" ? "Admin" : "Proponente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => toggleRole(user)}>
                          {user.role === "admin" ? "Tornar Proponente" : "Tornar Admin"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

