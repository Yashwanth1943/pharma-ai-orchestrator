import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { DataTable } from '../components/ui/Table/DataTable';
import { Badge } from '../components/ui/Badge/Badge';
import { Modal } from '../components/ui/Modal/Modal';
import { Input } from '../components/ui/Input/Input';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { AIInsightCard } from '../components/ui/AIInsightCard/AIInsightCard';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Target, MessageSquare, Send, Plus } from 'lucide-react';

export const MarketingOutreach = () => {
  const { user } = useAuth();
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    targetSegment: '',
    message: '',
    status: 'Draft',
    targetCount: 0,
    successRate: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const [segRes, campRes] = await Promise.all([
        api.get('/marketing/segments'),
        api.get('/marketing/campaigns')
      ]);
      setSegments(segRes.data);
      setCampaigns(campRes.data);

      // Fetch NBA (Next-Best Action) Insight
      setIsAiLoading(true);
      const aiRes = await api.post('/ai/insights', {
        contextType: 'marketing_outreach',
        role: user.role,
        data: { segments: segRes.data }
      });
      if (aiRes.data?.result) setAiInsight(aiRes.data.result);
    } catch (error) {
      console.error('Failed to fetch marketing data', error);
    } finally {
      setIsLoading(false);
      setIsAiLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setCampaignLoading(true);
    try {
      await api.post('/marketing/campaigns', campaignForm);
      setIsCampaignModalOpen(false);
      setCampaignForm({ name: '', targetSegment: '', message: '', status: 'Draft', targetCount: 0, successRate: 0 });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setCampaignLoading(false);
    }
  };

  const segmentColumns = [
    { header: 'Segment Name', accessor: 'name' },
    { header: 'Size', render: (row) => row.size.toLocaleString() },
    { header: 'Propensity to Buy', render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
          <div
            className={`h-2 rounded-full ${row.propensityToBuy > 70 ? 'bg-green-500' : row.propensityToBuy > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${row.propensityToBuy}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">{row.propensityToBuy}%</span>
      </div>
    )},
    { header: 'Last Engaged', accessor: 'lastEngaged' },
    { header: 'Actions', render: (row) => (
      <Button
        size="sm"
        variant="secondary"
        className="flex items-center gap-1"
        onClick={() => {
          setCampaignForm(prev => ({ ...prev, targetSegment: row.name, targetCount: row.size }));
          setIsCampaignModalOpen(true);
        }}
      >
        <Target size={14} /> Target
      </Button>
    )}
  ];

  const campaignColumns = [
    { header: 'Campaign', accessor: 'name' },
    { header: 'Segment', accessor: 'targetSegment' },
    { header: 'Status', render: (row) => (
      <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Draft' ? 'neutral' : 'primary'}>
        {row.status}
      </Badge>
    )},
    { header: 'Target Count', render: (row) => row.targetCount?.toLocaleString() || '—' },
    { header: 'Success Rate', render: (row) => row.successRate ? `${row.successRate}%` : '—' },
    { header: 'Actions', render: (_row) => (
      <Button size="sm" variant="secondary" className="flex items-center gap-1">
        <MessageSquare size={14} /> View Draft
      </Button>
    )}
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing & Outreach"
        subtitle="Manage customer segments, view propensity scores, and generate AI-driven Next-Best Actions."
        actionPrimary={
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setCampaignForm({ name: '', targetSegment: '', message: '', status: 'Draft', targetCount: 0, successRate: 0 });
              setIsCampaignModalOpen(true);
            }}
          >
            <Plus size={16} /> New Campaign
          </Button>
        }
      />

      <AIInsightCard insight={aiInsight} isLoading={isAiLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-0 overflow-hidden border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
              <p className="text-sm text-gray-500">AI-identified target groups based on behavior.</p>
            </div>
          </div>
          <DataTable
            columns={segmentColumns}
            data={segments}
            isLoading={isLoading}
            emptyTitle="No segments found"
            emptyDescription="AI is still analyzing customer data to build segments."
          />
        </Card>

        <Card className="p-0 overflow-hidden border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
              <p className="text-sm text-gray-500">Manage consent-aware outreach campaigns.</p>
            </div>
          </div>
          <DataTable
            columns={campaignColumns}
            data={campaigns}
            isLoading={isLoading}
            emptyTitle="No campaigns found"
            emptyDescription="Create a campaign to target a specific customer segment."
          />
        </Card>
      </div>

      {/* New Campaign Modal */}
      <Modal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title="Create New Campaign"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <Input
            label="Campaign Name"
            value={campaignForm.name}
            onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
            required
            placeholder="e.g. Q3 Reactivation Campaign"
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Target Segment</label>
            <select
              value={campaignForm.targetSegment}
              onChange={(e) => setCampaignForm({ ...campaignForm, targetSegment: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              required
            >
              <option value="">— Select a Segment —</option>
              {segments.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.size.toLocaleString()} contacts)</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Campaign Message</label>
            <textarea
              value={campaignForm.message}
              onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
              required
              placeholder="Enter the outreach message for this campaign..."
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={campaignForm.status}
              onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCampaignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={campaignLoading} className="flex items-center gap-2">
              <Send size={14} />
              {campaignLoading ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
