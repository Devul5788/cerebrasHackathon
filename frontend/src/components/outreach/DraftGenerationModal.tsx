import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Clock,
  User,
  Building,
  Calendar,
  Send,
  AlertCircle,
  CheckCircle,
  Settings,
  Eye,
  Edit
} from 'lucide-react';
import { EmailCampaign, Contact, EmailTemplate } from '../../api/types';
import { outreachApi } from '../../api/outreachActions';

interface DraftGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: GenerationSettings) => void;
  campaign: EmailCampaign;
  contacts: Contact[];
  loading?: boolean;
}

interface ContactTemplateMapping {
  contactId: number;
  templateId: number;
  scheduledTime: string;
  customSubject?: string;
}

interface GenerationSettings {
  campaignId: number;
  contactIds: number[];
  globalScheduledTime: string;
  contactMappings: ContactTemplateMapping[];
  sendImmediately: boolean;
}

export const DraftGenerationModal: React.FC<DraftGenerationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  campaign,
  contacts,
  loading = false
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [currentStep, setCurrentStep] = useState<'overview' | 'timing' | 'templates' | 'review'>('overview');
  const [globalScheduledTime, setGlobalScheduledTime] = useState('');
  const [sendImmediately, setSendImmediately] = useState(false);
  const [contactMappings, setContactMappings] = useState<ContactTemplateMapping[]>([]);
  const [previewContact, setPreviewContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      initializeContactMappings();
      // Set default time to 1 hour from now
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      setGlobalScheduledTime(defaultTime.toISOString().slice(0, 16));
    }
  }, [isOpen, contacts]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await outreachApi.getEmailTemplates();
      if (response.success) {
        setTemplates(response.templates);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const initializeContactMappings = () => {
    const mappings = contacts.map(contact => ({
      contactId: contact.id,
      templateId: templates[0]?.id || 0,
      scheduledTime: globalScheduledTime,
      customSubject: undefined
    }));
    setContactMappings(mappings);
  };

  const handleGlobalTimeChange = (time: string) => {
    setGlobalScheduledTime(time);
    // Update all contact mappings
    setContactMappings(prev => 
      prev.map(mapping => ({ ...mapping, scheduledTime: time }))
    );
  };

  const handleContactMappingChange = (contactId: number, field: keyof ContactTemplateMapping, value: any) => {
    setContactMappings(prev =>
      prev.map(mapping =>
        mapping.contactId === contactId
          ? { ...mapping, [field]: value }
          : mapping
      )
    );
  };

  const handleConfirm = () => {
    const settings: GenerationSettings = {
      campaignId: campaign.id,
      contactIds: contacts.map(c => c.id),
      globalScheduledTime,
      contactMappings,
      sendImmediately
    };
    onConfirm(settings);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'primary': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'secondary': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'tertiary': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getSelectedTemplate = (contactId: number) => {
    const mapping = contactMappings.find(m => m.contactId === contactId);
    return templates.find(t => t.id === mapping?.templateId);
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Generate Email Drafts
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Campaign: {campaign.name} • {contacts.length} contacts
                </p>
              </div>
            </div>            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-6">
            <nav className="flex space-x-4">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'timing', label: 'Timing', icon: Clock },
                { id: 'templates', label: 'Templates', icon: Mail },
                { id: 'review', label: 'Review', icon: CheckCircle }
              ].map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = ['overview', 'timing', 'templates', 'review'].indexOf(currentStep) > 
                                  ['overview', 'timing', 'templates', 'review'].indexOf(step.id);
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : isCompleted
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Step Content */}
          <div className="max-h-96 overflow-y-auto">
            {/* Overview Step */}
            {currentStep === 'overview' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Campaign Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{campaign.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">Description:</span>
                      <p className="mt-1 text-gray-900 dark:text-white">{campaign.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Selected Contacts ({contacts.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {contacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{contact.full_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{contact.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{contact.company.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.contact_priority)}`}>
                            {contact.priority_display}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Timing Step */}
            {currentStep === 'timing' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Email Scheduling</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="sendImmediately"
                        checked={sendImmediately}
                        onChange={(e) => setSendImmediately(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sendImmediately" className="text-sm font-medium text-gray-900 dark:text-white">
                        Send immediately after generation
                      </label>
                    </div>

                    {!sendImmediately && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Default Send Time
                        </label>                        <input
                          type="datetime-local"
                          value={globalScheduledTime}
                          onChange={(e) => handleGlobalTimeChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          title="Default send time for all emails"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          This time will be applied to all contacts by default
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {!sendImmediately && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Per-Contact Timing</h5>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {contacts.map(contact => {
                        const mapping = contactMappings.find(m => m.contactId === contact.id);
                        return (
                          <div key={contact.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {contact.full_name}
                              </span>
                            </div>                            <input
                              type="datetime-local"
                              value={mapping?.scheduledTime || globalScheduledTime}
                              onChange={(e) => handleContactMappingChange(contact.id, 'scheduledTime', e.target.value)}
                              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                              title={`Send time for ${contact.full_name}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Templates Step */}
            {currentStep === 'templates' && (
              <div className="space-y-6">
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Loading templates...</span>
                  </div>
                ) : (
                  <>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h4 className="font-medium text-green-900 dark:text-green-100">Template Assignment</h4>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Each contact will be automatically matched with the most appropriate template based on their profile and role.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">Contact-Template Mapping</h5>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {contacts.map(contact => {
                          const mapping = contactMappings.find(m => m.contactId === contact.id);
                          const selectedTemplate = getSelectedTemplate(contact.id);
                          
                          return (
                            <div key={contact.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <User className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{contact.full_name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{contact.title} at {contact.company.name}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.contact_priority)}`}>
                                  {contact.priority_display}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Template
                                  </label>                                  <select
                                    value={mapping?.templateId || ''}
                                    onChange={(e) => handleContactMappingChange(contact.id, 'templateId', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    title={`Email template for ${contact.full_name}`}
                                  >
                                    {templates.map(template => (
                                      <option key={template.id} value={template.id}>
                                        {template.name} ({template.offering_display})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Custom Subject (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={selectedTemplate?.subject_line || 'Default subject will be used'}
                                    value={mapping?.customSubject || ''}
                                    onChange={(e) => handleContactMappingChange(contact.id, 'customSubject', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                              </div>
                              
                              {selectedTemplate && (
                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Template Preview:</p>
                                  <p className="text-sm text-gray-900 dark:text-white font-medium">{selectedTemplate.subject_line}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {selectedTemplate.content.substring(0, 100)}...
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Generation Summary</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Campaign:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{campaign.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Contacts:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{contacts.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Send Mode:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {sendImmediately ? 'Immediate' : 'Scheduled'}
                      </span>
                    </div>
                    {!sendImmediately && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Default Time:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {formatDateTime(globalScheduledTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Final Contact Summary</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {contacts.map(contact => {
                      const mapping = contactMappings.find(m => m.contactId === contact.id);
                      const template = getSelectedTemplate(contact.id);
                      
                      return (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{contact.full_name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {template?.name} • {!sendImmediately ? formatDateTime(mapping?.scheduledTime || globalScheduledTime) : 'Send immediately'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.contact_priority)}`}>
                            {contact.priority_display}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Ready to Generate</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        {contacts.length} personalized email drafts will be created using AI. 
                        {sendImmediately ? ' Emails will be sent immediately.' : ' You can review and edit them before sending.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex space-x-3">
              {currentStep !== 'overview' && (
                <button
                  onClick={() => {
                    const steps = ['overview', 'timing', 'templates', 'review'];
                    const currentIndex = steps.indexOf(currentStep);
                    if (currentIndex > 0) {
                      setCurrentStep(steps[currentIndex - 1] as any);
                    }
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep !== 'review' ? (
                <button
                  onClick={() => {
                    const steps = ['overview', 'timing', 'templates', 'review'];
                    const currentIndex = steps.indexOf(currentStep);
                    if (currentIndex < steps.length - 1) {
                      setCurrentStep(steps[currentIndex + 1] as any);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Generate Drafts</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
