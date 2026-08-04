import React, { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const AICard = ({ data }) => {
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Simulate typing effect for the explanation
    const timer = setTimeout(() => setIsTyping(false), 800);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data) return null;

  // Fallback for safety if parsing fails slightly
  const title = data.title || "AI Insight";
  const explanation = data.explanation || "";
  const recommendation = data.recommendation || "";
  const reason = data.reason || "";
  const confidence = data.confidence || 0;
  const priority = data.priority || "Medium";
  const nextStep = data.nextStep || "";

  const getPriorityColor = (pri) => {
    switch (pri?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 90) return 'bg-green-500';
    if (conf >= 70) return 'bg-blue-500';
    if (conf >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative w-full rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl overflow-hidden mb-6">
      {/* Animated gradient border top */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 animate-gradient-x"></div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md text-white">
              <BrainCircuit size={18} className={isTyping ? "animate-pulse" : ""} />
            </div>
            <h3 className="font-bold text-gray-900">{title}</h3>
          </div>
          
          {priority && (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(priority)}`}>
              Priority: {priority}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {explanation && (
            <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
              <p className="text-sm text-gray-700 leading-relaxed">
                {explanation}
                {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse"></span>}
              </p>
            </div>
          )}

          {!isTyping && (
            <div className="space-y-3 animate-fade-in">
              {(recommendation || reason) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendation && (
                    <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50">
                      <div className="flex items-center gap-1.5 mb-1 text-indigo-700 font-semibold text-xs uppercase tracking-wider">
                        <CheckCircle size={14} /> Recommendation
                      </div>
                      <p className="text-sm text-indigo-900">{recommendation}</p>
                    </div>
                  )}
                  {reason && (
                    <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/50">
                      <div className="flex items-center gap-1.5 mb-1 text-purple-700 font-semibold text-xs uppercase tracking-wider">
                        <AlertTriangle size={14} /> Reason
                      </div>
                      <p className="text-sm text-purple-900">{reason}</p>
                    </div>
                  )}
                </div>
              )}

              {nextStep && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100/50">
                  <ArrowRight size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Next Step:</span>
                  <span className="text-sm text-blue-800">{nextStep}</span>
                </div>
              )}

              {confidence > 0 && (
                <div className="pt-2 border-t border-gray-100/50 mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> Confidence Score
                    </span>
                    <span className="text-xs font-bold text-gray-700">{confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${getConfidenceColor(confidence)} transition-all duration-1000 ease-out`} 
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
