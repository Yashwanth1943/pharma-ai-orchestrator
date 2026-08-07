import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Badge } from '../components/ui/Badge/Badge';
import api from '../services/api';
import { ShieldCheck, Mail, MessageSquare, Bell, Check, X, Edit3, Settings2 } from 'lucide-react';

const ConsentRecommendations = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);



  const fetchConsents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consent');
      setConsents(res.data);
    } catch (err) {
      console.error('Failed to fetch consents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = (consent) => {
    setEditingId(consent.customerId);
    setEditForm({
      channels: { ...consent.channels },
      purposes: { ...consent.purposes },
      notes: consent.notes || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (customerId) => {
    try {
      await api.put(`/consent/${customerId}`, editForm);
      setEditingId(null);
      fetchConsents();
    } catch (err) {
      console.error('Failed to save consent', err);
    }
  };

  const generateRecommendations = async () => {
    try {
      setLoadingAi(true);
      const res = await api.post('/ai/insights', {
        contextType: 'marketing_outreach',
        data: consents,
        role: 'Admin'
      });
      
      const insight = res.data.result;
      
      // Simulate multi-recommendation return by mapping the single JSON block
      setAiRecommendations([{
        id: Date.now(),
        title: insight.title,
        explanation: insight.explanation,
        recommendation: insight.recommendation,
        reason: insight.reason,
        confidence: insight.confidence,
        priority: insight.priority,
        modelVersion: insight.modelVersion,
        timestamp: insight.timestamp,
        status: 'pending' // pending, approved, rejected
      }]);
    } catch (err) {
      console.error('Failed to get AI recommendations', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAiAction = (recId, action) => {
    setAiRecommendations(prev => prev.map(rec => {
      if (rec.id === recId) {
        return { ...rec, status: action };
      }
      return rec;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-500">
            Consent & Recommendations
          </h1>
          <p className="text-slate-500 mt-1">Manage communication preferences and AI-driven Next-Best Actions.</p>
        </div>
        <div className="p-3 bg-teal-50 rounded-full border border-teal-100 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-teal-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Consents Table */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden flex flex-col h-full p-0">
          <div className="bg-slate-50/50 border-b border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-teal-600" />
              Customer Preferences
            </h3>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            {loading ? (
              <div className="p-8 flex justify-center text-slate-500"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Channels</th>
                    <th className="px-4 py-3 font-medium">Purposes</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consents.map(c => (
                    <tr key={c.customerId} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{c.customerName}</div>
                        <div className="text-xs text-slate-500">{c.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === c.customerId ? (
                          <div className="flex gap-2 text-xs">
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={editForm.channels.email} onChange={e => setEditForm({...editForm, channels: {...editForm.channels, email: e.target.checked}})}/> Email</label>
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={editForm.channels.sms} onChange={e => setEditForm({...editForm, channels: {...editForm.channels, sms: e.target.checked}})}/> SMS</label>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Badge variant="outline" className={c.channels?.email ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                              <Mail className="w-3 h-3 mr-1" /> Email
                            </Badge>
                            <Badge variant="outline" className={c.channels?.sms ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                              <MessageSquare className="w-3 h-3 mr-1" /> SMS
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === c.customerId ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={editForm.purposes.marketing} onChange={e => setEditForm({...editForm, purposes: {...editForm.purposes, marketing: e.target.checked}})}/> Marketing</label>
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={editForm.purposes.research} onChange={e => setEditForm({...editForm, purposes: {...editForm.purposes, research: e.target.checked}})}/> Research</label>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {c.purposes?.marketing && <Badge variant="secondary" className="text-xs bg-slate-100">Marketing</Badge>}
                            {c.purposes?.research && <Badge variant="secondary" className="text-xs bg-slate-100">Research</Badge>}
                            {(!c.purposes?.marketing && !c.purposes?.research) && <span className="text-slate-400 text-xs">None</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingId === c.customerId ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={handleCancelEdit} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">Cancel</button>
                            <button onClick={() => handleSaveEdit(c.customerId)} className="text-xs px-2 py-1 bg-teal-600 text-white rounded">Save</button>
                          </div>
                        ) : (
                          <button onClick={() => handleEditClick(c)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Right Side - AI Recommendations */}
        <div className="space-y-6">
          <Card className="border-indigo-100 shadow-md bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden relative p-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10"></div>
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center justify-between">
                Consent-Aware NBA
                <button 
                  onClick={generateRecommendations}
                  disabled={loadingAi || consents.length === 0}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-all shadow-sm disabled:opacity-50"
                >
                  {loadingAi ? 'Analyzing...' : 'Generate AI Run'}
                </button>
              </h3>
            </div>
            <div className="p-6 pt-2">
              {aiRecommendations.length === 0 && !loadingAi && (
                <div className="text-center p-6 text-slate-500 text-sm">
                  Click Generate to analyze customer consent profiles and get next-best actions.
                </div>
              )}
              
              {loadingAi && (
                <div className="p-8 flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-indigo-600 font-medium text-sm animate-pulse">AI is reading consent profiles...</p>
                </div>
              )}

              <div className="space-y-4">
                {aiRecommendations.map(rec => (
                  <div key={rec.id} className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {rec.priority} Priority
                      </Badge>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        {rec.confidence}% Conf
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-slate-800 mb-1">{rec.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{rec.recommendation}</p>
                    
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded mb-4 border border-slate-100">
                      <span className="font-semibold block mb-1">Reason:</span>
                      {rec.reason}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {rec.modelVersion}
                      </span>
                      
                      {rec.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleAiAction(rec.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleAiAction(rec.id, 'approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md border border-transparent hover:border-green-200 transition-colors" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Badge variant="outline" className={rec.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                          {rec.status === 'approved' ? 'Approved' : 'Rejected'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConsentRecommendations;
