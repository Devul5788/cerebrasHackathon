import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckSquare,
  Square,
  Mail,
  Building,
  User,
  Zap,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { outreachApi } from '../../api/outreachActions';
import { Contact, EmailCampaign } from '../../api/types';
import { DraftGenerationModal } from './DraftGenerationModal';

interface ContactSelectorProps {
  selectedContacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
  onGenerateDrafts: (campaignId: number, contactIds: number[]) => void;
  selectedCampaign: EmailCampaign | null;
}

export const ContactSelector: React.FC<ContactSelectorProps> = ({
  selectedContacts,
  onContactsChange,
  onGenerateDrafts,
  selectedCampaign
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: '',
    seniority: '',
    company: '',
    decision_maker: false,
    technical_background: false
  });
  const [generating, setGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, filters]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await outreachApi.getContacts();
      if (response.success) {
        setContacts(response.contacts);
        setError(null);
      } else {
        setError(response.error || 'Failed to load contacts');
      }
    } catch (err) {
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(contact => contact.contact_priority === filters.priority);
    }

    // Seniority filter
    if (filters.seniority) {
      filtered = filtered.filter(contact => contact.seniority_level === filters.seniority);
    }

    // Company filter
    if (filters.company) {
      filtered = filtered.filter(contact =>
        contact.company.name.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    // Decision maker filter
    if (filters.decision_maker) {
      filtered = filtered.filter(contact => contact.decision_maker);
    }

    // Technical background filter
    if (filters.technical_background) {
      filtered = filtered.filter(contact => contact.technical_background);
    }

    setFilteredContacts(filtered);
  };

  const handleContactToggle = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      onContactsChange(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      onContactsChange([...selectedContacts, contact]);
    }
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      onContactsChange([]);
    } else {
      onContactsChange(filteredContacts);
    }
  };
  const handleGenerateDrafts = async () => {
    if (!selectedCampaign) {
      setError('Please select a campaign first');
      return;
    }

    if (selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }

    setShowGenerationModal(true);
  };

  const handleConfirmGeneration = async (settings: any) => {
    try {
      setGenerating(true);
      setError(null);
      setShowGenerationModal(false);
      
      await onGenerateDrafts(settings.campaignId, settings.contactIds);
      onContactsChange([]); // Clear selection after generating
    } catch (err) {
      setError('Failed to generate drafts');
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'primary': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'secondary': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'tertiary': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getSeniorityIcon = (seniority: string) => {
    if (['c_level', 'vp'].includes(seniority)) return <Zap className="h-4 w-4 text-orange-500" />;
    if (['director', 'manager'].includes(seniority)) return <User className="h-4 w-4 text-blue-500" />;
    return <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading contacts...</span>
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select Contacts</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            <Filter className="h-4 w-4 inline mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 inline ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={handleGenerateDrafts}
            disabled={selectedContacts.length === 0 || !selectedCampaign || generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="h-4 w-4 inline mr-2" />
            {generating ? 'Generating...' : `Generate Drafts (${selectedContacts.length})`}
          </button>
        </div>
      </div>      {!selectedCampaign && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please select a campaign from the Campaigns tab before generating email drafts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />          <input
            type="text"
            placeholder="Search contacts by name, title, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  title="Filter by priority level"
                >
                  <option value="">All Priorities</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="tertiary">Tertiary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seniority</label>                <select
                  value={filters.seniority}
                  onChange={(e) => setFilters({ ...filters, seniority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  title="Filter by seniority level"
                >
                  <option value="">All Levels</option>
                  <option value="c_level">C-Level</option>
                  <option value="vp">VP</option>
                  <option value="director">Director</option>
                  <option value="manager">Manager</option>
                  <option value="senior">Senior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="junior">Junior</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  placeholder="Filter by company"
                  value={filters.company}
                  onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.decision_maker}
                    onChange={(e) => setFilters({ ...filters, decision_maker: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Decision Makers</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.technical_background}
                    onChange={(e) => setFilters({ ...filters, technical_background: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Technical</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {filteredContacts.length} of {contacts.length} contacts
        </span>
        {filteredContacts.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {filteredContacts.map((contact) => {
          const isSelected = selectedContacts.some(c => c.id === contact.id);
          return (            <div
              key={contact.id}
              className={`bg-white dark:bg-gray-800 border rounded-lg p-4 cursor-pointer transition-colors ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleContactToggle(contact)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getSeniorityIcon(contact.seniority_level)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{contact.full_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.contact_priority)}`}>
                        {contact.priority_display}
                      </span>
                      {contact.decision_maker && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          Decision Maker
                        </span>
                      )}
                      {contact.technical_background && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Technical
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{contact.company.name}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Personalization: {contact.personalization_score}%</span>
                      {contact.last_contacted && (
                        <span>Last contacted: {new Date(contact.last_contacted).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );        })}
      </div>

      {/* Draft Generation Modal */}
      {selectedCampaign && (
        <DraftGenerationModal
          isOpen={showGenerationModal}
          onClose={() => setShowGenerationModal(false)}
          onConfirm={handleConfirmGeneration}
          campaign={selectedCampaign}
          contacts={selectedContacts}
          loading={generating}
        />
      )}

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Contacts Found</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchTerm || Object.values(filters).some(f => f)
              ? 'Try adjusting your search or filters.'
              : 'No contacts available for email outreach.'}
          </p>
        </div>
      )}
    </div>
  );
};
