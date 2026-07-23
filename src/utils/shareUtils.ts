import { SharedDebateData } from '@/types/debate';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export type { SharedDebateData };

export const generateShortId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const saveDebateToFirebase = async (data: SharedDebateData): Promise<string> => {
  try {
    const shortId = generateShortId();
    
    await addDoc(collection(db, 'debates'), {
      id: shortId,
      ...data,
      createdAt: new Date().toISOString()
    });
    
    return shortId;
  } catch {
    throw new Error('Tartışma kaydedilemedi');
  }
};

export const loadDebateFromFirebase = async (debateId: string): Promise<SharedDebateData | null> => {
  try {
    const debatesRef = collection(db, 'debates');
    const querySnapshot = await getDocs(query(debatesRef, where('id', '==', debateId)));
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0].data();
    return {
      topic: docData.topic,
      chatHistory: docData.chatHistory,
      selectedBranches: docData.selectedBranches,
      branchDetails: docData.branchDetails,
      finalVerdict: docData.finalVerdict,
      timestamp: docData.timestamp
    };
  } catch {
    return null;
  }
};

export const generateShareableLink = async (data: SharedDebateData): Promise<string> => {
  try {
    const debateId = await saveDebateToFirebase(data);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/d/${debateId}`;
  } catch {
    return '';
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
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
