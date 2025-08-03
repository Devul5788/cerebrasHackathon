import React, { useState } from 'react';
import { useApiState } from '../api/hooks';
import { companiesApi, CompanyResearchResponse, CompanyResult } from '../api/companiesActions';

interface ResearchFormData {
  mode: 'single' | 'batch' | 'auto';
  companyName: string;
  companyNames: string;
  maxCustomers: number;
}

const CompanyResearch: React.FC = () => {
  const [formData, setFormData] = useState<ResearchFormData>({
    mode: 'single',
    companyName: '',
    companyNames: '',
    maxCustomers: 10
  });

  const [researchState, executeResearch] = useApiState<CompanyResearchResponse>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let request = {};
    
    switch (formData.mode) {
      case 'single':
        if (!formData.companyName.trim()) return;
        request = { company_name: formData.companyName.trim() };
        break;
      case 'batch':
        if (!formData.companyNames.trim()) return;
        const names = formData.companyNames.split('\n').map(name => name.trim()).filter(name => name);
        if (names.length === 0) return;
        request = { company_names: names };
        break;
      case 'auto':
        request = { max_customers: formData.maxCustomers };
        break;
    }

    await executeResearch(() => companiesApi.researchCompanies(request));
  };

  const renderResults = () => {
    if (!researchState.data) return null;

    const { data } = researchState;
    
    if (data.results) {
      // Batch or auto-discovery results
      return (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Research Results ({data.results.length} companies)
          </h3>
          <div className="space-y-4">
            {data.results.map((company: CompanyResult, index: number) => (
              <div key={company.company_id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{company.company_name}</h4>
                    <p className="text-sm text-gray-600">Recommended: {company.recommended_product}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">
                      Fit Score: {company.fit_score}/10
                    </div>
                    <div className="text-sm text-gray-600">
                      Readiness: {company.outreach_readiness}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Single company result
      return (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Complete</h3>
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{data.company_name}</h4>
                <p className="text-sm text-gray-600">Recommended: {data.recommended_product}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600">
                  Fit Score: {data.fit_score}/10
                </div>
                <div className="text-sm text-gray-600">
                  Readiness: {data.outreach_readiness}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Company Research Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and analyze potential customers using AI-powered research. 
            Choose your research method below.
          </p>
        </div>

        {/* Research Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Mode Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Research Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'single' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.mode === 'single'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-medium">Single Company</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Research one specific company
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'batch' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.mode === 'batch'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-medium">Batch Research</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Research multiple companies at once
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'auto' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.mode === 'auto'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🤖</div>
                    <h3 className="font-medium">Auto-Discovery</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Find potential customers automatically
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              {formData.mode === 'single' && (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter company name (e.g., Microsoft, Google, Tesla)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.mode === 'batch' && (
                <div>
                  <label htmlFor="companyNames" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Names (one per line)
                  </label>
                  <textarea
                    id="companyNames"
                    value={formData.companyNames}
                    onChange={(e) => setFormData({ ...formData, companyNames: e.target.value })}
                    placeholder="Microsoft&#10;Google&#10;Tesla&#10;Amazon"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.mode === 'auto' && (
                <div>
                  <label htmlFor="maxCustomers" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Customers to Discover
                  </label>
                  <input
                    type="number"
                    id="maxCustomers"
                    value={formData.maxCustomers}
                    onChange={(e) => setFormData({ ...formData, maxCustomers: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    AI will automatically discover potential customers based on Cerebras offerings
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={researchState.loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {researchState.loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Researching...
                  </div>
                ) : (
                  'Start Research'
                )}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {researchState.error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{researchState.error}</p>
            </div>
          )}

          {/* Success Message */}
          {researchState.data && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">{researchState.data.message}</p>
            </div>
          )}

          {/* Results */}
          {renderResults()}
        </div>
      </div>
    </div>
  );
};

export default CompanyResearch;
