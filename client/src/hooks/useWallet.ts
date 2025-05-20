import { useContext } from "react";
import { WalletContext } from "@/context/WalletContext";

export function useWallet() {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  
  return context;
}
