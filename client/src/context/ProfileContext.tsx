import { createContext, useState, useCallback, ReactNode } from "react";
import { User, KycDocument } from "@/types";
import { getRequiredKycDocuments } from "@/utils/helpers";

interface ProfileContextType {
  profile: User | null;
  kycDocuments: KycDocument[];
  loading: boolean;
  updateProfile: (data: Partial<User>) => void;
  submitKycDocument: (document: Omit<KycDocument, "id" | "createdAt" | "userId">) => boolean;
  getKycStatus: () => string;
  getRequiredDocuments: () => Array<{ type: string, name: string, required: boolean }>;
}

export const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  kycDocuments: [],
  loading: false,
  updateProfile: () => {},
  submitKycDocument: () => false,
  getKycStatus: () => "not_submitted",
  getRequiredDocuments: () => []
});

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [kycDocuments, setKycDocuments] = useState<KycDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const updateProfile = useCallback((data: Partial<User>) => {
    setProfile(prev => {
      if (!prev) return null;
      return { ...prev, ...data };
    });
  }, []);
  
  const submitKycDocument = useCallback((document: Omit<KycDocument, "id" | "createdAt" | "userId">): boolean => {
    if (!profile) return false;
    
    try {
      setLoading(true);
      
      // Create a new KYC document
      const newDocument: KycDocument = {
        ...document,
        id: kycDocuments.length + 1,
        userId: profile.id,
        status: "pending",
        rejectionReason: null,
        createdAt: new Date()
      };
      
      setKycDocuments(prev => [...prev, newDocument]);
      
      // Update user KYC status
      updateProfile({ kycStatus: "pending" });
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error submitting KYC document:", error);
      setLoading(false);
      return false;
    }
  }, [profile, kycDocuments, updateProfile]);
  
  const getKycStatus = useCallback((): string => {
    return profile?.kycStatus || "not_submitted";
  }, [profile]);
  
  const getRequiredDocuments = useCallback(() => {
    if (!profile) return [];
    return getRequiredKycDocuments(profile.country);
  }, [profile]);
  
  return (
    <ProfileContext.Provider
      value={{
        profile,
        kycDocuments,
        loading,
        updateProfile,
        submitKycDocument,
        getKycStatus,
        getRequiredDocuments
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};