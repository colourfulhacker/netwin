import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Auth Pages
import Login from "@/pages/auth/Login";
import OtpVerify from "@/pages/auth/OtpVerify";
import Signup from "@/pages/auth/Signup";

// User Pages
import Home from "@/pages/dashboard/Home";
import Tournaments from "@/pages/tournaments/Tournaments";
import TournamentDetails from "@/pages/tournaments/TournamentDetails";
import MyMatches from "@/pages/matches/MyMatches";
import MatchDetail from "@/pages/matches/MatchDetail";
import Leaderboard from "@/pages/leaderboard/Leaderboard";
import Wallet from "@/pages/wallet/Wallet";
import Profile from "@/pages/profile/Profile";
import KycVerification from "@/pages/profile/KycVerification";
import Squad from "@/pages/squad/Squad";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageTournaments from "@/pages/admin/ManageTournaments";
import ManageUsers from "@/pages/admin/ManageUsers";
import ReviewMatches from "@/pages/admin/ReviewMatches";
import KycRequests from "@/pages/admin/KycRequests";

// Error Page
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, user, loading } = useAuth();

  // If loading auth state, return nothing (or a loader)
  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-dark">Loading...</div>;
  }

  // Auth routes (when not authenticated)
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-otp" component={OtpVerify} />
        <Route component={Login} />
      </Switch>
    );
  }

  // Admin routes
  if (user?.role === "admin") {
    return (
      <AdminLayout>
        <Switch>
          <Route path="/" component={AdminDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/tournaments" component={ManageTournaments} />
          <Route path="/admin/users" component={ManageUsers} />
          <Route path="/admin/matches" component={ReviewMatches} />
          <Route path="/admin/kyc" component={KycRequests} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    );
  }

  // User routes (when authenticated)
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tournaments" component={Tournaments} />
        <Route path="/tournament/:id" component={TournamentDetails} />
        <Route path="/matches" component={MyMatches} />
        <Route path="/match/:id" component={MatchDetail} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/profile" component={Profile} />
        <Route path="/kyc" component={KycVerification} />
        <Route path="/squad" component={Squad} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
