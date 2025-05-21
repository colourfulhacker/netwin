import { useState, useEffect } from "react";
import { User, KycDocument } from "@/types";
import { useAuth } from "./useAuth";
import { getRequiredKycDocuments } from "@/utils/helpers";

export function useUser() {
  const { user, updateUser } = useAuth();
  const [kycDocuments, setKycDocuments] = useState<KycDocument[]>([]);
  const [squadMembers, setSquadMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      // Get KYC documents from localStorage (if any)
      const storedKycStr = localStorage.getItem('netwin_kyc');
      
      if (storedKycStr) {
        try {
          const allKycDocs = JSON.parse(storedKycStr) as Record<number, KycDocument[]>;
          setKycDocuments(allKycDocs[user.id] || []);
        } catch (error) {
          console.error("Failed to parse KYC documents", error);
          setKycDocuments([]);
        }
      }
      
      setLoading(false);
    }
  }, [user]);
  
  const updateProfile = (data: Partial<User>) => {
    if (user) {
      updateUser(data);
    }
  };
  
  const submitKycDocument = (document: Omit<KycDocument, "id" | "userId" | "status" | "createdAt">) => {
    if (!user) return false;
    
    const newDoc: KycDocument = {
      ...document,
      id: Date.now(),
      userId: user.id,
      status: "pending",
      createdAt: new Date()
    };
    
    // Store in localStorage
    const storedKycStr = localStorage.getItem('netwin_kyc');
    let allKycDocs: Record<number, KycDocument[]> = {};
    
    if (storedKycStr) {
      try {
        allKycDocs = JSON.parse(storedKycStr);
      } catch (error) {
        console.error("Failed to parse KYC documents", error);
      }
    }
    
    const userDocs = allKycDocs[user.id] || [];
    userDocs.push(newDoc);
    allKycDocs[user.id] = userDocs;
    
    localStorage.setItem('netwin_kyc', JSON.stringify(allKycDocs));
    
    // Update user KYC status if it was not submitted before
    if (user.kycStatus === "not_submitted") {
      updateUser({ kycStatus: "pending" });
    }
    
    // Update state
    setKycDocuments(prev => [...prev, newDoc]);
    
    return true;
  };
  
  const getKycStatus = () => {
    if (!user) return "not_submitted";
    return user.kycStatus;
  };
  
  const getRequiredDocuments = () => {
    if (!user) return [];
    return getRequiredKycDocuments(user.country);
  };
  
  // Update game ID
  const updateGameId = (gameId: string) => {
    if (user) {
      return updateUser({ gameId });
    }
    return false;
  };
  
  // Upload profile image
  const uploadProfileImage = async (imageData: string) => {
    if (!user) return false;
    
    try {
      // Update user profile with new image
      await updateUser({ profilePicture: imageData });
      return true;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      return false;
    }
  };
  
  const getSquadMembers = () => {
    if (!user) return [];
    const storedSquad = localStorage.getItem(`squad_${user.id}`);
    return storedSquad ? JSON.parse(storedSquad) : [];
  };

  const addSquadMember = async (username: string, gameId: string) => {
    if (!user) return false;
    try {
      const newMember = {
        id: Date.now(),
        username,
        gameId,
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
      };
      
      const currentSquad = getSquadMembers();
      const updatedSquad = [...currentSquad, newMember];
      localStorage.setItem(`squad_${user.id}`, JSON.stringify(updatedSquad));
      setSquadMembers(updatedSquad);
      return true;
    } catch (error) {
      console.error("Error adding squad member:", error);
      return false;
    }
  };

  const removeSquadMember = async (memberId: number) => {
    if (!user) return false;
    try {
      const currentSquad = getSquadMembers();
      const updatedSquad = currentSquad.filter(member => member.id !== memberId);
      localStorage.setItem(`squad_${user.id}`, JSON.stringify(updatedSquad));
      setSquadMembers(updatedSquad);
      return true;
    } catch (error) {
      console.error("Error removing squad member:", error);
      return false;
    }
  };

  return {
    profile: user,
    kycDocuments,
    loading,
    updateProfile,
    submitKycDocument,
    getKycStatus,
    getRequiredDocuments,
    updateGameId,
    uploadProfileImage,
    getSquadMembers,
    addSquadMember,
    removeSquadMember,
    squadMembers
  };
}
