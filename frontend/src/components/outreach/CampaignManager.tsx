import React, { useState, useEffect } from 'react';
import {
  Plus,
  Mail,
  Users,
  Send,
  Calendar,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { outreachApi } from '../../api/outreachActions';
import { EmailCampaign } from '../../api/types';

interface CampaignManagerProps {
  onCampaignSelect: (campaign: EmailCampaign) => void;
  onCampaignChange: () => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  onCampaignSelect,
  onCampaignChange
}) => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    created_by: 'Sales Team'
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await outreachApi.getEmailCampaigns();
      if (response.success) {
        setCampaigns(response.campaigns);
        setError(null);
      } else {
        setError(response.error || 'Failed to load campaigns');
      }
    } catch (err) {
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await outreachApi.createEmailCampaign(formData);
      if (response.success) {
        setCampaigns([response.campaign, ...campaigns]);
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          created_by: 'Sales Team'
        });
        onCampaignChange();
        setError(null);
      } else {
        setError(response.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      created_by: campaign.created_by
    });
    setShowCreateForm(true);
  };

  const handleUpdateCampaign = async () => {
    if (!formData.name.trim() || !editingCampaign) {
      setError('Campaign name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await outreachApi.updateEmailCampaign(editingCampaign.id, {
        name: formData.name,
        description: formData.description,
        is_active: editingCampaign.is_active
      });
      
      if (response.success) {
        setCampaigns(campaigns.map(c => 
          c.id === editingCampaign.id ? response.campaign : c
        ));
        setShowCreateForm(false);
        setEditingCampaign(null);
        setFormData({
          name: '',
          description: '',
          created_by: 'Sales Team'
        });
        onCampaignChange();
        setError(null);
      } else {
        setError(response.error || 'Failed to update campaign');
      }
    } catch (err) {
      setError('Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCampaign = async (campaign: EmailCampaign) => {
    if (!window.confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await outreachApi.deleteEmailCampaign(campaign.id);
      
      if (response.success) {
        setCampaigns(campaigns.filter(c => c.id !== campaign.id));
        onCampaignChange();
        setError(null);
      } else {
        setError(response.error || 'Failed to delete campaign');
      }
    } catch (err) {
      setError('Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowCreateForm(false);
    setEditingCampaign(null);
    setFormData({
      name: '',
      description: '',
      created_by: 'Sales Team'
    });
  };
  const ProgressBar: React.FC<{ sent: number; total: number }> = ({ sent, total }) => {
    const percentage = total > 0 ? Math.min(100, Math.max(0, (sent / total) * 100)) : 0;
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (campaign: EmailCampaign) => {
    const sentCount = campaign.sent_count || 0;
    const totalCount = campaign.total_contacts || 0;
    
    if (totalCount === 0) return 'bg-gray-100 text-gray-800';
    if (sentCount === 0) return 'bg-yellow-100 text-yellow-800';
    if (sentCount === totalCount) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (campaign: EmailCampaign) => {
    const sentCount = campaign.sent_count || 0;
    const totalCount = campaign.total_contacts || 0;
    
    if (totalCount === 0) return 'No contacts';
    if (sentCount === 0) return 'Ready to send';
    if (sentCount === totalCount) return 'Complete';
    return 'In progress';
  };

  if (loading && campaigns.length === 0) {    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading campaigns...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Campaigns</h3>        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Create Campaign
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
          </h4>
          <div className="space-y-4">            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Q1 2024 Product Launch Outreach"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the purpose and goals of this campaign"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created By
              </label>
              <input
                type="text"
                value={formData.created_by}
                onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your name or team"
              />
            </div>            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onCampaignSelect(campaign)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{campaign.name}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign)}`}>
                    {getStatusText(campaign)}
                  </span>
                </div>                {campaign.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{campaign.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.total_contacts || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Contacts</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.sent_count || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Emails Sent</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.pending_count || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(campaign.created_at).split(',')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Created by {campaign.created_by}</span>
                  <span>{formatDate(campaign.created_at)}</span>
                </div>
              </div>              <div className="ml-4 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCampaign(campaign);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                  title="Edit campaign"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCampaign(campaign);
                  }}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  title="Delete campaign"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>            {/* Progress Bar */}
            {(campaign.total_contacts || 0) > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <span>Progress</span>
                  <span>
                    {campaign.sent_count || 0} / {campaign.total_contacts || 0}
                  </span>
                </div><ProgressBar 
                  sent={campaign.sent_count || 0} 
                  total={campaign.total_contacts || 0} 
                />
              </div>
            )}
          </div>
        ))}
      </div>      {campaigns.length === 0 && !loading && (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Campaigns</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create your first email campaign to start reaching out to potential customers.
          </p>
        </div>
      )}
    </div>
  );
};
