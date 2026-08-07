import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Badge } from '../components/ui/Badge/Badge';
import api from '../services/api';
import { Target, Activity, ThumbsUp, ThumbsDown, BrainCircuit, RefreshCw } from 'lucide-react';

const JourneyOutcomes = () => {
  const [outcomes, setOutcomes] = useState({ metrics: {}, recentFeedbacks: [] });
  const [loading, setLoading] = useState(true);


  const fetchOutcomes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/outcomes');
      setOutcomes(res.data);
    } catch (err) {
      console.error('Failed to fetch outcomes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMetricColor = (val) => {
    if (val >= 80) return 'text-green-600';
    if (val >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600">
            AI Model Outcomes & Feedback
          </h1>
          <p className="text-slate-500 mt-1">Track recommendation acceptance, model drift, and recalibrate AI performance.</p>
        </div>
        <button onClick={fetchOutcomes} className="p-3 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
          <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Total AI Runs</p>
                <p className="text-3xl font-bold text-slate-800">{outcomes.metrics.totalRuns || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <BrainCircuit className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Avg Confidence</p>
                <p className={`text-3xl font-bold ${getMetricColor(outcomes.metrics.avgConfidence || 0)}`}>
                  {outcomes.metrics.avgConfidence || 0}%
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-sm md:col-span-2 relative overflow-hidden p-0">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-green-50 to-transparent pointer-events-none"></div>
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-center h-full">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Recommendation Acceptance Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-bold ${getMetricColor(outcomes.metrics.acceptanceRate || 0)}`}>
                    {outcomes.metrics.acceptanceRate || 0}%
                  </p>
                  <span className="text-sm text-slate-400">based on explicit user feedback</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-green-600 mb-1">
                    <ThumbsUp className="w-4 h-4" /> <span className="font-bold">{outcomes.metrics.positiveRuns || 0}</span>
                  </div>
                  <span className="text-xs text-slate-500">Approved</span>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-red-500 mb-1">
                    <ThumbsDown className="w-4 h-4" /> <span className="font-bold">{outcomes.metrics.negativeRuns || 0}</span>
                  </div>
                  <span className="text-xs text-slate-500">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Feedback History Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden p-0">
        <div className="bg-slate-50/50 border-b border-slate-100 p-6 pb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            AI Execution & Feedback Log
          </h3>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Context / Model</th>
                  <th className="px-6 py-4 font-medium">AI Recommendation</th>
                  <th className="px-6 py-4 font-medium">Confidence</th>
                  <th className="px-6 py-4 font-medium">User Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        Loading logs...
                      </div>
                    </td>
                  </tr>
                ) : outcomes.recentFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No AI runs or feedback recorded yet.
                    </td>
                  </tr>
                ) : (
                  outcomes.recentFeedbacks.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 capitalize">{log.contextType.replace('_', ' ')}</div>
                        <Badge variant="outline" className="mt-1 bg-slate-100 text-slate-600 text-[10px]">
                          {log.model}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate mb-1">
                          {log.aiResponse?.title || 'No Title'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {log.aiResponse?.recommendation || log.aiResponse?.enhancedText || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.aiResponse?.confidence ? (
                           <Badge variant="secondary" className={`bg-transparent ${getMetricColor(log.aiResponse.confidence)}`}>
                             {log.aiResponse.confidence}%
                           </Badge>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        {log.feedback === 'positive' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <ThumbsUp className="w-3 h-3 mr-1" /> Approved
                          </Badge>
                        )}
                        {log.feedback === 'negative' && (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 w-fit">
                              <ThumbsDown className="w-3 h-3 mr-1" /> Rejected
                            </Badge>
                            {log.correction && (
                              <div className="text-[10px] text-slate-500 italic max-w-[150px] truncate">
                                "{log.correction}"
                              </div>
                            )}
                          </div>
                        )}
                        {!log.feedback && (
                          <span className="text-xs text-slate-400 italic">No feedback provided</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default JourneyOutcomes;
