import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { AIInsightCard } from '../components/ui/AIInsightCard/AIInsightCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { BrainCircuit, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const sentimentData = [
  { name: 'Week 1', positive: 65, neutral: 20, negative: 15 },
  { name: 'Week 2', positive: 68, neutral: 22, negative: 10 },
  { name: 'Week 3', positive: 72, neutral: 18, negative: 10 },
  { name: 'Week 4', positive: 78, neutral: 15, negative: 7 },
];

const conversionData = [
  { name: 'Q1', converted: 400, churned: 120 },
  { name: 'Q2', converted: 450, churned: 110 },
  { name: 'Q3', converted: 520, churned: 90 },
  { name: 'Q4', converted: 600, churned: 85 },
];

export const PredictiveAnalytics = () => {
  const { user } = useAuth();
  const [aiInsight, setAiInsight] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const aiRes = await api.post('/ai/insights', {
          contextType: 'predictive_analytics',
          role: user.role,
          data: { sentimentData, conversionData }
        });
        if (aiRes.data?.result) setAiInsight(aiRes.data.result);
      } catch (error) {
        console.error('Failed to fetch predictive insight', error);
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchInsight();
  }, [user]);

  const handleFeedback = (type) => {
    // Simulated feedback logic for the model
    alert(`Thank you for your feedback! The model has recorded a ${type} rating and will recalibrate.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Predictive Analytics & Intent" 
        subtitle="Monitor AI-driven sentiment trends, churn propensity, and conversion forecasting."
      />

      <AIInsightCard insight={aiInsight} isLoading={isAiLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Sentiment Analysis</h3>
              <p className="text-sm text-gray-500">NLP-derived sentiment from support tickets and communications.</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Propensity: Conversion vs Churn</h3>
              <p className="text-sm text-gray-500">Predicted quarterly outcomes based on behavioral models.</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="converted" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Converted" />
                <Bar dataKey="churned" fill="#ef4444" radius={[4, 4, 0, 0]} name="Churned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="bg-blue-50/50 border-blue-100 flex justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Help Recalibrate the AI Model</h4>
            <p className="text-xs text-gray-600">Did the recent propensity predictions match actual outcomes?</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleFeedback('positive')}
            className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-200 rounded-lg transition-colors"
          >
            <ThumbsUp size={18} />
          </button>
          <button 
            onClick={() => handleFeedback('negative')}
            className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 rounded-lg transition-colors"
          >
            <ThumbsDown size={18} />
          </button>
        </div>
      </Card>
    </div>
  );
};
