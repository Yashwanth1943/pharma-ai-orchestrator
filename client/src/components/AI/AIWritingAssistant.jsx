import React, { useState, useContext } from 'react';
import { Sparkles, Wand2, RefreshCw, Check, Copy, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

export const AIWritingAssistant = ({ text, onUpdate, context = '' }) => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const defaultActions = [
    { id: 'enhance', label: 'Enhance Writing', icon: Sparkles },
    { id: 'professional', label: 'Professional Tone', icon: Wand2 },
    { id: 'simplify', label: 'Simplify Text', icon: Wand2 },
    { id: 'expand', label: 'Expand Details', icon: Sparkles },
    { id: 'shorten', label: 'Make Concise', icon: Sparkles }
  ];

  const resolutionActions = [
    { id: 'apologize', label: 'Apologize & Resolve', icon: Sparkles },
    { id: 'explain_delay', label: 'Explain Delay', icon: Wand2 },
    { id: 'technical_fix', label: 'Technical Fix', icon: Wand2 }
  ];

  const actions = context.toLowerCase().includes('resolution') 
    ? [...resolutionActions, ...defaultActions]
    : defaultActions;

  const handleAction = async (actionId) => {
    if (!text && actionId !== 'generate') return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/insights', {
        contextType: 'writing_assist',
        role: user?.role || 'Guest',
        data: { text, action: actionId, context }
      });
      setResult(res.data.result);
    } catch (error) {
      setResult({
        enhancedText: "Failed to generate AI response. Please try again.",
        explanation: "Network or server error."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.enhancedText) {
      navigator.clipboard.writeText(result.enhancedText);
    }
  };

  const handleAccept = () => {
    if (result?.enhancedText) {
      onUpdate(result.enhancedText);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block w-full">
      {/* Trigger Button */}
      <div className="absolute right-3 bottom-3 z-10">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isOpen || result 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm'
          }`}
        >
          <Sparkles size={14} className={loading ? "animate-spin" : ""} />
          <span>AI Assist</span>
        </button>
      </div>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 bottom-12 w-[400px] max-w-[90vw] bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                <Sparkles size={16} className="text-blue-600" />
                Writing Assistant
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {!result && !loading && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-3 px-1">Select an enhancement action:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        disabled={!text && !['apologize', 'explain_delay', 'technical_fix'].includes(action.id)}
                        onClick={() => handleAction(action.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group shadow-sm"
                      >
                        <action.icon size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-blue-100 rounded-full"></div>
                    <div className="w-8 h-8 border-2 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-xs text-blue-600 font-medium animate-pulse">AI is thinking...</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Original</p>
                    <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">{text}</p>
                  </div>
                  
                  <div className="space-y-2 relative">
                    <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} /> Enhanced
                    </p>
                    <div className="text-sm text-gray-900 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {result.enhancedText}
                      </motion.div>
                    </div>
                  </div>

                  {result.explanation && (
                    <p className="text-xs text-gray-500 italic flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                      {result.explanation}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleAccept}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Check size={14} /> Replace Text
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
                      title="Copy"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
                      title="Try Again"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
