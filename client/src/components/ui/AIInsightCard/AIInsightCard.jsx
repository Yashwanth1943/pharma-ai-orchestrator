import React from 'react';
import { Sparkles, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Card } from '../Card/Card';

export const AIInsightCard = ({ insight, isLoading, className = '' }) => {
  if (isLoading) {
    return (
      <Card className={`border-blue-100 bg-blue-50/30 ${className}`}>
        <div className="flex items-start gap-3">
          <Sparkles className="text-blue-400 animate-pulse mt-0.5" size={20} />
          <div className="space-y-3 w-full">
            <div className="h-4 bg-blue-100 rounded w-1/3 animate-pulse"></div>
            <div className="h-3 bg-blue-50 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-blue-50 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!insight) return null;

  // Determine styling based on priority
  const styleMap = {
    high: {
      border: 'border-amber-200',
      bg: 'bg-amber-50/50',
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-900',
    },
    medium: {
      border: 'border-blue-200',
      bg: 'bg-blue-50/50',
      icon: Info,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900',
    },
    low: {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      titleColor: 'text-emerald-900',
    }
  };

  const style = styleMap[insight.priority?.toLowerCase()] || styleMap.medium;
  const Icon = style.icon;

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-5 ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`${style.iconColor} mt-0.5`} size={20} />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <h3 className={`font-semibold ${style.titleColor}`}>{insight.title}</h3>
            {insight.confidenceScore && (
              <span className="text-xs font-medium text-gray-500 bg-white/60 px-2 py-0.5 rounded-full border border-gray-200/50">
                {insight.confidenceScore}% Confidence
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">
            {insight.explanation}
          </p>
        </div>
      </div>
      
      {insight.recommendation && (
        <div className="mt-3 pt-3 border-t border-black/5 flex items-start gap-2">
          <Sparkles size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-blue-900">
            Suggestion: <span className="font-normal text-gray-700">{insight.recommendation}</span>
          </p>
        </div>
      )}
    </div>
  );
};
