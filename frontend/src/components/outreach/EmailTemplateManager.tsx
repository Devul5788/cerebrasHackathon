import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { outreachApi } from '../../api/outreachActions';
import { EmailTemplate } from '../../api/types';

interface EmailTemplateManagerProps {
  onTemplateChange: () => void;
}

export const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({
  onTemplateChange
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templateTypeFilter, setTemplateTypeFilter] = useState<'all' | 'initial' | 'follow_up'>('all');
  const [formData, setFormData] = useState({
    name: '',
    offering: '',
    template_type: 'initial' as 'initial' | 'follow_up',
    subject_line: '',
    content: '',
    description: '',
    is_default: false
  });

  const offeringOptions = [
    { value: 'cs3_system', label: 'Cerebras CS-3 System' },
    { value: 'condor_galaxy', label: 'Cerebras Condor Galaxy' },
    { value: 'ai_inference', label: 'Cerebras AI Inference Solution' },
    { value: 'inference_api', label: 'Cerebras Inference API' },
    { value: 'model_studio', label: 'Cerebras AI Model Studio' },
    { value: 'datacenter_rental', label: 'Cerebras Datacenter Rental' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await outreachApi.getEmailTemplates();
      if (response.success) {
        setTemplates(response.templates);
        setError(null);
      } else {
        setError(response.error || 'Failed to load templates');
      }
    } catch (err) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      const response = await outreachApi.createEmailTemplate(formData);
      if (response.success) {
        setTemplates([...templates, response.template]);
        setShowCreateForm(false);
        setFormData({
          name: '',
          offering: '',
          template_type: 'initial',
          subject_line: '',
          content: '',
          description: '',
          is_default: false
        });
        onTemplateChange();
        setError(null);
      } else {
        setError(response.error || 'Failed to create template');
      }
    } catch (err) {
      setError('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (template: EmailTemplate) => {
    try {
      setLoading(true);
      const response = await outreachApi.updateEmailTemplate(template.id, template);
      if (response.success) {
        setTemplates(templates.map(t => t.id === template.id ? response.template : t));
        setEditingTemplate(null);
        onTemplateChange();
        setError(null);
      } else {
        setError(response.error || 'Failed to update template');
      }
    } catch (err) {
      setError('Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await outreachApi.deleteEmailTemplate(templateId);
      if (response.success) {
        setTemplates(templates.filter(t => t.id !== templateId));
        onTemplateChange();
        setError(null);
      } else {
        setError(response.error || 'Failed to delete template');
      }
    } catch (err) {
      setError('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const TemplateForm: React.FC<{
    template?: EmailTemplate;
    onSave: (template: any) => void;
    onCancel: () => void;
  }> = ({ template, onSave, onCancel }) => {
    const [localFormData, setLocalFormData] = useState(
      template || {
        name: '',
        offering: '',
        template_type: 'initial',
        subject_line: '',
        content: '',
        description: '',
        is_default: false
      }
    );

    return (
      <div className="space-y-4">        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={localFormData.name}
              onChange={(e) => setLocalFormData({ ...localFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cerebras Offering
            </label>
            <select
              value={localFormData.offering}
              onChange={(e) => setLocalFormData({ ...localFormData, offering: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              title="Select Cerebras offering"
            >
              <option value="">Select offering</option>
              {offeringOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Type
            </label>
            <select
              value={localFormData.template_type}
              onChange={(e) => setLocalFormData({ ...localFormData, template_type: e.target.value as 'initial' | 'follow_up' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              title="Select template type"
            >
              <option value="initial">Initial Outreach</option>
              <option value="follow_up">Follow-up</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <input
            type="text"
            value={localFormData.description}
            onChange={(e) => setLocalFormData({ ...localFormData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="When to use this template"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject Line
          </label>
          <input
            type="text"
            value={localFormData.subject_line}
            onChange={(e) => setLocalFormData({ ...localFormData, subject_line: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Subject line with variables like {company_name}"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Content
          </label>
          <textarea
            value={localFormData.content}
            onChange={(e) => setLocalFormData({ ...localFormData, content: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Email content with variables like {first_name}, {company_name}, etc."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use variables like {'{first_name}'}, {'{company_name}'}, {'{title}'}, etc. for personalization
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_default"
            checked={localFormData.is_default}
            onChange={(e) => setLocalFormData({ ...localFormData, is_default: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Set as default template for this offering
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={() => onSave(localFormData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {template ? 'Update' : 'Create'} Template
          </button>
        </div>
      </div>
    );
  };
  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Templates</h3>
          <select
            value={templateTypeFilter}
            onChange={(e) => setTemplateTypeFilter(e.target.value as 'all' | 'initial' | 'follow_up')}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Filter templates by type"
          >
            <option value="all">All Templates</option>
            <option value="initial">Initial Outreach</option>
            <option value="follow_up">Follow-up Templates</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Create Template
        </button>
      </div>{showCreateForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Create New Template</h4>
          <TemplateForm
            onSave={handleCreateTemplate}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">        {templates
          .filter(template => templateTypeFilter === 'all' || template.template_type === templateTypeFilter)
          .map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            {editingTemplate?.id === template.id ? (
              <TemplateForm
                template={editingTemplate}
                onSave={handleUpdateTemplate}
                onCancel={() => setEditingTemplate(null)}
              />
            ) : (
              <div>                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          template.template_type === 'follow_up' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {template.template_type === 'follow_up' ? 'Follow-up' : 'Initial'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.offering_display}</p>
                      {template.is_default && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Edit template"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {!template.is_default && (
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {template.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                )}

                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject Line:</h5>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                      {template.subject_line}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Preview:</h5>
                    <div className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 max-h-32 overflow-y-auto">
                      {template.content.substring(0, 300)}
                      {template.content.length > 300 && '...'}
                    </div>
                  </div>

                  {template.placeholder_variables && template.placeholder_variables.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Variables:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.placeholder_variables.map((variable) => (
                          <span
                            key={variable}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          >
                            {'{' + variable + '}'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>      {templates.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Templates</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your first email template to get started.</p>
        </div>
      )}
    </div>
  );
};
