import { SharedDebateData } from "@/types/debate";
import { parseSharedDebate } from "@/lib/debateState";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";

export type { SharedDebateData };

export const generateShortId = (): string => crypto.randomUUID();

export const saveDebateToFirebase = async (
  data: SharedDebateData,
  debateId = generateShortId(),
): Promise<string> => {
  const ref = doc(db, "debates", debateId);
  try {
    await setDoc(ref, {
      id: debateId,
      ...data,
      createdAt: new Date().toISOString(),
    });
    return debateId;
  } catch (error) {
    // firestore.rules is create-only. A retry after a write that already landed
    // is denied; confirm the document exists and treat it as saved.
    try {
      if (
        (error as { code?: string })?.code === "permission-denied" &&
        (await getDoc(ref)).exists()
      )
        return debateId;
    } catch {
      /* Fall through to the generic save error. */
    }
    throw new Error("Tartışma kaydedilemedi");
  }
};

export const loadDebateFromFirebase = async (
  debateId: string,
): Promise<SharedDebateData | null> => {
  try {
    const debatesRef = collection(db, "debates");
    const directDoc = await getDoc(doc(db, "debates", debateId));
    const querySnapshot = directDoc.exists()
      ? null
      : await getDocs(query(debatesRef, where("id", "==", debateId), limit(1)));

    if (!directDoc.exists() && (!querySnapshot || querySnapshot.empty)) {
      return null;
    }

    const docData = directDoc.exists()
      ? directDoc.data()
      : querySnapshot!.docs[0].data();
    return parseSharedDebate(docData);
  } catch {
    throw new Error(
      "Tartışma yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.",
    );
  }
};

export const generateShareableLink = async (
  data: SharedDebateData,
  id?: string,
): Promise<string> => {
  try {
    const debateId = await saveDebateToFirebase(data, id);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/d/${debateId}`;
  } catch {
    throw new Error(
      "Paylaşım bağlantısı oluşturulamadı. Bağlantınızı kontrol edip yeniden deneyin.",
    );
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
