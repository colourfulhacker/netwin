import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ReviewMatches() {
  const { user } = useAuth();
  
  if (!user || user.role !== "admin") {
    return (
      <div className="container py-10 text-center">
        <div className="max-w-md mx-auto p-6 bg-dark-card rounded-xl border border-gray-800">
          <h2 className="text-xl font-medium mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You don't have permission to access this page.
          </p>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins">
          Review Match Results
        </h1>
        <p className="text-gray-400 mt-1">
          Verify and approve match results submitted by players
        </p>
      </div>
      
      <div className="bg-dark-card border border-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-lg font-medium mb-4">Match Review Coming Soon</h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          This feature is currently under development. Check back soon for the ability
          to review submitted match results.
        </p>
        <Button asChild>
          <Link href="/admin">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}