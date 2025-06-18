"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export interface ProjectReportData {
  projectName: string;
  votesLastHour: number;
  votesLast24Hours: number;
  totalVotes: number;
}

interface VotesReportTableProps {
  data: ProjectReportData[];
}

export default function VotesReportTable({ data }: VotesReportTableProps) {
  const handleExport = () => {
    const headers = ["Projeto", "Última Hora", "Últimas 24h", "Total de Votos"];
    const rows = data.map((p) => [p.projectName, p.votesLastHour, p.votesLast24Hours, p.totalVotes]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "votos_projetos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleExport}>Exportar CSV</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projeto</TableHead>
            <TableHead className="text-right">Última Hora</TableHead>
            <TableHead className="text-right">Últimas 24h</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((proj) => (
            <TableRow key={proj.projectName}>
              <TableCell>{proj.projectName}</TableCell>
              <TableCell className="text-right">{proj.votesLastHour}</TableCell>
              <TableCell className="text-right">{proj.votesLast24Hours}</TableCell>
              <TableCell className="text-right">{proj.totalVotes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Estatísticas de votos por projeto.</TableCaption>
      </Table>
    </div>
  );
}

