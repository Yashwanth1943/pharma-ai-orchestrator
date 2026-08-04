import React, { useState, useEffect, useContext } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { DataTable } from '../components/ui/Table/DataTable';
import { Badge } from '../components/ui/Badge/Badge';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { AIInsightCard } from '../components/ui/AIInsightCard/AIInsightCard';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Target, MessageSquare, Send } from 'lucide-react';

export const MarketingOutreach = () => {
  const { user } = useContext(AuthContext);
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
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
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const segmentColumns = [
    { header: 'Segment Name', accessor: 'name' },
    { header: 'Size', render: (row) => row.size.toLocaleString() },
    { header: 'Propensity to Buy', render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
          <div 
            className={`h-2 rounded-full ${row.propensityToBuy > 70 ? 'bg-green-500' : row.propensityToBuy > 30 ? 'bg-amber-500' : 'bg-red-500'}`} 
            style={{ width: `${row.propensityToBuy}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500 font-medium">{row.propensityToBuy}%</span>
      </div>
    )},
    { header: 'Last Engaged', accessor: 'lastEngaged' },
    { header: 'Actions', render: (row) => (
      <Button size="sm" variant="secondary" className="flex items-center gap-1">
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
    { header: 'Target Count', accessor: 'targetCount' },
    { header: 'Success Rate', render: (row) => `${row.successRate}%` },
    { header: 'Actions', render: (row) => (
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
          <Button className="flex items-center gap-2">
            <Send size={16} /> New Campaign
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
            emptyTitle="No campaigns found"
            emptyDescription="Create a campaign to target a specific customer segment."
          />
        </Card>
      </div>
    </div>
  );
};
