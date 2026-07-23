export interface Branch {
  id: string;
  name: string;
  description: string;
}

export interface ChatMessageType {
  role: 'user' | 'assistant' | 'judge';
  content: string;
  branch?: string;
  branchName?: string;
}

export interface SharedDebateData {
  topic: string;
  chatHistory: ChatMessageType[];
  selectedBranches: string[];
  branchDetails: Branch[];
  finalVerdict: string;
  timestamp: number;
}
