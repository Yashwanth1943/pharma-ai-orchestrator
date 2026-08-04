import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  
  // Initialize notifications from localStorage if user exists
  const [notifications, setNotifications] = useState(() => {
    // This runs once. If user changes, we'll handle it in an effect.
    if (!user) return [];
    try {
      const saved = localStorage.getItem(`pharma_ai_notifications_${user._id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (_e) {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      try {
        const saved = localStorage.getItem(`pharma_ai_notifications_${user._id}`);
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          setNotifications([]);
        }
      } catch (_e) {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`pharma_ai_notifications_${user._id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  useEffect(() => {
    if (!user) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [{ ...notification, id: Date.now().toString(), read: false }, ...prev].slice(0, 50));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
