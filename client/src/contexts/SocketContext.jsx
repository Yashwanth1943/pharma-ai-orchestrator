import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  
  // Global Chat UI State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const isChatOpenRef = useRef(isChatOpen);
  const activeChatUserRef = useRef(activeChatUser);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
    activeChatUserRef.current = activeChatUser;
  }, [isChatOpen, activeChatUser]);

  // Fetch initial unread count
  useEffect(() => {
    if (user) {
      api.get('/chat/unread-count')
        .then(res => setUnreadChatCount(res.data.unreadCount))
        .catch(err => console.error('Failed to get unread count', err));
    } else {
      setUnreadChatCount(0);
    }
  }, [user]);

  // Persist notifications per user in localStorage
  const [notifications, setNotifications] = useState(() => {
    return [];
  });

  // Load notifications from localStorage when user changes
  useEffect(() => {
    if (user) {
      try {
        const saved = localStorage.getItem(`pharma_ai_notifications_${user._id}`);
        setNotifications(saved ? JSON.parse(saved) : []);
      } catch (_e) {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, [user?._id]);

  // Persist notifications to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`pharma_ai_notifications_${user._id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev =>
      [{ ...notification, id: Date.now().toString(), timestamp: new Date().toISOString(), read: false }, ...prev].slice(0, 50)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Connect socket and wire up all real-time events
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(API_URL, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    // Join personal room for private messaging
    newSocket.emit('setup', user);

    // ——— Real-time event listeners ———

    newSocket.on('new_order', (data) => {
      // Notify internal staff (not customers, they placed the order)
      if (user.role !== 'Customer') {
        addNotification({
          title: 'New Order Received',
          message: data.message || 'A new order has been placed and is awaiting approval.',
          type: 'info'
        });
      }
    });

    newSocket.on('order_updated', () => {
      // Silently triggers re-fetches; no notification needed here
    });

    newSocket.on('role_turn_pending', (data) => {
      // Notify the relevant department when it's their turn
      if (user.role === data.targetRole) {
        addNotification({
          title: 'Action Required',
          message: data.message || 'An order is ready for your department to process.',
          type: 'warning'
        });
      }
      // Admin always gets notified
      if (user.role === 'Admin') {
        addNotification({
          title: 'Order Stage Advanced',
          message: data.message || 'An order has moved to the next stage.',
          type: 'info'
        });
      }
    });

    newSocket.on('order_delivered', (data) => {
      // Notify Admin and the customer (if their order)
      if (user.role === 'Admin') {
        addNotification({
          title: 'Order Delivered',
          message: data.message || 'An order has been successfully delivered.',
          type: 'success'
        });
      }
      if (user._id === data.customerId?.toString() || user._id === data.customerId) {
        addNotification({
          title: '🎉 Order Delivered!',
          message: data.message || 'Your order has been successfully delivered!',
          type: 'success'
        });
      }
    });

    newSocket.on('new_complaint', (data) => {
      // Notify Admin and Service Agents
      if (user.role === 'Admin' || user.role === 'Service Agent') {
        addNotification({
          title: 'New Complaint Raised',
          message: data.message || 'A customer has raised a new complaint.',
          type: 'warning'
        });
      }
    });

    newSocket.on('complaint_updated', (data) => {
      // Notify Admin of complaint status changes
      if (user.role === 'Admin' || user.role === 'Service Agent') {
        addNotification({
          title: 'Complaint Updated',
          message: data.message || 'A complaint status has been updated.',
          type: 'info'
        });
      }
    });

    newSocket.on('receive_message', (data) => {
      const isChatActive = isChatOpenRef.current && activeChatUserRef.current && activeChatUserRef.current._id === data.chat._id;

      if (isChatActive) {
        // Add incoming message to state since the chat is open
        setChatMessages(prev => [...prev, data]);
      } else {
        // Show a toast and increment unread
        setUnreadChatCount(prev => prev + 1);
        addNotification({
          title: 'New Chat Message',
          message: `New message from ${data.sender.name}`,
          type: 'info'
        });
      }
    });

    newSocket.on('user_status', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.status === 'online') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    return () => {
      newSocket.off('new_order');
      newSocket.off('order_updated');
      newSocket.off('role_turn_pending');
      newSocket.off('order_delivered');
      newSocket.off('new_complaint');
      newSocket.off('complaint_updated');
      newSocket.off('receive_message');
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ 
      socket, notifications, addNotification, markAllAsRead, 
      chatMessages, setChatMessages,
      isChatOpen, setIsChatOpen,
      activeChatUser, setActiveChatUser,
      unreadChatCount, setUnreadChatCount,
      onlineUsers
    }}>
      {children}
    </SocketContext.Provider>
  );
};
