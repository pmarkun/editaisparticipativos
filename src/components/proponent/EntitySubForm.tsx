"use client";

import type { Control, UseFieldArrayRemove, FieldArrayWithId } from "react-hook-form";
import type { ProponentProfileFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface EntitySubFormProps {
  control: Control<ProponentProfileFormData>;
  index: number;
  remove: UseFieldArrayRemove;
  field: FieldArrayWithId<ProponentProfileFormData, "entities", "id">;
}

export default function EntitySubForm({ control, index, remove, field }: EntitySubFormProps) {
  return (
    <Card className="mb-6 border-dashed border-primary/50 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Entidade {index + 1}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="text-destructive hover:bg-destructive/10"
          aria-label="Remover Entidade"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name={`entities.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Entidade</FormLabel>
              <FormControl>
                <Input placeholder="Nome da sua organização" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`entities.${index}.cnpj`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input placeholder="XX.XXX.XXX/XXXX-XX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`entities.${index}.municipalCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Municipal (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Código de registro municipal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`entities.${index}.address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço da Entidade</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo da entidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`entities.${index}.responsibleName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`entities.${index}.responsibleEmail`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email do Responsável</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`entities.${index}.responsiblePhone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone do Responsável</FormLabel>
              <FormControl>
                <Input placeholder="(XX) XXXXX-XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
