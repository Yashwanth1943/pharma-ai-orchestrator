import React, { useState, useContext } from 'react';
import { X, Send, Loader } from 'lucide-react';
import api from '../../services/api';
import { Logo } from '../ui/Logo/Logo';
import { AICard } from './AICard';
import { AuthContext } from '../../contexts/AuthContext';

export const AIAssistantDrawer = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e?.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setResponse(null);
    try {
      const res = await api.post('/ai/insights', {
        contextType: 'page_context',
        role: user?.role || 'Guest',
        data: { query, pageData: { currentURL: window.location.pathname } }
      });
      setResponse(res.data.result);
    } catch (error) {
      setResponse({
        title: "Error",
        explanation: "Failed to connect to AI Assistant. Please try again.",
        confidence: 0,
        priority: "High"
      });
    } finally {
      setLoading(false);
    }
  };

  const setPresetQuery = (text) => {
    setQuery(text);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-blue-50/50">
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <Logo size={20} />
            <h2>Enterprise AI Assistant</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
          
          {response && (
            <AICard data={response} />
          )}

          {!response && !loading && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Contextual Suggestions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setPresetQuery('Explain the current workflows on this page.')}
                  className="text-xs text-left w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-all font-medium"
                >
                  Explain current workflows on this page
                </button>
                <button 
                  onClick={() => setPresetQuery('What are my highest priority tasks today?')}
                  className="text-xs text-left w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-all font-medium"
                >
                  What are my highest priority tasks today?
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleAsk} className="relative flex items-center">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button 
              type="submit" 
              disabled={loading || !query}
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-gray-400"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
