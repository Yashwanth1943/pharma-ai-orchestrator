import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Avatar } from '../components/ui/Avatar/Avatar';
import { MessageCircle, Send, Search, Paperclip, Users as UsersIcon, Plus } from 'lucide-react';
import api from '../services/api';

export const MessagesPage = () => {
  const { user } = useAuth();
  const { 
    socket, chatMessages, setChatMessages, 
    activeChatUser, setActiveChatUser,
    setUnreadChatCount, onlineUsers, setIsChatOpen
  } = useSocket() || {};

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Group Chat Modal State
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);

  useEffect(() => {
    fetchChats();
    fetchDirectoryUsers();
    setIsChatOpen(true);
    return () => setIsChatOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeChatUser) {
      fetchHistory(activeChatUser._id);
      socket?.emit('join_chat', activeChatUser._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatUser]);

  useEffect(() => {
    if (socket) {
      socket.on('typing', () => setIsSomeoneTyping(true));
      socket.on('stop_typing', () => setIsSomeoneTyping(false));
    }
    return () => {
      if (socket) {
        socket.off('typing');
        socket.off('stop_typing');
      }
    };
  }, [socket]);

  async function fetchDirectoryUsers() {
    try {
      const res = await api.get('/auth/directory');
      setDirectoryUsers(res.data.filter(u => u._id !== user._id));
    } catch (err) {
      console.error('Failed to get directory users', err);
    }
  }

  async function fetchChats() {
    try {
      setLoading(true);
      const res = await api.get('/chat');
      setChats(res.data);
      
      const totalUnread = res.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadChatCount(totalUnread);
    } catch (err) {
      console.error('Failed to get chats', err);
    } finally {
      setLoading(false);
    }
  }

  // To support legacy 1on1 activeChatUser (which is just a User object), we need to get the Chat ID
  async function fetchHistory(chatId) {
    try {
      // If the passed target is a user (from Directory), access/create a 1on1 chat first
      if (!activeChatUser.isGroupChat && !activeChatUser.users) {
        const chatRes = await api.post('/chat', { userId: chatId });
        chatId = chatRes.data._id;
        // Update active context to be the Chat, not the User
        setActiveChatUser(chatRes.data);
        fetchChats();
      }

      const res = await api.get(`/chat/message/${chatId}`);
      setChatMessages(res.data);
      scrollToBottom();
      fetchChats();
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  }

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!socket || !activeChatUser) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', activeChatUser._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', activeChatUser._id);
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachment) || !activeChatUser) return;

    socket.emit('stop_typing', activeChatUser._id);
    setIsTyping(false);

    try {
      let res;
      if (attachment) {
        const formData = new FormData();
        formData.append('chatId', activeChatUser._id);
        if (messageInput.trim()) formData.append('content', messageInput.trim());
        formData.append('attachment', attachment);
        
        res = await api.post('/chat/message', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/chat/message', {
          chatId: activeChatUser._id,
          content: messageInput.trim()
        });
      }
      
      const newMsg = res.data;
      setChatMessages(prev => [...prev, newMsg]);
      socket?.emit('send_message', newMsg);
      
      setMessageInput('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchChats();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedGroupUsers.length < 2) return;
    try {
      const res = await api.post('/chat/group', {
        name: groupName,
        users: JSON.stringify(selectedGroupUsers.map(u => u._id))
      });
      setChats([res.data, ...chats]);
      setShowGroupModal(false);
      setGroupName('');
      setSelectedGroupUsers([]);
      setActiveChatUser(res.data);
    } catch (err) {
      console.error('Failed to create group', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const filteredChats = chats.filter(chat => {
    const chatName = chat.isGroupChat ? chat.chatName : chat.users.find(u => u._id !== user._id)?.name;
    return chatName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getChatName = (chat) => {
    if (chat.name) return chat.name;
    return chat.isGroupChat ? chat.chatName : chat.users?.find(u => u._id !== user._id)?.name || 'Unknown';
  };
  
  const getChatPartner = (chat) => {
    if (chat.name) return chat;
    return chat.isGroupChat ? null : chat.users?.find(u => u._id !== user._id);
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-2xl shadow-sm flex overflow-hidden">
      
      {/* Left Sidebar - Conversations */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <button 
              onClick={() => setShowGroupModal(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="New Group Chat"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center p-8 text-gray-500 text-sm">
              No conversations found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map(chat => {
                const partner = getChatPartner(chat);
                const isOnline = !chat.isGroupChat && partner && onlineUsers.has(partner._id);

                return (
                  <div 
                    key={chat._id} 
                    onClick={() => setActiveChatUser(chat)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-blue-50 flex items-center gap-3 ${
                      activeChatUser?._id === chat._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      {chat.isGroupChat ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                          <UsersIcon size={20} />
                        </div>
                      ) : (
                        <Avatar name={getChatName(chat)} size="md" />
                      )}
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {getChatName(chat)}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {chat.latestMessage?.content || 'Started a chat'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Active Chat */}
      <div className="flex-1 flex flex-col bg-white relative">
        {activeChatUser ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              {activeChatUser.isGroupChat ? (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  <UsersIcon size={24} />
                </div>
              ) : (
                <div className="relative">
                   <Avatar name={getChatName(activeChatUser)} size="lg" />
                   {!activeChatUser.isGroupChat && getChatPartner(activeChatUser) && onlineUsers.has(getChatPartner(activeChatUser)._id) && (
                     <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                   )}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{getChatName(activeChatUser)}</h3>
                <p className="text-sm text-gray-500">
                  {activeChatUser.isGroupChat ? `${activeChatUser.users.length} members` : getChatPartner(activeChatUser)?.role}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {chatMessages.map((msg, i) => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      {activeChatUser.isGroupChat && !isMe && (
                        <span className="text-xs text-gray-500 ml-2">{msg.sender.name}</span>
                      )}
                      <div className={`px-5 py-3 shadow-sm text-sm ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm'
                      }`}>
                        {msg.fileUrl && (
                          <div className="mb-2">
                            {msg.fileType?.startsWith('image/') ? (
                              <img src={`http://localhost:5000${msg.fileUrl}`} alt="attachment" className="rounded-lg max-w-full h-auto max-h-64 object-contain" />
                            ) : (
                              <a href={`http://localhost:5000${msg.fileUrl}`} target="_blank" rel="noreferrer" className="underline font-medium break-all">
                                📎 View Attachment
                              </a>
                            )}
                          </div>
                        )}
                        {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                      </div>
                      <span className={`text-[10px] text-gray-400 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isSomeoneTyping && (
                <div className="flex justify-start">
                   <div className="px-5 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s'}}></span>
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              {attachment && (
                <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-sm text-blue-800">
                  <span className="truncate max-w-xs">{attachment.name}</span>
                  <button onClick={() => setAttachment(null)} className="text-red-500 font-bold ml-4">X</button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => setAttachment(e.target.files[0])} 
                  className="hidden" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="p-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Paperclip size={20} />
                </button>
                
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleTyping}
                  placeholder={`Message ${getChatName(activeChatUser)}...`}
                  className="flex-1 bg-gray-100 border-none rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!messageInput.trim() && !attachment}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all flex items-center justify-center shadow-sm"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <MessageCircle size={32} className="text-blue-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Your Messages</h3>
            <p className="text-sm text-center max-w-sm">
              Select a conversation from the sidebar or start a new Group Chat.
            </p>
          </div>
        )}
      </div>
      
      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create Group Chat</h2>
            <input 
              type="text" 
              placeholder="Group Name" 
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full border-gray-300 rounded-lg mb-4 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Select Users (Hold Ctrl/Cmd to select multiple)</p>
              <select 
                multiple
                className="w-full h-32 border-gray-300 rounded-lg text-sm"
                onChange={(e) => {
                  const options = [...e.target.selectedOptions];
                  const users = options.map(opt => directoryUsers.find(u => u._id === opt.value));
                  setSelectedGroupUsers(users);
                }}
              >
                {directoryUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowGroupModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreateGroup} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Create Group</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
