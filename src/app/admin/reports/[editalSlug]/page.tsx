import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase/client";
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from "firebase/firestore";
import VotesReportTable, { ProjectReportData } from "@/components/admin/VotesReportTable";
import { getEditalIdFromSlug } from "@/lib/slug-helpers";

export default async function EditalReportPage({ params }: { params: { editalSlug: string } }) {
  const { editalSlug } = params;
  const editalId = await getEditalIdFromSlug(editalSlug);

  if (!editalId) {
    return <div className="text-center">Edital não encontrado.</div>;
  }

  const editalRef = doc(db, "editais", editalId);
  const editalSnap = await getDoc(editalRef);
  if (!editalSnap.exists()) {
    return <div className="text-center">Edital não encontrado.</div>;
  }
  const editalData = editalSnap.data();
  const editalName = editalData.name || "Edital";
  const votingStartDate = editalData.votingStartDate instanceof Timestamp ? editalData.votingStartDate.toDate() : new Date();

  const votesQuery = query(collection(db, "votes"), where("editalId", "==", editalId));
  const votesSnap = await getDocs(votesQuery);
  const votes = votesSnap.docs.map((d) => {
    const data = d.data();
    return {
      projectId: data.projectId as string,
      votedAt: data.votedAt instanceof Timestamp ? data.votedAt.toDate() : new Date(),
    };
  });

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const totalVotes = votes.length;
  const votesLastHour = votes.filter((v) => v.votedAt >= oneHourAgo).length;
  const votesLast24Hours = votes.filter((v) => v.votedAt >= twentyFourHoursAgo).length;

  const hoursElapsed = Math.max((now.getTime() - votingStartDate.getTime()) / (1000 * 60 * 60), 1);
  const daysElapsed = Math.max((now.getTime() - votingStartDate.getTime()) / (1000 * 60 * 60 * 24), 1);

  const avgPerHour = totalVotes / hoursElapsed;
  const avgPerDay = totalVotes / daysElapsed;

  const projectsQuery = query(collection(db, "projects"), where("editalId", "==", editalId));
  const projectsSnap = await getDocs(projectsQuery);
  const projectStats: ProjectReportData[] = projectsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      projectName: data.projectName || "Projeto",
      votesLastHour: 0,
      votesLast24Hours: 0,
      totalVotes: 0,
    };
  });
  const projectIds = projectsSnap.docs.map((d) => d.id);
  const statsMap: Record<string, ProjectReportData> = {};
  projectIds.forEach((id, index) => {
    statsMap[id] = projectStats[index];
  });

  votes.forEach((vote) => {
    const stat = statsMap[vote.projectId];
    if (stat) {
      stat.totalVotes += 1;
      if (vote.votedAt >= oneHourAgo) stat.votesLastHour += 1;
      if (vote.votedAt >= twentyFourHoursAgo) stat.votesLast24Hours += 1;
    }
  });

  return (
    <div className="space-y-6">
      <PageTitle>Relatório: {editalName}</PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Total de votos: <strong>{totalVotes}</strong></p>
          <p>Votos na última hora: <strong>{votesLastHour}</strong></p>
          <p>Votos nas últimas 24 horas: <strong>{votesLast24Hours}</strong></p>
          <p>Média por hora: <strong>{avgPerHour.toFixed(2)}</strong></p>
          <p>Média por dia: <strong>{avgPerDay.toFixed(2)}</strong></p>
        </CardContent>
      </Card>
      <VotesReportTable data={projectStats} />
    </div>
  );
}

