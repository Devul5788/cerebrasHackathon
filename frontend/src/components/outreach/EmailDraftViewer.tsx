import React, { useState, useEffect } from 'react';
import {
  Send,
  Edit,
  Eye,
  Mail,
  Clock,
  CheckCircle,
  X,
  Save,
  User,
  Building,
  Calendar,
  BarChart3,
  Download,
  AlertCircle,
  Bell,
  RefreshCw
} from 'lucide-react';
import { outreachApi } from '../../api/outreachActions';
import { EmailCampaign, EmailDraft } from '../../api/types';

interface EmailDraftViewerProps {
  campaign: EmailCampaign;
  drafts: EmailDraft[];
  onDraftsChange: (drafts: EmailDraft[]) => void;
}

export const EmailDraftViewer: React.FC<EmailDraftViewerProps> = ({
  campaign,
  drafts,
  onDraftsChange
}) => {
  const [selectedDrafts, setSelectedDrafts] = useState<number[]>([]);
  const [previewDraft, setPreviewDraft] = useState<EmailDraft | null>(null);
  const [editingDraft, setEditingDraft] = useState<EmailDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const filteredDrafts = drafts.filter(draft => {
    switch (filter) {
      case 'sent': return draft.status === 'sent';
      case 'pending': return ['draft', 'generated', 'reviewed'].includes(draft.status);
      case 'high_score': return draft.personalization_score >= 70;
      case 'follow_up_scheduled': return draft.follow_up_scheduled && !draft.follow_up_sent;
      case 'follow_up_sent': return draft.follow_up_sent;
      default: return true;
    }
  });

  const handleDraftToggle = (draftId: number) => {
    if (selectedDrafts.includes(draftId)) {
      setSelectedDrafts(selectedDrafts.filter(id => id !== draftId));
    } else {
      setSelectedDrafts([...selectedDrafts, draftId]);
    }
  };

  const handleSelectAll = () => {
    const pendingDrafts = filteredDrafts.filter(d => d.status !== 'sent');
    if (selectedDrafts.length === pendingDrafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(pendingDrafts.map(d => d.id));
    }
  };

  const handleSendSingle = async (draftId: number) => {
    try {
      setLoading(true);
      const response = await outreachApi.sendEmail(draftId);
      if (response.success) {
        // Update the draft in the list
        const updatedDrafts = drafts.map(draft => 
          draft.id === draftId 
            ? { ...draft, status: 'sent', sent_date: response.draft?.sent_date || new Date().toISOString() }
            : draft
        );
        onDraftsChange(updatedDrafts);
        setError(null);
      } else {
        setError(response.error || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulk = async () => {
    if (selectedDrafts.length === 0) return;

    try {
      setLoading(true);
      const response = await outreachApi.sendBulkEmails(selectedDrafts);
      if (response.success) {
        // Update all sent drafts
        const sentDraftIds = response.sent_drafts.map(d => d.draft_id);
        const updatedDrafts = drafts.map(draft => 
          sentDraftIds.includes(draft.id)
            ? { ...draft, status: 'sent', sent_date: new Date().toISOString() }
            : draft
        );
        onDraftsChange(updatedDrafts);
        setSelectedDrafts([]);
        setError(null);
      } else {
        setError(response.error || 'Some emails failed to send');
      }
    } catch (err) {
      setError('Failed to send emails');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDraft = async (draft: EmailDraft) => {
    try {
      setLoading(true);
      const response = await outreachApi.updateEmailDraft(draft.id, {
        subject_line: draft.subject_line,
        content: draft.content,
        status: 'reviewed'
      });
      
      if (response.success) {
        const updatedDrafts = drafts.map(d => 
          d.id === draft.id ? { ...draft, status: 'reviewed' } : d
        );
        onDraftsChange(updatedDrafts);
        setEditingDraft(null);
        setError(null);
      } else {
        setError(response.error || 'Failed to update draft');
      }
    } catch (err) {
      setError('Failed to update draft');
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'reviewed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'generated': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'generated': return <Clock className="h-4 w-4" />;
      case 'failed': return <X className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not sent';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const DraftPreviewModal: React.FC<{ draft: EmailDraft; onClose: () => void }> = ({ draft, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Email Preview</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" title="Close preview">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">            {/* Contact Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Name:</span> <span className="text-gray-900 dark:text-gray-100">{draft.contact.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Title:</span> <span className="text-gray-900 dark:text-gray-100">{draft.contact.title}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Company:</span> <span className="text-gray-900 dark:text-gray-100">{draft.contact.company_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Email:</span> <span className="text-gray-900 dark:text-gray-100">{draft.contact.email}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Campaign:</span> 
                  <span className="text-blue-600 dark:text-blue-400 font-medium ml-1">{campaign.name}</span>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>To:</strong> {draft.contact.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Subject:</strong> {draft.subject_line}
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800">
                <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                  {draft.content}
                </div>
              </div>
            </div>            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium">Template:</span> {draft.template.name}
              </div>
              <div>
                <span className="font-medium">Personalization Score:</span> {draft.personalization_score}%
              </div>
              <div>
                <span className="font-medium">Status:</span> {draft.status_display}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDate(draft.created_at)}
              </div>
              {draft.sent_date && (
                <>
                  <div>
                    <span className="font-medium">Sent:</span> {formatDate(draft.sent_date)}
                  </div>
                  <div>
                    <span className="font-medium">Follow-up:</span> {formatDate(draft.follow_up_date)}
                  </div>
                </>
              )}
              {draft.follow_up_scheduled && !draft.follow_up_sent && (
                <div className="col-span-2">
                  <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                    <Bell className="h-4 w-4" />
                    <span className="font-medium">Follow-up scheduled with template: {draft.follow_up_template?.name}</span>
                  </div>
                </div>
              )}
              {draft.follow_up_sent && (
                <div className="col-span-2">
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <RefreshCw className="h-4 w-4" />
                    <span className="font-medium">Follow-up email has been sent</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          {draft.status !== 'sent' && (
            <>
              <button
                onClick={() => {
                  setEditingDraft(draft);
                  onClose();
                }}
                className="px-4 py-2 text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/20 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Edit className="h-4 w-4 inline mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  handleSendSingle(draft.id);
                  onClose();
                }}
                className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                <Send className="h-4 w-4 inline mr-2" />
                Send Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
  const DraftEditModal: React.FC<{ draft: EmailDraft; onSave: (draft: EmailDraft) => void; onClose: () => void }> = ({ 
    draft, onSave, onClose 
  }) => {
    const [editedDraft, setEditedDraft] = useState(draft);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Email Draft</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Campaign: <span className="text-blue-600 dark:text-blue-400 font-medium">{campaign.name}</span> • 
                Contact: <span className="font-medium">{draft.contact.full_name}</span>
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" title="Close editor">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4">              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={editedDraft.subject_line}
                  onChange={(e) => setEditedDraft({ ...editedDraft, subject_line: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter subject line"
                  title="Email subject line"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Content
                </label>
                <textarea
                  value={editedDraft.content}
                  onChange={(e) => setEditedDraft({ ...editedDraft, content: e.target.value })}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter email content"
                  title="Email content"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editedDraft)}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Save className="h-4 w-4 inline mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Email Outreach</span>
        <span>/</span>
        <span>Campaigns</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">{campaign.name}</span>
        <span>/</span>
        <span>Drafts</span>
      </div>{/* Campaign Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Campaign</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{campaign.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{campaign.description}</p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              All email drafts shown below are for this campaign only
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{drafts.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Campaign Drafts</div>
          </div>
        </div>        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">
              {drafts.filter(d => ['draft', 'generated', 'reviewed'].includes(d.status)).length}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xl font-semibold text-green-600 dark:text-green-400">
              {drafts.filter(d => d.status === 'sent').length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Sent</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-xl font-semibold text-orange-600 dark:text-orange-400">
              {drafts.filter(d => d.follow_up_scheduled && !d.follow_up_sent).length}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Follow-ups Scheduled</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              {Math.round(drafts.reduce((sum, d) => sum + d.personalization_score, 0) / drafts.length || 0)}%
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Avg. Personalization</div>
          </div>
        </div>
      </div>      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Filtering: {campaign.name} Campaign</span>
          </div>
            <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            title="Filter drafts"
          >
            <option value="all">All Drafts</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="high_score">High Personalization (70%+)</option>
            <option value="follow_up_scheduled">Follow-ups Scheduled</option>
            <option value="follow_up_sent">Follow-ups Sent</option>
          </select>

          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            {selectedDrafts.length > 0 ? 'Deselect All' : 'Select All Pending'}
          </button>
        </div>

        <button
          onClick={handleSendBulk}
          disabled={selectedDrafts.length === 0 || loading}
          className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4 inline mr-2" />
          {loading ? 'Sending...' : `Send Selected (${selectedDrafts.length})`}
        </button>
      </div>

      {/* Drafts List */}
      <div className="space-y-3">
        {filteredDrafts.map((draft) => {
          const isSelected = selectedDrafts.includes(draft.id);
          const canSelect = draft.status !== 'sent';

          return (            <div
              key={draft.id}
              className={`bg-white dark:bg-gray-800 border rounded-lg p-4 ${
                isSelected ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
            >              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {canSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleDraftToggle(draft.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      title={`Select draft for ${draft.contact.full_name}`}
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {draft.contact.full_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{draft.contact.title}</p>
                      </div>
                    </div>                    <div className="mt-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{draft.contact.company_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span className="truncate max-w-xs">{draft.subject_line}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs font-medium">{campaign.name}</span>
                        </div>
                      </div>
                    </div>                    {draft.sent_date && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Sent: {formatDate(draft.sent_date)}</span>
                        {draft.follow_up_date && (
                          <>
                            <span>•</span>
                            <span>Follow-up: {formatDate(draft.follow_up_date)}</span>
                          </>
                        )}
                        {draft.follow_up_scheduled && !draft.follow_up_sent && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                              <Bell className="h-3 w-3" />
                              <span className="font-medium">Follow-up scheduled</span>
                            </div>
                          </>
                        )}
                        {draft.follow_up_sent && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                              <RefreshCw className="h-3 w-3" />
                              <span className="font-medium">Follow-up sent</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(draft.status)}`}>
                        {getStatusIcon(draft.status)}
                        <span className="ml-1">{draft.status_display}</span>
                      </span>
                      {draft.follow_up_scheduled && !draft.follow_up_sent && draft.status === 'sent' && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                          <Bell className="h-3 w-3" />
                          <span>Follow-up</span>
                        </div>
                      )}
                      {draft.follow_up_sent && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                          <RefreshCw className="h-3 w-3" />
                          <span>Followed up</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {draft.personalization_score}% personalized
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewDraft(draft)}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {draft.status !== 'sent' && (
                      <>
                        <button
                          onClick={() => setEditingDraft(draft)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendSingle(draft.id)}
                          disabled={loading}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-50"
                          title="Send"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>      {filteredDrafts.length === 0 && (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No Drafts Found</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? `No email drafts have been generated for the "${campaign.name}" campaign yet.`
              : `No drafts in the "${campaign.name}" campaign match the current filter: ${filter}.`}
          </p>
          {filter === 'all' && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Go to the Contacts tab to select contacts and generate drafts for this campaign.
            </p>
          )}
        </div>
      )}

      {/* Modals */}
      {previewDraft && (
        <DraftPreviewModal
          draft={previewDraft}
          onClose={() => setPreviewDraft(null)}
        />
      )}

      {editingDraft && (
        <DraftEditModal
          draft={editingDraft}
          onSave={handleUpdateDraft}
          onClose={() => setEditingDraft(null)}
        />
      )}
    </div>
  );
};
