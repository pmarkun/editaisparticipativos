import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/firebase/client";

/**
 * Converte um título em slug
 */
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .trim()
    .replace(/^-+|-+$/g, ""); // Remove hífens do início e fim
}

/**
 * Encontra o ID do edital a partir do slug
 */
export async function getEditalIdFromSlug(slug: string): Promise<string | null> {
  try {
    const editaisCollection = collection(db, "editais");
    const q = query(editaisCollection, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.id;
    }
    
    return null;
  } catch (error) {
    console.error("Error finding edital by slug:", error);
    return null;
  }
}

/**
 * Encontra o slug do edital a partir do ID
 */
export async function getEditalSlugFromId(editalId: string): Promise<string | null> {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const editalRef = doc(db, "editais", editalId);
    const editalSnap = await getDoc(editalRef);
    
    if (editalSnap.exists()) {
      const data = editalSnap.data();
      return data.slug || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error finding edital slug by ID:", error);
    return null;
  }
}