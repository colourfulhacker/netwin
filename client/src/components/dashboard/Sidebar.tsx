import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import GameModeSelector from "@/components/common/GameModeSelector";
import { 
  Home, Trophy, Users, Calendar, Wallet,
  BarChart2, User, HelpCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_CODES } from "@/utils/constants";

const Sidebar = () => {
  const [location] = useLocation();
  const { user, updateUser } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleCurrencyChange = (value: string) => {
    if (user) {
      updateUser({ currency: value as "INR" | "NGN" | "USD" });
    }
  };

  return (
    <aside className="hidden md:block w-56 bg-dark-card border-r border-gray-800 h-[calc(100vh-4rem)] fixed top-16 overflow-y-auto custom-scrollbar">
      <nav className="p-3">
        <ul className="space-y-1">
          <li>
            <Link href="/">
              <a className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive("/") ? "bg-primary bg-opacity-20 text-white" : "text-gray-300 hover:text-white hover:bg-dark-lighter"}`}>
                <Home className="h-5 w-5" />
                <span>Home</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/tournaments">
              <a className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive("/tournaments") ? "bg-primary bg-opacity-20 text-white" : "text-gray-300 hover:text-white hover:bg-dark-lighter"}`}>
                <Trophy className="h-5 w-5" />
                <span>Tournaments</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/squad">
              <a className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive("/squad") ? "bg-primary bg-opacity-20 text-white" : "text-gray-300 hover:text-white hover:bg-dark-lighter"}`}>
                <Users className="h-5 w-5" />
                <span>My Squad</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/matches">
              <a className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive("/matches") ? "bg-primary bg-opacity-20 text-white" : "text-gray-300 hover:text-white hover:bg-dark-lighter"}`}>
                <Calendar className="h-5 w-5" />
                <span>My Matches</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/wallet">
              <a className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive("/wallet") ? "bg-primary bg-opacity-20 text-white" : "text-gray-300 hover:text-white hover:bg-dark-lighter"}`}>
                <Wallet className="h-5 w-5" />
                <span>Wallet</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/leaderboard">
              <a className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive("/leaderboard") ? "bg-primary bg-opacity-20 text-white" : "text-gray-300 hover:text-white hover:bg-dark-lighter"}`}>
                <BarChart2 className="h-5 w-5" />
                <span>Leaderboard</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/profile">
              <a className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive("/profile") ? "bg-primary bg-opacity-20 text-white" : "text-gray-300 hover:text-white hover:bg-dark-lighter"}`}>
                <User className="h-5 w-5" />
                <span>Profile</span>
              </a>
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-dark-lighter px-3 py-2 rounded-lg transition">
              <HelpCircle className="h-5 w-5" />
              <span>Support</span>
            </a>
          </li>
        </ul>
        
        {/* Game Selection */}
        <div className="mt-6 px-3">
          <label className="block text-sm text-gray-400 mb-2">Game</label>
          <GameModeSelector />
        </div>
        
        {/* Currency Selection */}
        <div className="mt-4 px-3">
          <label className="block text-sm text-gray-400 mb-2">Currency</label>
          <Select
            value={user?.currency}
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger className="w-full bg-dark-lighter text-white border-0 focus:ring-2 focus:ring-primary">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="bg-dark-lighter text-white border-gray-700">
              {COUNTRY_CODES.filter(c => ["INR", "NGN", "USD"].includes(c.currency)).map((country) => (
                <SelectItem 
                  key={country.currency} 
                  value={country.currency}
                  className="hover:bg-gray-700"
                >
                  {country.currency} ({country.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
