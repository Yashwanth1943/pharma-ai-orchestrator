import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { MessageCircle, X, Send, User, ChevronLeft, Paperclip } from 'lucide-react';
import api from '../../services/api';

export const ChatWidget = () => {
  const { user } = useAuth();
  const { 
    socket, chatMessages, setChatMessages,
    isChatOpen: isOpen, setIsChatOpen: setIsOpen,
    activeChatUser: activeContact, setActiveChatUser: setActiveContact,
    unreadChatCount, setUnreadChatCount, onlineUsers
  } = useSocket() || {};
  
  const [view, setView] = useState('inbox');
  const [chats, setChats] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (user?.role === 'Customer') {
        fetchCustomerChats();
      }
      setUnreadChatCount(0);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (socket) {
      socket.on('typing', () => setIsSomeoneTyping(true));
      socket.on('stop_typing', () => setIsSomeoneTyping(false));
      
      // When a new message comes in, we might want to refresh chats to update unread badges
      socket.on('receive_message', () => {
        if (isOpen && view === 'inbox') fetchCustomerChats();
      });
    }
    return () => {
      if (socket) {
        socket.off('typing');
        socket.off('stop_typing');
        // keep other receive_message listeners alive
      }
    };
  }, [socket, isOpen, view]);

  async function fetchCustomerChats() {
    try {
      setLoading(true);
      const res = await api.get('/chat');
      const fetchedChats = res.data;
      
      if (fetchedChats.length > 0) {
        setChats(fetchedChats);
        
        // If they already selected a chat, keep it active
        if (activeContact) return;
        
        if (fetchedChats.length === 1) {
          setActiveContact(fetchedChats[0]);
          setView('chat');
        } else {
          setView('inbox');
        }
      } else {
        // First time chatting: get default support contact and create 1-on-1 chat
        const supportRes = await api.get('/chat/support-contact');
        const chatRes = await api.post('/chat', { userId: supportRes.data._id });
        setChats([chatRes.data]);
        setActiveContact(chatRes.data);
        setView('chat');
      }
    } catch (err) {
      console.error('Failed to fetch chats', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeContact && isOpen && view === 'chat') {
      fetchHistory(activeContact._id);
      socket?.emit('join_chat', activeContact._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContact, isOpen, view]);

  async function fetchHistory(chatId) {
    try {
      const res = await api.get(`/chat/message/${chatId}`);
      setChatMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  }

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!socket || !activeContact) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', activeContact._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', activeContact._id);
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachment) || !activeContact) return;

    socket.emit('stop_typing', activeContact._id);
    setIsTyping(false);

    try {
      let res;
      if (attachment) {
        const formData = new FormData();
        formData.append('chatId', activeContact._id);
        if (messageInput.trim()) formData.append('content', messageInput.trim());
        formData.append('attachment', attachment);
        
        res = await api.post('/chat/message', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/chat/message', {
          chatId: activeContact._id,
          content: messageInput.trim()
        });
      }
      
      const newMsg = res.data;
      setChatMessages(prev => [...prev, newMsg]);
      socket?.emit('send_message', newMsg);
      
      setMessageInput('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (isOpen && view === 'chat') scrollToBottom();
  }, [chatMessages, isOpen, view]);

  if (!user || user.role !== 'Customer') return null;
  
  const partner = activeContact?.users?.find(u => u._id !== user._id);
  const isOnline = partner && onlineUsers.has(partner._id);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl mb-4 border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right transform scale-100 opacity-100 h-[500px]">
          
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-3">
              {chats.length > 1 && view === 'chat' && (
                <button onClick={() => { setView('inbox'); setActiveContact(null); fetchCustomerChats(); }} className="text-blue-100 hover:text-white transition-colors">
                  <ChevronLeft size={24} />
                </button>
              )}
              
              {view === 'chat' ? (
                <>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                    <User size={20} />
                    {isOnline && (
                       <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{partner ? partner.name : 'Support Agent'}</h3>
                    <p className="text-xs text-blue-100 opacity-80">{partner ? partner.role : 'Live Chat'}</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageCircle size={24} />
                  <h3 className="font-bold text-lg">Support Inbox</h3>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          {loading && !activeContact ? (
            <div className="flex-1 flex justify-center items-center text-blue-600 bg-gray-50">
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : view === 'inbox' ? (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Conversations</p>
              {chats.map(chat => {
                const chatPartner = chat.users.find(u => u._id !== user._id);
                return (
                  <div 
                    key={chat._id} 
                    onClick={() => { setActiveContact(chat); setView('chat'); }}
                    className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-blue-50 transition-all flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 relative shrink-0">
                      <User size={20} />
                      {onlineUsers.has(chatPartner?._id) && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-sm text-gray-900 truncate">{chatPartner?.name || 'Support'}</p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {chat.latestMessage?.content || 'Start chatting...'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                    <MessageCircle size={32} />
                    <p className="text-sm">Send a message to start chatting</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isMe = msg.sender._id === user._id;
                    return (
                      <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-br-sm' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                        }`}>
                          {msg.fileUrl && (
                            <div className="mb-2">
                              {msg.fileType?.startsWith('image/') ? (
                                <img src={`http://localhost:5000${msg.fileUrl}`} alt="attachment" className="rounded-lg max-w-full h-auto max-h-32 object-contain" />
                              ) : (
                                <a href={`http://localhost:5000${msg.fileUrl}`} target="_blank" rel="noreferrer" className="underline font-medium break-all text-xs">
                                  📎 View Attachment
                                </a>
                              )}
                            </div>
                          )}
                          {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                          <div className={`text-[9px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {isSomeoneTyping && (
                  <div className="flex justify-start">
                     <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s'}}></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></span>
                     </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-gray-100">
                 {attachment && (
                  <div className="mb-2 px-3 py-1 bg-blue-50 rounded-lg flex items-center justify-between text-xs text-blue-800">
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                    <button onClick={() => setAttachment(null)} className="text-red-500 font-bold ml-2">X</button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => setAttachment(e.target.files[0])} 
                    className="hidden" 
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={!messageInput.trim() && !attachment}
                    className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all shrink-0"
                  >
                    <Send size={16} className="-ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
            isOpen ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
        
        {!isOpen && unreadChatCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse border-2 border-white shadow-sm">
            {unreadChatCount}
          </span>
        )}
      </div>
    </div>
  );
};
