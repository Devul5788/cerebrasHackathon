import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApiState } from '../../api/hooks';
import { 
  companiesApi, 
  Company, 
  CompanyListResponse, 
  CustomerReportResponse,
  Report
} from '../../api/companiesActions';

const CompanyDashboard: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);  const [filters, setFilters] = useState({
    priority: '',
    min_fit_score: '',
    industry: '',
    has_contacts: ''
  });
  const [sortBy, setSortBy] = useState('date_desc'); // Add sorting state
  const [companiesState, executeGetCompanies] = useApiState<CompanyListResponse>();  const [reportState, executeGenerateReport] = useApiState<CustomerReportResponse>();
  const [deleteState, executeDeleteCompany] = useApiState<{ success: boolean; message: string }>();
  
  // Report editing state
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [reportTitle, setReportTitle] = useState<string>('');  useEffect(() => {
    loadCompanies();
  }, []);

  const loadComprehensiveReport = async () => {
    try {
      // Check if there's an existing comprehensive report
      const reports = await companiesApi.getReports({ 
        report_type: 'comprehensive' 
      });
      
      if (reports.success && reports.reports.length > 0) {
        // Use the most recent comprehensive report
        const latestReport = reports.reports[0];
        executeGenerateReport(() => Promise.resolve({
          success: true,
          comprehensive_report: latestReport.content,
          report_id: latestReport.id
        } as CustomerReportResponse));
      }
    } catch (error) {
      console.error('Failed to load comprehensive report:', error);
    }
  };

  const loadCompanies = async () => {
    const filterParams: any = {};
    if (filters.priority) filterParams.priority = filters.priority;
    if (filters.min_fit_score) filterParams.min_fit_score = parseInt(filters.min_fit_score);
    if (filters.industry) filterParams.industry = filters.industry;
    if (filters.has_contacts) filterParams.has_contacts = filters.has_contacts === 'true';

    await executeGetCompanies(() => companiesApi.getCompanies(filterParams));
  };  const generateReport = async (companyId?: number) => {
    try {
      await executeGenerateReport(() => 
        companiesApi.generateCustomerReport(companyId ? { company_id: companyId } : {})
      );
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };
  const deleteCompany = async (companyId: number) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      await executeDeleteCompany(() => companiesApi.deleteCompany(companyId));
      if (selectedCompany?.id === companyId) {
        setSelectedCompany(null);
      }
      // Reload companies list
      loadCompanies();
    }
  };
  const loadCompanyReport = async (companyId: number) => {
    try {
      // Check if there's an existing report for this company using the new endpoint
      const reportResponse = await companiesApi.getCompanyReport(companyId);
      
      if (reportResponse.success && reportResponse.has_existing_report) {
        // Use the existing report
        executeGenerateReport(() => Promise.resolve({
          success: true,
          company_id: companyId,
          company_name: reportResponse.company_name,
          report: reportResponse.report,
          report_id: reportResponse.report_id
        } as CustomerReportResponse));
      }
    } catch (error) {
      console.error('Failed to load company report:', error);
    }
  };

  const startEditingReport = (report: Report) => {
    setEditingReport(report);
    setReportContent(report.content);
    setReportTitle(report.title);
  };  const saveReport = async () => {
    if (!editingReport) return;
    
    try {      await companiesApi.updateReport(editingReport.id, {
        title: reportTitle,
        content: reportContent
      });
      setEditingReport(null);
      
      // If this was a company-specific report, regenerate/refresh the report display
      if (editingReport.company_id && selectedCompany?.id === editingReport.company_id) {
        // Fetch the updated report for display
        try {
          const updatedReport = await companiesApi.getReport(editingReport.id);
          if (updatedReport.success) {
            // Update the reportState to show the edited report
            executeGenerateReport(() => Promise.resolve({
              success: true,
              company_id: editingReport.company_id,
              company_name: editingReport.company_name,
              report: updatedReport.report.content,
              report_id: updatedReport.report.id
            } as CustomerReportResponse));
          }
        } catch (error) {
          console.error('Failed to fetch updated report:', error);
        }
      } else if (editingReport.report_type === 'comprehensive') {
        // For comprehensive reports, update the comprehensive report display
        try {
          const updatedReport = await companiesApi.getReport(editingReport.id);
          if (updatedReport.success) {
            executeGenerateReport(() => Promise.resolve({
              success: true,
              comprehensive_report: updatedReport.report.content,
              report_id: updatedReport.report.id
            } as CustomerReportResponse));
          }
        } catch (error) {
          console.error('Failed to fetch updated comprehensive report:', error);
        }
      }
      
      alert('Report saved successfully!');
    } catch (error) {
      console.error('Failed to save report:', error);
      alert('Failed to save report. Please try again.');
    }
  };

  const cancelEditingReport = () => {
    setEditingReport(null);
    setReportContent('');
    setReportTitle('');
  };
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900';
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900';
      case 'low': return 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };
  const companies = companiesState.data?.companies || [];
  
  // Sort companies based on selected sort option
  const sortedCompanies = [...companies].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'fit_score_desc':
        return b.cerebras_fit_score - a.cerebras_fit_score;
      case 'fit_score_asc':
        return a.cerebras_fit_score - b.cerebras_fit_score;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });  // Enhanced styles for ReactMarkdown rendering with dark mode support
  const markdownStyles = `
    .markdown-content h1 { 
      font-size: 1.875rem; 
      font-weight: bold; 
      margin: 1.5rem 0 1rem 0; 
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb; 
      padding-bottom: 0.5rem; 
    }
    .dark .markdown-content h1 { 
      color: #f9fafb;
      border-bottom-color: #4b5563; 
    }
    .markdown-content h2 { 
      font-size: 1.5rem; 
      font-weight: bold; 
      margin: 1.25rem 0 0.75rem 0; 
      color: #374151; 
      border-bottom: 1px solid #e5e7eb; 
      padding-bottom: 0.25rem; 
    }
    .dark .markdown-content h2 { 
      color: #e5e7eb;
      border-bottom-color: #4b5563; 
    }
    .markdown-content h3 { 
      font-size: 1.25rem; 
      font-weight: 600; 
      margin: 1rem 0 0.5rem 0; 
      color: #4b5563; 
    }
    .dark .markdown-content h3 { 
      color: #d1d5db; 
    }
    .markdown-content h4 { 
      font-size: 1.125rem; 
      font-weight: 600; 
      margin: 0.75rem 0 0.5rem 0; 
      color: #6b7280; 
    }
    .dark .markdown-content h4 { 
      color: #9ca3af; 
    }
    .markdown-content p { 
      margin: 0.75rem 0; 
      line-height: 1.6; 
      color: #374151;
    }
    .dark .markdown-content p { 
      color: #d1d5db;
    }
    .markdown-content ul, .markdown-content ol { 
      margin: 0.75rem 0; 
      padding-left: 1.5rem; 
      color: #374151;
    }
    .dark .markdown-content ul, .dark .markdown-content ol { 
      color: #d1d5db;
    }
    .markdown-content li { 
      margin: 0.25rem 0; 
      line-height: 1.5;
    }
    .markdown-content strong, .markdown-content b { 
      font-weight: 600; 
      color: #1f2937;
    }
    .dark .markdown-content strong, .dark .markdown-content b { 
      color: #f9fafb;
    }
    .markdown-content em, .markdown-content i { 
      font-style: italic; 
    }
    .markdown-content code { 
      background-color: #f3f4f6; 
      padding: 0.125rem 0.25rem; 
      border-radius: 0.25rem; 
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      color: #1f2937;
    }
    .dark .markdown-content code { 
      background-color: #374151; 
      color: #e5e7eb;
    }
    .markdown-content pre { 
      background-color: #f8fafc; 
      padding: 1rem; 
      border-radius: 0.5rem; 
      overflow-x: auto; 
      border: 1px solid #e2e8f0;
      margin: 1rem 0;
    }
    .dark .markdown-content pre { 
      background-color: #1f2937; 
      border-color: #4b5563;
    }
    .markdown-content pre code { 
      background: none; 
      padding: 0; 
      border-radius: 0; 
    }
    .markdown-content blockquote { 
      border-left: 4px solid #3b82f6; 
      padding-left: 1rem; 
      margin: 1rem 0; 
      color: #4b5563; 
      font-style: italic;
      background-color: #f8fafc;
      padding: 1rem;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .dark .markdown-content blockquote { 
      background-color: #1f2937; 
      color: #9ca3af;
      border-left-color: #60a5fa;
    }
    .markdown-content table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 1rem 0; 
    }
    .markdown-content th, .markdown-content td { 
      padding: 0.5rem; 
      border: 1px solid #e5e7eb; 
      text-align: left; 
    }
    .dark .markdown-content th, .dark .markdown-content td { 
      border-color: #4b5563;
    }
    .markdown-content th { 
      background-color: #f9fafb; 
      font-weight: 600; 
    }
    .dark .markdown-content th { 
      background-color: #374151; 
    }
    .markdown-content hr { 
      border: none; 
      border-top: 2px solid #e5e7eb; 
      margin: 2rem 0; 
    }
    .dark .markdown-content hr { 
      border-top-color: #4b5563; 
    }
  `;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <style dangerouslySetInnerHTML={{ __html: markdownStyles }} />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage and analyze your researched companies</p>
            </div>            <div className="flex space-x-4">
              <button
                onClick={() => generateReport()}
                disabled={reportState.loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {reportState.loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                Generate Comprehensive Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 h-[calc(100vh-12rem)]">
          {/* Left Sidebar - Company List */}
          <div className="w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">            {/* Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Companies ({sortedCompanies.length})</h2>              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    aria-label="Filter by priority"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={filters.min_fit_score}
                    onChange={(e) => setFilters({ ...filters, min_fit_score: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    aria-label="Filter by minimum fit score"
                  >
                    <option value="">Min Fit Score</option>
                    <option value="8">8+</option>
                    <option value="6">6+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Industry"
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    aria-label="Filter by industry"
                  />
                  <select
                    value={filters.has_contacts}
                    onChange={(e) => setFilters({ ...filters, has_contacts: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    aria-label="Filter by contact availability"
                  >
                    <option value="">All Contacts</option>
                    <option value="true">Has Contacts</option>
                    <option value="false">No Contacts</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    aria-label="Sort companies by"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                    <option value="fit_score_desc">Highest Fit Score</option>
                    <option value="fit_score_asc">Lowest Fit Score</option>
                  </select>
                </div>
                <button
                  onClick={loadCompanies}
                  disabled={companiesState.loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {companiesState.loading ? 'Loading...' : 'Apply Filters'}
                </button>
              </div>
            </div>

            {/* Company List */}
            <div className="flex-1 overflow-y-auto">
              {companiesState.loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>                </div>              ) : sortedCompanies.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No companies found</p>
                  <p className="text-sm mt-2">Try adjusting your filters or research some companies first</p>
                </div>
              ) : (                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {sortedCompanies.map((company) => (
                    <div
                      key={company.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedCompany?.id === company.id ? 'bg-blue-50 dark:bg-blue-900 border-r-4 border-blue-500' : ''
                      }`}
                    ><div 
                        onClick={() => {
                          setSelectedCompany(company);
                          // Load existing report for this company
                          loadCompanyReport(company.id);
                        }}
                        className="cursor-pointer"
                      >                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{company.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(company.outreach_priority)}`}>
                            {company.outreach_priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">{company.industry}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Researched: {new Date(company.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getFitScoreColor(company.cerebras_fit_score)}`}>
                              {company.cerebras_fit_score}/10
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{company.contacts_count} contacts</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{company.outreach_readiness}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCompany(company.id);
                          }}
                          disabled={deleteState.loading}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
                        >
                          {deleteState.loading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>          {/* Right Panel - Company Details */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {selectedCompany ? (
              <div className="h-full flex flex-col">
                {/* Company Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{selectedCompany.website}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateReport(selectedCompany.id)}
                        disabled={reportState.loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        {reportState.loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : null}
                        Generate Report
                      </button>
                    </div>
                  </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Fit Score</div>
                      <div className={`text-xl font-bold ${getFitScoreColor(selectedCompany.cerebras_fit_score)}`}>
                        {selectedCompany.cerebras_fit_score}/10
                      </div>
                    </div>                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Readiness</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{selectedCompany.outreach_readiness}</div>
                    </div>                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Contacts</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">{selectedCompany.contacts_count}</div>
                    </div>                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Priority</div>
                      <div className={`text-xl font-bold ${
                        selectedCompany.outreach_priority.toLowerCase() === 'high' ? 'text-red-600 dark:text-red-400' :
                        selectedCompany.outreach_priority.toLowerCase() === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        selectedCompany.outreach_priority.toLowerCase() === 'low' ? 'text-green-600 dark:text-green-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {selectedCompany.outreach_priority}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-8">                    {/* Basic Information */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Overview</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedCompany.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Industry:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.industry}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Sector:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.sector}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Founded:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.founded_year}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Employees:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.employee_count}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Location:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.headquarters_location}</span></div>                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Revenue:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.revenue}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">IPO Status:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.ipo_status}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Total Funding:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.total_funding || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Business Model:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.business_model}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Employee Count (Exact):</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.employee_count_exact || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Research Quality Score:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.research_quality_score}/10</span></div>
                          <div><span className="font-medium text-gray-900 dark:text-gray-100">Data Science Team Size:</span> <span className="text-gray-700 dark:text-gray-300">{selectedCompany.data_science_team_size || 'N/A'}</span></div>
                        </div>
                      </div>
                    </section>                    {/* Key Products & Technologies */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Products & Technologies</h3>
                      <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                        <div className="mb-4">
                          <span className="font-medium text-purple-900 dark:text-purple-200">Key Products:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCompany.key_products.map((product, index) => (
                              <span key={index} className="bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
                                {product}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <span className="font-medium text-purple-900 dark:text-purple-200">Key Technologies:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCompany.key_technologies.map((tech, index) => (
                              <span key={index} className="bg-purple-300 dark:bg-purple-600 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-purple-900 dark:text-purple-200">Competitors:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCompany.competitors.map((competitor, index) => (
                              <span key={index} className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
                                {competitor}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>                    {/* Cerebras Analysis */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cerebras Analysis</h3>
                      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                        <div className="mb-4">
                          <span className="font-medium text-blue-900 dark:text-blue-200">Recommended Product:</span>
                          <span className="text-blue-700 dark:text-blue-300 ml-2">{selectedCompany.recommended_cerebras_product}</span>
                        </div>
                        <div className="mb-4">
                          <span className="font-medium text-blue-900 dark:text-blue-200">Value Proposition:</span>
                          <p className="text-blue-700 dark:text-blue-300 mt-1">{selectedCompany.cerebras_value_proposition}</p>
                        </div>
                        <div className="mb-4">
                          <span className="font-medium text-blue-900 dark:text-blue-200">Implementation Timeline:</span>
                          <span className="text-blue-700 dark:text-blue-300 ml-2">{selectedCompany.implementation_timeline}</span>
                        </div>
                        <div className="mb-4">
                          <span className="font-medium text-blue-900 dark:text-blue-200">Estimated Budget:</span>
                          <span className="text-blue-700 dark:text-blue-300 ml-2">{selectedCompany.estimated_budget_range || 'To be determined'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-900 dark:text-blue-200">Potential Use Cases:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCompany.potential_use_cases.map((useCase, index) => (
                              <span key={index} className="bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                                {useCase}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>                    {/* AI/ML Information */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI/ML Profile</h3>
                      <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                        <div className="mb-4">
                          <span className="font-medium text-green-900 dark:text-green-200">Current Usage:</span>
                          <p className="text-green-700 dark:text-green-300 mt-1">{selectedCompany.ai_ml_usage}</p>
                        </div>
                        <div className="mb-4">
                          <span className="font-medium text-green-900 dark:text-green-200">Infrastructure:</span>
                          <p className="text-green-700 dark:text-green-300 mt-1">{selectedCompany.current_ai_infrastructure}</p>
                        </div>
                        <div className="mb-4">
                          <span className="font-medium text-green-900 dark:text-green-200">AI Initiatives:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCompany.ai_initiatives.map((initiative, index) => (
                              <span key={index} className="bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                                {initiative}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <span className="font-medium text-green-900 dark:text-green-200">ML Use Cases:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCompany.ml_use_cases.map((useCase, index) => (
                              <span key={index} className="bg-green-300 dark:bg-green-600 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                                {useCase}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-green-900 dark:text-green-200">Data Science Team Size:</span>
                          <span className="text-green-700 dark:text-green-300 ml-2">{selectedCompany.data_science_team_size || 'Not specified'}</span>
                        </div>
                      </div>
                    </section>                    {/* Research Information */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Research Information</h3>
                      <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
                        <div className="mb-4">
                          <span className="font-medium text-orange-900 dark:text-orange-200">Research Sources:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCompany.research_sources.map((source, index) => (
                              <span key={index} className="bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs">
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-orange-900 dark:text-orange-200">Created:</span>
                            <span className="text-orange-700 dark:text-orange-300 ml-2">
                              {new Date(selectedCompany.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-orange-900 dark:text-orange-200">Updated:</span>
                            <span className="text-orange-700 dark:text-orange-300 ml-2">
                              {new Date(selectedCompany.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>                    {/* Contacts */}
                    {selectedCompany.contacts.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Contacts</h3>
                        <div className="space-y-3">
                          {selectedCompany.contacts.map((contact) => (
                            <div key={contact.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{contact.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{contact.title}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.contact_priority)}`}>
                                  {contact.contact_priority}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <div>Email: {contact.email}</div>
                                <div>Seniority: {contact.seniority_level}</div>
                                <div>Decision Maker: {contact.decision_maker ? 'Yes' : 'No'}</div>
                                <div>Technical: {contact.technical_background ? 'Yes' : 'No'}</div>
                                <div>Influence: {contact.influence_level}</div>
                                <div>Research Quality: {contact.research_quality_score}/10</div>
                              </div>
                              <div className="text-sm">
                                <div className="mb-2">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Personalization Score:</span>
                                  <span className="ml-2 text-gray-600 dark:text-gray-400">{contact.personalization_score}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">AI/ML Experience:</span>
                                  <p className="mt-1 text-gray-600 dark:text-gray-400">{contact.ai_ml_experience}</p>
                                </div>
                                {contact.linkedin_url && (
                                  <div className="mt-2">
                                    <a 
                                      href={contact.linkedin_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                                    >
                                      LinkedIn Profile →
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}                    {/* Generated Report */}
                    {reportState.data && reportState.data.company_id === selectedCompany.id && (
                      <section>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Generated Customer Analysis Report</h3>
                          <button
                            onClick={() => {
                              if (reportState.data?.report_id) {
                                // Extract content properly from report data
                                const reportData: Report = {
                                  id: reportState.data.report_id,
                                  title: `Customer Analysis Report - ${selectedCompany.name}`,
                                  report_type: 'company',
                                  content: reportState.data.report,
                                  metadata: {},
                                  company_id: selectedCompany.id,
                                  company_name: selectedCompany.name,
                                  generated_at: new Date().toISOString(),
                                  last_edited_at: new Date().toISOString(),
                                  is_edited: false
                                };
                                startEditingReport(reportData);
                              }
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            Edit Report
                          </button>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700">
                          <div className="prose prose-sm max-w-none">
                            {typeof reportState.data.report === 'string' ? (
                              <div className="markdown-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {reportState.data.report}
                                </ReactMarkdown>
                              </div>
                            ) : typeof reportState.data.report === 'object' ? (
                              <div className="space-y-4">
                                {reportState.data.report.company_name && (
                                  <div className="border-b border-yellow-300 dark:border-yellow-600 pb-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Company: {reportState.data.report.company_name}</h4>
                                  </div>
                                )}
                                {reportState.data.report.generated_at && (
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Generated:</span> {new Date(reportState.data.report.generated_at).toLocaleString()}
                                  </div>
                                )}
                                {reportState.data.report.report_content && (
                                  <div className="markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {reportState.data.report.report_content}
                                    </ReactMarkdown>
                                  </div>
                                )}
                                {reportState.data.report.data_sources && reportState.data.report.data_sources.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-yellow-300 dark:border-yellow-600">
                                    <span className="font-semibold text-gray-900 dark:text-white">Data Sources:</span>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                      {reportState.data.report.data_sources.map((source: string, index: number) => (
                                        <li key={index} className="text-gray-700 dark:text-gray-300">{source}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-600 dark:text-gray-400">Report data is not in expected format</p>
                            )}
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📧</div>
                  <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Select a Company</h3>
                  <p>Choose a company from the list to view detailed information and generate reports</p>
                </div>
              </div>
            )}
          </div>
        </div>        {/* Comprehensive Report Modal/Section */}
        {reportState.data && reportState.data.comprehensive_report && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-600">
              {/* Header - Fixed */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Comprehensive Customer Analysis Report</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (reportState.data?.report_id) {
                          let content = '';
                  
                          const compReport = reportState.data.comprehensive_report;
                          if (compReport) {
                            if (typeof compReport === 'string') {
                              content = compReport;
                            } else if (compReport.report_content) {
                              content = compReport.report_content;
                            } else {
                              content = JSON.stringify(compReport, null, 2);
                            }
                          }
                  
                          const reportData: Report = {
                            id: reportState.data.report_id,
                            title: 'Comprehensive Customer Analysis Report',
                            report_type: 'comprehensive',
                            content,
                            metadata: {},
                            company_id: undefined,
                            company_name: undefined,
                            generated_at: new Date().toISOString(),
                            last_edited_at: new Date().toISOString(),
                            is_edited: false
                          };
                  
                          startEditingReport(reportData);
                        }
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Edit Report
                    </button>
                  
                    <button
                      type="button"
                      onClick={() =>
                        executeGenerateReport(() =>
                          Promise.resolve({
                            success: true,
                            report: undefined,
                            company_id: undefined,
                            comprehensive_report: undefined
                          } as CustomerReportResponse)
                        )
                      }
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Detailed strategic analysis and engagement recommendations</p>
              </div>
              
              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="prose prose-lg max-w-none">
                  {typeof reportState.data.comprehensive_report === 'string' ? (
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {reportState.data.comprehensive_report}
                      </ReactMarkdown>
                    </div>                  ) : typeof reportState.data.comprehensive_report === 'object' ? (
                    // First check if this object has report_content field with markdown
                    reportState.data.comprehensive_report.report_content ? (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {reportState.data.comprehensive_report.report_content}
                        </ReactMarkdown>
                      </div>
                      ) : (
                    <div className="space-y-8">                      {/* Generated At */}
                      {reportState.data.comprehensive_report.generated_at && (
                        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-400 dark:border-blue-600">
                          <div className="flex items-center">
                            <span className="text-blue-800 dark:text-blue-200 font-semibold mr-2">📅 Generated:</span>
                            <span className="text-blue-700 dark:text-blue-300">
                              {(() => {
                                try {
                                  // Handle case where date might have extra quotes
                                  let dateString = reportState.data.comprehensive_report.generated_at;
                                  if (typeof dateString === 'string') {
                                    // Remove extra quotes if they exist
                                    dateString = dateString.replace(/^["']|["']$/g, '');
                                  }
                                  const date = new Date(dateString);
                                  return date.toLocaleString();
                                } catch (error) {
                                  return reportState.data.comprehensive_report.generated_at;
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      )}{/* Pipeline Metrics Overview */}
                      {reportState.data.comprehensive_report.pipeline_metrics && (
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 rounded-2xl p-8 border border-blue-200 dark:border-blue-700 shadow-lg">                          <div className="text-center mb-8">
                            <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
                              <span className="text-4xl mr-3">📊</span>
                              Sales Pipeline Overview
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">Your complete customer opportunity analysis</p>
                          </div>
                          
                          {/* Main Metrics Cards */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-600">
                              <div className="text-3xl mb-2">🏢</div>
                              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {reportState.data.comprehensive_report.pipeline_metrics.total_companies}
                              </div>
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Companies</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">In Pipeline</div>
                            </div>
                              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow border border-green-100 dark:border-green-800 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full -mr-8 -mt-8"></div>
                              <div className="text-3xl mb-2">🎯</div>
                              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                {reportState.data.comprehensive_report.pipeline_metrics.high_fit_companies}
                              </div>
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">High Fit</div>
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">Priority Targets</div>
                            </div>
                              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow border border-yellow-100 dark:border-yellow-800 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full -mr-8 -mt-8"></div>
                              <div className="text-3xl mb-2">⚡</div>
                              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                                {reportState.data.comprehensive_report.pipeline_metrics.medium_fit_companies}
                              </div>
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium Fit</div>
                              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">Good Prospects</div>
                            </div>
                              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-600 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full -mr-8 -mt-8"></div>
                              <div className="text-3xl mb-2">📋</div>
                              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                                {reportState.data.comprehensive_report.pipeline_metrics.low_fit_companies}
                              </div>
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Fit</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Future Potential</div>
                            </div>
                          </div>                          {/* Pipeline Health Indicator */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-600 shadow-md">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                <span className="text-xl mr-2">💪</span>
                                Pipeline Health Score
                              </h5>
                              <div className="text-right">
                                {(() => {
                                  const healthScore = Math.round((reportState.data.comprehensive_report.pipeline_metrics.high_fit_companies / reportState.data.comprehensive_report.pipeline_metrics.total_companies) * 100);
                                  return (
                                    <>
                                      <div className={`text-2xl font-bold ${
                                        healthScore >= 70 ? 'text-green-600 dark:text-green-400' : 
                                        healthScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                      }`}>
                                        {healthScore}%
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">High-Quality Leads</div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  Math.round((reportState.data.comprehensive_report.pipeline_metrics.high_fit_companies / reportState.data.comprehensive_report.pipeline_metrics.total_companies) * 100) >= 70 ? 'bg-green-500' : 
                                  Math.round((reportState.data.comprehensive_report.pipeline_metrics.high_fit_companies / reportState.data.comprehensive_report.pipeline_metrics.total_companies) * 100) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${Math.round((reportState.data.comprehensive_report.pipeline_metrics.high_fit_companies / reportState.data.comprehensive_report.pipeline_metrics.total_companies) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>                          {/* Industry Breakdown */}
                          {reportState.data.comprehensive_report.pipeline_metrics.industry_breakdown && (
                            <div className="mb-8">                              <div className="text-center mb-6">
                                <h5 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center justify-center">
                                  <span className="text-2xl mr-2">🏭</span>
                                  Industry Breakdown
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300">Distribution of opportunities across different sectors</p>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">                                {Object.entries(reportState.data.comprehensive_report.pipeline_metrics.industry_breakdown).map(([industry, data]: [string, any]) => (
                                  <div key={industry} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    <div className="flex justify-between items-center mb-4">
                                      <div>
                                        <h6 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{industry}</h6>
                                        <div className="flex items-center space-x-4 text-sm">
                                          <span className="flex items-center text-blue-600 dark:text-blue-400">
                                            <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-1"></span>
                                            <strong>{data.count}</strong> Companies
                                          </span>
                                          <span className="flex items-center text-green-600 dark:text-green-400">
                                            <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-1"></span>
                                            <strong>{data.avg_fit_score?.toFixed(1) || 'N/A'}</strong> Avg Fit
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className={`text-2xl font-bold ${
                                          data.avg_fit_score >= 8 ? 'text-green-600 dark:text-green-400' :
                                          data.avg_fit_score >= 6 ? 'text-yellow-600 dark:text-yellow-400' :
                                          'text-red-600 dark:text-red-400'
                                        }`}>
                                          {data.avg_fit_score?.toFixed(1) || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Fit Score</div>
                                      </div>
                                    </div>
                                    
                                    {data.companies && data.companies.length > 0 && (                                      <div>
                                        <div className="border-t border-gray-100 dark:border-gray-600 pt-3">
                                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Key Companies</div>
                                        </div>
                                        {data.companies.slice(0, 3).map((company: any, idx: number) => (
                                          <div key={idx} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 flex justify-between items-center hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-800 dark:hover:to-indigo-800 transition-colors">
                                            <div className="flex-1">
                                              <div className="font-semibold text-gray-900 dark:text-white text-sm">{company.name}</div>
                                              <div className="text-xs text-gray-600 dark:text-gray-300">{company.employee_count}</div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-3">
                                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                company.fit_score >= 8 ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' :
                                                company.fit_score >= 6 ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                                                'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                                              }`}>
                                                {company.fit_score}/10
                                              </span>
                                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                company.priority === 'high' ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200' :
                                                company.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                                                'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                                              }`}>
                                                {company.priority?.toUpperCase()}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                        {data.companies.length > 3 && (
                                          <div className="text-center py-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
                                              +{data.companies.length - 3} more companies
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}                          {/* Product Breakdown */}
                          {reportState.data.comprehensive_report.pipeline_metrics.product_breakdown && (
                            <div>                              <div className="text-center mb-6">
                                <h5 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center justify-center">
                                  <span className="text-2xl mr-2">🚀</span>
                                  Product Recommendations
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300">Cerebras product fit analysis across your pipeline</p>
                              </div>
                              <div className="space-y-6">                                {Object.entries(reportState.data.comprehensive_report.pipeline_metrics.product_breakdown).map(([product, data]: [string, any]) => (
                                  <div key={product} className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-blue-500 dark:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex justify-between items-center mb-4">
                                      <div>
                                        <h6 className="font-bold text-xl text-blue-900 dark:text-blue-200 mb-1">{product}</h6>
                                        <div className="flex items-center space-x-4 text-sm">
                                          <span className="flex items-center text-gray-600 dark:text-gray-300">
                                            <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-1"></span>
                                            <strong>{data.count}</strong> Companies
                                          </span>
                                          <span className="flex items-center text-blue-600 dark:text-blue-400">
                                            <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-1"></span>
                                            <strong>{data.avg_fit_score?.toFixed(1) || 'N/A'}</strong> Avg Fit
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className={`text-3xl font-bold ${
                                          data.avg_fit_score >= 8 ? 'text-green-600 dark:text-green-400' :
                                          data.avg_fit_score >= 6 ? 'text-yellow-600 dark:text-yellow-400' :
                                          'text-red-600 dark:text-red-400'
                                        }`}>
                                          {data.avg_fit_score?.toFixed(1) || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Average Fit</div>
                                      </div>
                                    </div>
                                    
                                    {data.companies && data.companies.length > 0 && (                                      <div>
                                        <div className="border-t border-blue-100 dark:border-blue-700 pt-4 mb-4">
                                          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">Target Companies</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                          {data.companies.slice(0, 6).map((company: any, idx: number) => (
                                            <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-800 dark:to-indigo-800 rounded-lg p-4 border border-blue-100 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:scale-105">
                                              <div className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-1">{company.name}</div>
                                              <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">{company.industry}</div>
                                              <div className="flex justify-between items-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                  company.fit_score >= 8 ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' :
                                                  company.fit_score >= 6 ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                                                  'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                                                }`}>
                                                  Fit: {company.fit_score}/10
                                                </span>
                                                {company.budget_range && (
                                                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">💰 Budget Available</span>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        {data.companies.length > 6 && (
                                          <div className="text-center mt-4">
                                            <span className="text-sm text-blue-600 dark:text-blue-400 italic bg-blue-50 dark:bg-blue-800 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-600">
                                              +{data.companies.length - 6} more companies interested in {product}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}                      {/* Top Opportunities */}
                      {reportState.data.comprehensive_report.top_opportunities && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            🎯 Top Opportunities
                          </h4>
                          <div className="space-y-4">
                            {Array.isArray(reportState.data.comprehensive_report.top_opportunities) ? (
                              reportState.data.comprehensive_report.top_opportunities.slice(0, 5).map((opportunity: any, index: number) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-purple-400 dark:border-purple-500 shadow-sm">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h5 className="text-xl font-bold text-gray-900 dark:text-white">{opportunity.name}</h5>
                                      <p className="text-gray-600 dark:text-gray-300">{opportunity.industry}</p>
                                      <a href={opportunity.website} target="_blank" rel="noopener noreferrer" 
                                         className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm">
                                        {opportunity.website} →
                                      </a>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-2xl font-bold ${
                                        opportunity.cerebras_fit_score >= 8 ? 'text-green-600 dark:text-green-400' :
                                        opportunity.cerebras_fit_score >= 6 ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-red-600 dark:text-red-400'
                                      }`}>
                                        {opportunity.cerebras_fit_score}/10
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Fit Score</div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">Employees</div>
                                      <div className="font-semibold text-gray-900 dark:text-white">{opportunity.employee_count}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                                      <div className="font-semibold text-gray-900 dark:text-white">{opportunity.revenue}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">Readiness</div>
                                      <div className="font-semibold text-green-600 dark:text-green-400">{opportunity.outreach_readiness}%</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">Contacts</div>
                                      <div className="font-semibold text-gray-900 dark:text-white">{opportunity.contacts_count}</div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <span className="font-semibold text-purple-900 dark:text-purple-200">Recommended Product:</span>
                                      <span className="ml-2 px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                                        {opportunity.recommended_cerebras_product}
                                      </span>
                                    </div>
                                    
                                    {opportunity.estimated_budget_range && (
                                      <div>
                                        <span className="font-semibold text-purple-900 dark:text-purple-200">Budget Range:</span>
                                        <span className="ml-2 text-purple-700 dark:text-purple-300">{opportunity.estimated_budget_range}</span>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <span className="font-semibold text-purple-900 dark:text-purple-200">Implementation:</span>
                                      <span className="ml-2 text-purple-700 dark:text-purple-300">{opportunity.implementation_timeline}</span>
                                    </div>
                                    
                                    <div>
                                      <span className="font-semibold text-purple-900 dark:text-purple-200">AI/ML Usage:</span>
                                      <p className="text-purple-700 dark:text-purple-300 mt-1">{opportunity.ai_ml_usage}</p>
                                    </div>
                                    
                                    <div>
                                      <span className="font-semibold text-purple-900 dark:text-purple-200">Value Proposition:</span>
                                      <p className="text-purple-700 dark:text-purple-300 mt-1">{opportunity.value_proposition}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : typeof reportState.data.comprehensive_report.top_opportunities === 'string' ? (
                              <div className="markdown-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {reportState.data.comprehensive_report.top_opportunities}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg p-4 border">
                                <div className="markdown-content">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {`\`\`\`json\n${JSON.stringify(reportState.data.comprehensive_report.top_opportunities, null, 2)}\n\`\`\``}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Any other sections as markdown */}
                      {Object.entries(reportState.data.comprehensive_report).map(([key, value]) => {                        if (key === 'generated_at' || key === 'pipeline_metrics' || key === 'top_opportunities') {
                          return null; // Already handled above
                        }
                        return (
                          <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 capitalize border-b border-gray-200 dark:border-gray-600 pb-2">
                              {key.replace(/_/g, ' ')}
                            </h4>
                            <div>
                              {typeof value === 'string' ? (
                                <div className="markdown-content">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {value}
                                  </ReactMarkdown>
                                </div>
                              ) : Array.isArray(value) ? (
                                <ul className="list-disc list-inside space-y-2">
                                  {value.map((item: any, index: number) => (
                                    <li key={index} className="text-gray-700 dark:text-gray-300">
                                      {typeof item === 'string' ? item : JSON.stringify(item)}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="markdown-content">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {`\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          </div>                        );
                      })}
                    </div>
                    )
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 border">
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {`\`\`\`json\n${JSON.stringify(reportState.data.comprehensive_report, null, 2)}\n\`\`\``}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}                </div>
              </div>              {/* Footer - Fixed */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex justify-between items-center flex-shrink-0">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Use this comprehensive analysis to inform your sales strategy and customer engagement approach.
                </div>
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    const content = reportState.data?.comprehensive_report?.report_content || 
                                  (typeof reportState.data?.comprehensive_report === 'string' 
                                    ? reportState.data.comprehensive_report 
                                    : JSON.stringify(reportState.data?.comprehensive_report, null, 2));
                    const file = new Blob([content], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = `comprehensive-report-${new Date().toISOString().split('T')[0]}.md`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>📥</span>
                  <span>Download Report</span>
                </button>
              </div>
            </div>          </div>
        )}        {/* Report Editing Modal */}
        {editingReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-600">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">✏️ Edit Report</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={saveReport}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditingReport}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                
                {/* Title Editor */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Title</label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter report title..."
                  />
                </div>
              </div>                {/* Content Editor */}
              <div className="flex-1 p-6 flex flex-col min-h-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Content (Markdown)</label>
                <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">                    {/* Editor */}
                    <div className="flex flex-col min-h-0">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Editor</div>                      <textarea
                        value={reportContent}
                        onChange={(e) => setReportContent(e.target.value)}
                        onWheel={(e) => {
                          e.stopPropagation();
                          const target = e.currentTarget;
                          target.scrollTop += e.deltaY;
                        }}
                        className="flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 overflow-y-auto"
                        placeholder="Enter your report content in Markdown format..."
                        style={{ minHeight: '400px' }}
                      />
                    </div>
                    
                    {/* Preview */}
                    <div className="flex flex-col min-h-0">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Preview</div>
                      <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-3 overflow-y-auto bg-gray-50 dark:bg-gray-700 min-h-0">
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {reportContent || '*No content to preview*'}
                          </ReactMarkdown>                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex justify-between items-center flex-shrink-0">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Report Type:</span> {editingReport.report_type}
                  {editingReport.company_name && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="font-medium">Company:</span> {editingReport.company_name}
                    </>
                  )}
                </div>                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Use Markdown syntax for formatting. Changes are saved to the database.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
