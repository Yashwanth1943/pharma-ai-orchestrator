import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`pharma_ai_notifications_${user._id}`);
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`pharma_ai_notifications_${user._id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  useEffect(() => {
    // Only connect socket if user is logged in
    if (!user) return;

    // Use VITE_API_URL for production or fallback to localhost for local dev
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const addNotification = (notification) => {
    setNotifications(prev => [{ ...notification, id: Date.now().toString(), read: false }, ...prev].slice(0, 50));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
