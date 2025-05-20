import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Notification } from "@/types";
import {
  getUserNotifications,
  addNotification as addNotificationHelper,
  markNotificationAsRead
} from "@/utils/helpers";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;
  markAsRead: (userId: number, notificationId: number) => void;
  markAllAsRead: (userId: number) => void;
  getNotifications: (userId: number) => Notification[];
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  getNotifications: () => []
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Get notifications on component mount
  useEffect(() => {
    setLoading(false);
  }, []);
  
  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    addNotificationHelper(newNotification);
    
    // Update state with new notification
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);
  
  // Mark a notification as read
  const markAsRead = useCallback((userId: number, notificationId: number) => {
    markNotificationAsRead(userId, notificationId);
    
    // Update state
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback((userId: number) => {
    const userNotifications = getUserNotifications(userId);
    
    // Mark all as read in localStorage
    const updatedNotifications = userNotifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('netwin_notifications', JSON.stringify(updatedNotifications));
    
    // Update state
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  }, []);
  
  // Get notifications for a user
  const getNotifications = useCallback((userId: number): Notification[] => {
    const userNotifications = getUserNotifications(userId);
    
    // Update state
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => !n.read).length);
    
    return userNotifications;
  }, []);
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      addNotification,
      markAsRead,
      markAllAsRead,
      getNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
