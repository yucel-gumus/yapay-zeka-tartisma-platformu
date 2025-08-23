import { useState, useEffect } from 'react';

export interface Branch {
  id: string;
  name: string;
  description: string;
}

export const useBranchManagement = () => {
  const [customBranches, setCustomBranches] = useState<Branch[]>([]);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDescription, setNewBranchDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Load custom branches from localStorage on component mount
  useEffect(() => {
    const savedBranches = localStorage.getItem('customBranches');
    if (savedBranches) {
      setCustomBranches(JSON.parse(savedBranches));
    }
  }, []);

  const generateBranchId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\p{L}0-9\s]/gu, '') 
      .replace(/\s+/g, '-')           
      .substring(0, 50);         
  };
  

  const generateDescription = async () => {
    if (!newBranchName.trim()) return;
    
    setIsGeneratingDescription(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newBranchName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setNewBranchDescription(data.description);
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const addCustomBranch = () => {
    if (!newBranchName.trim() || !newBranchDescription.trim()) return;
    
    let updatedCustomBranches;
    
    if (editingBranch) {
      // Edit existing branch
      updatedCustomBranches = customBranches.map(branch => 
        branch.id === editingBranch.id 
          ? { ...branch, name: newBranchName.trim(), description: newBranchDescription.trim() }
          : branch
      );
      setEditingBranch(null);
    } else {
      // Add new branch
      const newBranch: Branch = {
        id: generateBranchId(newBranchName),
        name: newBranchName.trim(),
        description: newBranchDescription.trim()
      };
      updatedCustomBranches = [...customBranches, newBranch];
    }
    
    setCustomBranches(updatedCustomBranches);
    localStorage.setItem('customBranches', JSON.stringify(updatedCustomBranches));
    
    // Reset form
    setNewBranchName('');
    setNewBranchDescription('');
    setShowAddBranchModal(false);
  };

  const closeAddBranchModal = () => {
    setShowAddBranchModal(false);
    setNewBranchName('');
    setNewBranchDescription('');
    setEditingBranch(null);
  };

  const editBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setNewBranchName(branch.name);
    setNewBranchDescription(branch.description);
    setShowAddBranchModal(true);
  };

  const deleteBranch = (branchId: string) => {
    const updatedCustomBranches = customBranches.filter(branch => branch.id !== branchId);
    setCustomBranches(updatedCustomBranches);
    localStorage.setItem('customBranches', JSON.stringify(updatedCustomBranches));
  };

  return {
    customBranches,
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
    deleteBranch
  };
};
