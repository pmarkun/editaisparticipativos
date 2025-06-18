import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import EditalCreateForm from "@/components/admin/EditalCreateForm";
import { EditalCreateFormData } from "@/lib/schemas";
import { redirect } from "next/navigation";

interface EditalEditPageProps {
  params: Promise<{ id: string }>;
}

async function getEditalData(id: string): Promise<EditalCreateFormData | null> {
  try {
    const editalRef = doc(db, "editais", id);
    const editalSnap = await getDoc(editalRef);

    if (!editalSnap.exists()) {
      return null;
    }

    const data = editalSnap.data();
    
    return {
      name: data.name || "",
      description: data.description || "",
      detailedDescription: data.detailedDescription || "",
      imageUrl: data.imageUrl || "",
      subscriptionStartDate: data.subscriptionStartDate instanceof Timestamp 
        ? data.subscriptionStartDate.toDate() 
        : data.subscriptionStartDate || new Date(),
      subscriptionEndDate: data.subscriptionEndDate instanceof Timestamp 
        ? data.subscriptionEndDate.toDate() 
        : data.subscriptionEndDate || new Date(),
      votingStartDate: data.votingStartDate instanceof Timestamp 
        ? data.votingStartDate.toDate() 
        : data.votingStartDate || new Date(),
      votingEndDate: data.votingEndDate instanceof Timestamp 
        ? data.votingEndDate.toDate() 
        : data.votingEndDate || new Date(),
    };
  } catch (error) {
    console.error("Error fetching edital data:", error);
    return null;
  }
}

export default async function EditalEditPage({ params }: EditalEditPageProps) {
  const resolvedParams = await params;
  const editalId = resolvedParams.id;

  const editalData = await getEditalData(editalId);

  if (!editalData) {
    redirect("/admin/editais");
  }

  return (
    <div>
      <EditalCreateForm
        editalId={editalId}
        initialData={editalData}
        onSuccess={() => {
          // This will be handled on the client side
          // The form component will redirect after successful update
        }}
      />
    </div>
  );
}