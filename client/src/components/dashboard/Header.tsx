import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationCenter from "@/components/common/NotificationCenter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, Bell, LogOut, User, Wallet, Settings } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const Header = () => {
  const { user, logout } = useAuth();
  const { unreadCount, getNotifications } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const handleNotificationsClick = () => {
    if (user) {
      getNotifications(user.id);
      setNotificationsOpen(true);
    }
  };

  return (
    <header className="bg-dark-card bg-opacity-90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="text-2xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent mr-2">NETWIN</a>
            </Link>
            <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded font-mono text-gray-300">v1.0</span>
          </div>
          
          {/* Search - Show on desktop only */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search tournaments..." 
                className="w-full bg-dark-lighter rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary border-0"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Wallet */}
            {user && (
              <div className="gradient-border hidden sm:block">
                <Link href="/wallet">
                  <a className="flex items-center gap-2 bg-dark-card px-3 py-1.5 rounded-lg cursor-pointer">
                    <Wallet className="h-4 w-4 text-accent" />
                    <span className="font-medium text-white">
                      {formatCurrency(user.walletBalance, user.currency)}
                    </span>
                  </a>
                </Link>
              </div>
            )}
            
            {/* Notifications */}
            {user && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="p-2 text-gray-300 hover:text-white relative"
                  onClick={handleNotificationsClick}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            )}
            
            {/* User Avatar with Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarImage src={user.profilePicture} alt={user.username} />
                      <AvatarFallback className="bg-primary/20 text-primary-foreground">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-dark-card border border-gray-800" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-gray-400">{user.countryCode} {user.phoneNumber}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer hover:bg-dark-lighter">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/wallet">
                    <DropdownMenuItem className="cursor-pointer hover:bg-dark-lighter">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="cursor-pointer hover:bg-dark-lighter">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-dark-lighter text-red-500 focus:text-red-500"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Notifications Panel */}
      <NotificationCenter 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </header>
  );
};

export default Header;
