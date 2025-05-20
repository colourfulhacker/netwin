import { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Layers, Users, TrophyIcon, ClipboardCheck, 
  FileText, Bell, Settings, LogOut 
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-gray-800 min-h-screen fixed z-30">
        <div className="p-4 flex items-center border-b border-gray-800">
          <div className="text-2xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent mr-2">NETWIN</div>
          <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded font-mono text-gray-300">Admin</span>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/admin">
                <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin") || isActive("/") ? "bg-primary bg-opacity-20 text-white" : "text-gray-400 hover:bg-dark-lighter hover:text-white"}`}>
                  <Layers size={18} />
                  <span>Dashboard</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/admin/tournaments">
                <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/tournaments") ? "bg-primary bg-opacity-20 text-white" : "text-gray-400 hover:bg-dark-lighter hover:text-white"}`}>
                  <TrophyIcon size={18} />
                  <span>Tournaments</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/admin/users">
                <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/users") ? "bg-primary bg-opacity-20 text-white" : "text-gray-400 hover:bg-dark-lighter hover:text-white"}`}>
                  <Users size={18} />
                  <span>Users</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/admin/matches">
                <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/matches") ? "bg-primary bg-opacity-20 text-white" : "text-gray-400 hover:bg-dark-lighter hover:text-white"}`}>
                  <ClipboardCheck size={18} />
                  <span>Match Results</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/admin/kyc">
                <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/kyc") ? "bg-primary bg-opacity-20 text-white" : "text-gray-400 hover:bg-dark-lighter hover:text-white"}`}>
                  <FileText size={18} />
                  <span>KYC Requests</span>
                </a>
              </Link>
            </li>
          </ul>
          
          <div className="mt-8 border-t border-gray-800 pt-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-lighter hover:text-white transition">
                  <Bell size={18} />
                  <span>Notifications</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-lighter hover:text-white transition">
                  <Settings size={18} />
                  <span>Settings</span>
                </a>
              </li>
              <li>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900 hover:bg-opacity-20 hover:text-red-500 transition"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Admin Header */}
        <header className="bg-dark-card bg-opacity-90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold">{location === "/admin" || location === "/" ? "Admin Dashboard" : 
              location === "/admin/tournaments" ? "Manage Tournaments" : 
              location === "/admin/users" ? "Manage Users" :
              location === "/admin/matches" ? "Review Matches" :
              location === "/admin/kyc" ? "KYC Verification" : ""}</h1>
              
              {/* Admin Profile */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">{user?.username}</span>
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarImage src={user?.profilePicture} alt={user?.username} />
                  <AvatarFallback className="bg-primary/20 text-primary-foreground">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>
        
        {/* Admin Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
