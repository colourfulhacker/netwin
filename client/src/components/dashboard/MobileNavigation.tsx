import { useLocation, Link } from "wouter";
import { Home, Trophy, Wallet, User } from "lucide-react";

const MobileNavigation = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gray-800 z-50">
      <div className="flex justify-between">
        <Link href="/">
          <a className={`flex-1 py-3 px-2 text-center ${isActive("/") ? "text-white nav-active" : "text-gray-400 hover:text-white"} relative`}>
            <Home className="h-5 w-5 block mx-auto" />
            <span className="text-xs">Home</span>
            <div className="nav-indicator"></div>
          </a>
        </Link>
        <Link href="/tournaments">
          <a className={`flex-1 py-3 px-2 text-center ${isActive("/tournaments") ? "text-white nav-active" : "text-gray-400 hover:text-white"} relative`}>
            <Trophy className="h-5 w-5 block mx-auto" />
            <span className="text-xs">Tournaments</span>
            <div className="nav-indicator"></div>
          </a>
        </Link>
        <Link href="/wallet">
          <a className={`flex-1 py-3 px-2 text-center ${isActive("/wallet") ? "text-white nav-active" : "text-gray-400 hover:text-white"} relative`}>
            <Wallet className="h-5 w-5 block mx-auto" />
            <span className="text-xs">Wallet</span>
            <div className="nav-indicator"></div>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex-1 py-3 px-2 text-center ${isActive("/profile") ? "text-white nav-active" : "text-gray-400 hover:text-white"} relative`}>
            <User className="h-5 w-5 block mx-auto" />
            <span className="text-xs">Profile</span>
            <div className="nav-indicator"></div>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;
