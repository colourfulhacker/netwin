import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Trophy,
  Users,
  ShieldCheck,
  FileCheck,
  DollarSign,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  
  if (!user || user.role !== "admin") {
    return (
      <div className="container py-10 text-center">
        <div className="max-w-md mx-auto p-6 bg-dark-card rounded-xl border border-gray-800">
          <h2 className="text-xl font-medium mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You don't have permission to access the admin dashboard.
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
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Manage tournaments, users, and platform settings
        </p>
      </div>
      
      <Tabs
        defaultValue="overview"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Tournament Stats */}
            <Card className="bg-dark-card border-gray-800 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-full mr-3">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Active Tournaments</div>
                  <div className="text-2xl font-semibold">24</div>
                </div>
              </div>
              <Button variant="ghost" asChild className="w-full justify-between hover:bg-primary/10">
                <Link href="/admin/tournaments">
                  <span>Manage Tournaments</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
            
            {/* User Stats */}
            <Card className="bg-dark-card border-gray-800 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500/20 flex items-center justify-center rounded-full mr-3">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Registered Users</div>
                  <div className="text-2xl font-semibold">2,548</div>
                </div>
              </div>
              <Button variant="ghost" asChild className="w-full justify-between hover:bg-blue-500/10">
                <Link href="/admin/users">
                  <span>Manage Users</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
            
            {/* KYC Stats */}
            <Card className="bg-dark-card border-gray-800 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-500/20 flex items-center justify-center rounded-full mr-3">
                  <ShieldCheck className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Pending KYC</div>
                  <div className="text-2xl font-semibold">17</div>
                </div>
              </div>
              <Button variant="ghost" asChild className="w-full justify-between hover:bg-yellow-500/10">
                <Link href="/admin/kyc">
                  <span>Review KYC</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
            
            {/* Match Stats */}
            <Card className="bg-dark-card border-gray-800 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center rounded-full mr-3">
                  <FileCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Pending Results</div>
                  <div className="text-2xl font-semibold">8</div>
                </div>
              </div>
              <Button variant="ghost" asChild className="w-full justify-between hover:bg-green-500/10">
                <Link href="/admin/matches">
                  <span>Review Matches</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-dark-card border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full mr-3 mt-0.5">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">New Tournament Created</div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      "PUBG Mobile Pro Series" tournament was created
                    </div>
                    <div className="text-xs text-gray-500 mt-1">10 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-500/20 flex items-center justify-center rounded-full mr-3 mt-0.5">
                    <UserCheck className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">KYC Approved</div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      Approved KYC verification for user "ProSniper"
                    </div>
                    <div className="text-xs text-gray-500 mt-1">25 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full mr-3 mt-0.5">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">Match Results Verified</div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      Verified results for "BGMI Weekly Cup #12"
                    </div>
                    <div className="text-xs text-gray-500 mt-1">42 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-red-500/20 flex items-center justify-center rounded-full mr-3 mt-0.5">
                    <Clock className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <div className="font-medium">Tournament Rescheduled</div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      Rescheduled "PUBG Squads Challenge" to tomorrow
                    </div>
                    <div className="text-xs text-gray-500 mt-1">1 hour ago</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Financial Overview */}
            <Card className="bg-dark-card border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500/20 flex items-center justify-center rounded-full mr-3">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium">Total Revenue</div>
                      <div className="text-sm text-gray-400">Last 30 days</div>
                    </div>
                  </div>
                  <div className="text-xl font-semibold text-green-500">
                    ₹125,800
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full mr-3">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Tournament Entries</div>
                      <div className="text-sm text-gray-400">Last 30 days</div>
                    </div>
                  </div>
                  <div className="text-xl font-semibold">
                    ₹89,200
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500/20 flex items-center justify-center rounded-full mr-3">
                      <ArrowDownLeft className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium">Prize Payouts</div>
                      <div className="text-sm text-gray-400">Last 30 days</div>
                    </div>
                  </div>
                  <div className="text-xl font-semibold text-red-500">
                    ₹64,500
                  </div>
                </div>
                
                <Button variant="outline" className="w-full border-gray-700">
                  View Detailed Reports
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-dark-card border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Total Users</div>
                  <div className="font-semibold">2,548</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Active Users (30d)</div>
                  <div className="font-semibold">1,876</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">New Users (30d)</div>
                  <div className="font-semibold">312</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">KYC Verified</div>
                  <div className="font-semibold">942</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-dark-card border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Tournament Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Active Tournaments</div>
                  <div className="font-semibold">24</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Total Tournaments</div>
                  <div className="font-semibold">156</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Avg. Participants</div>
                  <div className="font-semibold">76</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Highest Prize Pool</div>
                  <div className="font-semibold">₹50,000</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-dark-card border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Financial Metrics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">GMV (30d)</div>
                  <div className="font-semibold">₹125,800</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Revenue (30d)</div>
                  <div className="font-semibold">₹24,700</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Avg. Wallet Balance</div>
                  <div className="font-semibold">₹750</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400">Fees Collected</div>
                  <div className="font-semibold">₹18,450</div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card className="bg-dark-card border-gray-800 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <div className="flex items-center">
                  <ShieldCheck className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <div className="font-medium">KYC Verifications</div>
                    <div className="text-sm text-gray-400">17 pending requests</div>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                  <Link href="/admin/kyc">
                    Review Now
                  </Link>
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <div className="font-medium">Match Results</div>
                    <div className="text-sm text-gray-400">8 results pending approval</div>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                  <Link href="/admin/matches">
                    Review Now
                  </Link>
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium">Upcoming Tournaments</div>
                    <div className="text-sm text-gray-400">3 tournaments starting today</div>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/admin/tournaments">
                    View Details
                  </Link>
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                <div className="flex items-center">
                  <ArrowDownLeft className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <div className="font-medium">Withdrawal Requests</div>
                    <div className="text-sm text-gray-400">12 pending withdrawals</div>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
                  <Link href="/admin/withdrawals">
                    Process Now
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-dark-card border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
              <div className="space-y-3">
                <div className="p-3 bg-dark-lighter rounded-lg">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">PUBG Mobile Pro Series</div>
                    <Badge className="bg-yellow-500/20 text-yellow-500">
                      Upcoming
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">Starts at 3:00 PM</div>
                </div>
                
                <div className="p-3 bg-dark-lighter rounded-lg">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">BGMI Solo Showdown</div>
                    <Badge className="bg-red-500/20 text-red-500">
                      Live
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">Started at 10:00 AM</div>
                </div>
                
                <div className="p-3 bg-dark-lighter rounded-lg">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">Squad Challenge Cup</div>
                    <Badge className="bg-yellow-500/20 text-yellow-500">
                      Upcoming
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">Starts at 6:00 PM</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-dark-card border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
              <div className="space-y-3">
                <div className="p-3 bg-dark-lighter rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full mr-3">
                      <span className="text-sm">PS</span>
                    </div>
                    <div>
                      <div className="font-medium">ProSniper</div>
                      <div className="text-xs text-gray-400">Joined 2 hours ago</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                    <Link href="/admin/users">
                      <span className="sr-only">View</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                <div className="p-3 bg-dark-lighter rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full mr-3">
                      <span className="text-sm">BQ</span>
                    </div>
                    <div>
                      <div className="font-medium">BattleQueen</div>
                      <div className="text-xs text-gray-400">Joined 5 hours ago</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                    <Link href="/admin/users">
                      <span className="sr-only">View</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                <div className="p-3 bg-dark-lighter rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full mr-3">
                      <span className="text-sm">HK</span>
                    </div>
                    <div>
                      <div className="font-medium">HeadshotKing</div>
                      <div className="text-xs text-gray-400">Joined 8 hours ago</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                    <Link href="/admin/users">
                      <span className="sr-only">View</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}