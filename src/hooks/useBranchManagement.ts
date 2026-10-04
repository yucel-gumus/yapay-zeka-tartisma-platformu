import { useState, useEffect } from "react";
import { Branch } from "@/types/debate";
import { STORAGE_KEYS } from "@/config/constants";
import { parseBranches } from "@/lib/debateState";

export type { Branch };

export const useBranchManagement = () => {
  const [error, setError] = useState("");
  const [customBranches, setCustomBranches] = useState<Branch[]>([]);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchDescription, setNewBranchDescription] = useState("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_BRANCHES);
      const parsed = saved ? parseBranches(JSON.parse(saved)) : null;
      if (parsed) setCustomBranches(parsed);
    } catch {
      setError(
        "Kayıtlı uzmanlar okunamadı. Yeni bir uzman oluşturabilirsiniz.",
      );
    }
  }, []);

  const generateBranchId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\p{L}0-9\s]/gu, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  };

  const generateDescription = async () => {
    if (!newBranchName.trim()) return;

    setError("");
    setIsGeneratingDescription(true);
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newBranchName }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewBranchDescription(data.description);
      } else {
        const data = await response.json().catch(() => null);
        setError(
          data?.error || "Açıklama alınamadı. Yeniden deneyebilirsiniz.",
        );
      }
    } catch {
      setError("Açıklama hizmetine ulaşılamadı. Yeniden deneyebilirsiniz.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const addCustomBranch = () => {
    if (!newBranchName.trim() || !newBranchDescription.trim()) return;

    let updatedCustomBranches: Branch[];

    if (editingBranch) {
      updatedCustomBranches = customBranches.map((branch) =>
        branch.id === editingBranch.id
          ? {
              ...branch,
              name: newBranchName.trim(),
              description: newBranchDescription.trim(),
            }
          : branch,
      );
      setEditingBranch(null);
    } else {
      const newBranch: Branch = {
        id: `${generateBranchId(newBranchName)}-${crypto.randomUUID()}`,
        name: newBranchName.trim(),
        description: newBranchDescription.trim(),
      };
      updatedCustomBranches = [...customBranches, newBranch];
    }

    setCustomBranches(updatedCustomBranches);
    try {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_BRANCHES,
        JSON.stringify(updatedCustomBranches),
      );
    } catch {
      setError("Uzmanlar tarayıcıya kaydedilemedi.");
    }

    setNewBranchName("");
    setNewBranchDescription("");
    setShowAddBranchModal(false);
  };

  const closeAddBranchModal = () => {
    setShowAddBranchModal(false);
    setNewBranchName("");
    setNewBranchDescription("");
    setEditingBranch(null);
  };

  const editBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setNewBranchName(branch.name);
    setNewBranchDescription(branch.description);
    setShowAddBranchModal(true);
  };

  const deleteBranch = (branchId: string) => {
    const updatedCustomBranches = customBranches.filter(
      (branch) => branch.id !== branchId,
    );
    setCustomBranches(updatedCustomBranches);
    try {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_BRANCHES,
        JSON.stringify(updatedCustomBranches),
      );
    } catch {
      setError("Uzmanlar tarayıcıya kaydedilemedi.");
    }
  };

  return {
    customBranches,
    error,
    showAddBranchModal,
    setShowAddBranchModal,
    newBranchName,
    setNewBranchName,
    newBranchDescription,
    setNewBranchDescription,
    isGeneratingDescription,
    editingBranch,
    generateDescription,
    addCustomBranch,
    closeAddBranchModal,
    editBranch,
    deleteBranch,
  };
};
