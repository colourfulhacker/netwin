import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Bell, CheckCheck } from "lucide-react";
import { Notification } from "@/types";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ open, onClose }: NotificationCenterProps) => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (open) {
      window.addEventListener("keydown", handleEscape);
    }
    
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);
  
  // Filter notifications based on tab
  const getFilteredNotifications = (): Notification[] => {
    if (activeTab === "unread") {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  };
  
  // Handle read notification
  const handleNotificationClick = (notification: Notification) => {
    if (user && !notification.read) {
      markAsRead(user.id, notification.id);
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (user) {
      markAllAsRead(user.id);
    }
  };
  
  // Get notification timestamp
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - notificationDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return "Just now";
    }
  };
  
  // Return if no user or panel is closed
  if (!user || !open) return null;
  
  // Get filtered notifications
  const filteredNotifications = getFilteredNotifications();
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-dark-card border-l border-gray-800 shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="flex-1 mt-0">
            <ScrollArea className="flex-1 h-full max-h-[calc(100vh-120px)]">
              {filteredNotifications.length > 0 ? (
                <div className="py-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-800 hover:bg-dark-lighter cursor-pointer ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${!notification.read ? "text-white" : "text-gray-300"}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="mt-2 flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="ml-2 text-xs text-primary">Unread</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <Bell className="h-10 w-10 text-gray-600 mb-4" />
                  <p className="text-gray-400">No notifications to display</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unread" className="flex-1 mt-0">
            <ScrollArea className="flex-1 h-full max-h-[calc(100vh-120px)]">
              {filteredNotifications.length > 0 ? (
                <div className="py-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 bg-primary/5 border-b border-gray-800 hover:bg-dark-lighter cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-white">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="ml-2 text-xs text-primary">Unread</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <CheckCheck className="h-10 w-10 text-gray-600 mb-4" />
                  <p className="text-gray-400">No unread notifications</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationCenter;