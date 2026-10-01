import { SharedDebateData } from "@/types/debate";
import { parseJudgeReport } from "@/lib/debateProtocol";
import { restoreDebateRounds } from "@/lib/debateSchedule";
import { parseDebateFrame } from "@/lib/debateFrame";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export type { SharedDebateData };

export const generateShortId = (): string => crypto.randomUUID();

export const saveDebateToFirebase = async (
  data: SharedDebateData,
  debateId = generateShortId(),
): Promise<string> => {
  try {
    const shortId = debateId;

    await setDoc(doc(db, "debates", shortId), {
      id: shortId,
      ...data,
      createdAt: new Date().toISOString(),
    });

    return shortId;
  } catch {
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
      : await getDocs(query(debatesRef, where("id", "==", debateId)));

    if (!directDoc.exists() && (!querySnapshot || querySnapshot.empty)) {
      return null;
    }

    const docData = directDoc.exists()
      ? directDoc.data()
      : querySnapshot!.docs[0].data();
    return {
      debateFrame: parseDebateFrame(docData.debateFrame),
      roundsPerExpert: restoreDebateRounds(docData.roundsPerExpert, docData.selectedBranches?.length || 0, true),
      sources: docData.sources || "",
      branchRoles: docData.branchRoles || {},
      judgeReport: parseJudgeReport(docData.judgeReport),
      topic: docData.topic,
      chatHistory: docData.chatHistory,
      selectedBranches: docData.selectedBranches,
      branchDetails: docData.branchDetails,
      finalVerdict: docData.finalVerdict,
      timestamp: docData.timestamp,
    };
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
