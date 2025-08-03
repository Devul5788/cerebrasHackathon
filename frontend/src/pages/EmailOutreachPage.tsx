import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  FileText, 
  Send, 
  Plus, 
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { EmailTemplateManager } from '../components/outreach/EmailTemplateManager';
import { ContactSelector } from '../components/outreach/ContactSelector';
import { CampaignManager } from '../components/outreach/CampaignManager';
import { EmailDraftViewer } from '../components/outreach/EmailDraftViewer';
import { outreachApi } from '../api/outreachActions';
import { EmailCampaign, Contact, EmailDraft } from '../api/types';

type TabType = 'templates' | 'campaigns' | 'contacts' | 'drafts';

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  color: string;
  onClick?: () => void;
}> = ({ icon, title, value, description, color, onClick }) => (
  <div 
    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
      onClick ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95' : ''
    }`}
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    } : undefined}
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </div>
);

export const EmailOutreachPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [campaignDrafts, setCampaignDrafts] = useState<EmailDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalCampaigns: 0,
    totalDrafts: 0,
    sentEmails: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [templatesRes, campaignsRes] = await Promise.all([
        outreachApi.getEmailTemplates(),
        outreachApi.getEmailCampaigns()
      ]);

      if (templatesRes.success && campaignsRes.success) {
        const totalDrafts = campaignsRes.campaigns.reduce((sum, c) => sum + (c.total_contacts || 0), 0);
        const sentEmails = campaignsRes.campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);

        setStats({
          totalTemplates: templatesRes.templates.length,
          totalCampaigns: campaignsRes.campaigns.length,
          totalDrafts,
          sentEmails
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCampaignSelect = async (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setActiveTab('drafts');
    
    try {
      setLoading(true);
      const response = await outreachApi.getCampaignDrafts(campaign.id);
      if (response.success) {
        setCampaignDrafts(response.drafts);
      } else {
        setError(response.error || 'Failed to load campaign drafts');
      }
    } catch (err) {
      setError('Failed to load campaign drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDrafts = async (campaignId: number, contactIds: number[]) => {
    try {
      setLoading(true);
      const response = await outreachApi.generateEmailDrafts(campaignId, contactIds);
      
      if (response.success) {
        // Refresh campaign drafts
        const draftsResponse = await outreachApi.getCampaignDrafts(campaignId);
        if (draftsResponse.success) {
          setCampaignDrafts(draftsResponse.drafts);
        }
        
        // Show success message
        setError(null);
        loadStats(); // Refresh stats
      } else {
        setError(response.error || 'Failed to generate drafts');
      }
    } catch (err) {
      setError('Failed to generate drafts');
    } finally {
      setLoading(false);
    }  };
  
  const tabs = [
    { id: 'campaigns' as TabType, label: 'Campaigns', icon: Mail },
    { id: 'templates' as TabType, label: 'Templates', icon: FileText },
    { id: 'contacts' as TabType, label: 'Contacts', icon: Users },
    { id: 'drafts' as TabType, label: 'Drafts', icon: Send },
  ];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Outreach</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Generate and manage personalized outreach emails using Cerebras AI
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <StatCard
            icon={<Mail className="h-6 w-6 text-white" />}
            title="Active Campaigns"
            value={stats.totalCampaigns}
            description="Email campaigns"
            color="bg-green-500"
            onClick={() => setActiveTab('campaigns')}
          />
          <StatCard
            icon={<FileText className="h-6 w-6 text-white" />}
            title="Email Templates"
            value={stats.totalTemplates}
            description="Available templates"
            color="bg-blue-500"
            onClick={() => setActiveTab('templates')}
          />
          <StatCard
            icon={<Send className="h-6 w-6 text-white" />}
            title="Email Drafts"
            value={stats.totalDrafts}
            description="Generated drafts"
            color="bg-purple-500"
            onClick={() => setActiveTab('drafts')}
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6 text-white" />}
            title="Emails Sent"
            value={stats.sentEmails}
            description="Successfully sent"
            color="bg-emerald-500"
          />
        </div>        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading...</span>
              </div>
            )}

            {!loading && (
              <>
                {activeTab === 'templates' && (
                  <EmailTemplateManager onTemplateChange={loadStats} />
                )}

                {activeTab === 'campaigns' && (
                  <CampaignManager 
                    onCampaignSelect={handleCampaignSelect}
                    onCampaignChange={loadStats}
                  />
                )}

                {activeTab === 'contacts' && (
                  <ContactSelector
                    selectedContacts={selectedContacts}
                    onContactsChange={setSelectedContacts}
                    onGenerateDrafts={handleGenerateDrafts}
                    selectedCampaign={selectedCampaign}
                  />
                )}

                {activeTab === 'drafts' && selectedCampaign && (
                  <EmailDraftViewer
                    campaign={selectedCampaign}
                    drafts={campaignDrafts}
                    onDraftsChange={(drafts) => {
                      setCampaignDrafts(drafts);
                      loadStats();
                    }}
                  />
                )}                {activeTab === 'drafts' && !selectedCampaign && (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Campaign Selected</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Select a campaign from the Campaigns tab to view and manage email drafts.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
