import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { TournamentProvider } from "@/context/TournamentContext";
import { WalletProvider } from "@/context/WalletContext";
import { NotificationProvider } from "@/context/NotificationContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <TournamentProvider>
        <WalletProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </WalletProvider>
      </TournamentProvider>
    </AuthProvider>
  </ThemeProvider>
);
