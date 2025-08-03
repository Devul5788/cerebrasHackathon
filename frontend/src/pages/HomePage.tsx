import React, { useState, useEffect, useCallback } from 'react';
import { testApi } from '../api/testApi';
import { useApiState } from '../api/hooks';
import { ApiStatusResponse, HelloWorldResponse, SampleDataResponse } from '../api/types';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [connectionTest, setConnectionTest] = useState<{
    isConnected: boolean;
    status: string;
    lastChecked: string | null;
  }>({
    isConnected: false,
    status: 'Not tested',
    lastChecked: null
  });
  const [helloState, executeHello] = useApiState<HelloWorldResponse>();
  const [statusState, executeStatus] = useApiState<ApiStatusResponse>();
  const [dataState, executeData] = useApiState<SampleDataResponse>();

  const testConnection = useCallback(async () => {
    setConnectionTest({
      isConnected: false,
      status: 'Testing...',
      lastChecked: null
    });

    try {
      // Test basic connectivity
      await executeHello(() => testApi.getHelloWorld());
      
      // Test status endpoint
      await executeStatus(() => testApi.getApiStatus());
      
      // Test data endpoint
      await executeData(() => testApi.getSampleData());

      setConnectionTest({
        isConnected: true,
        status: 'Connected successfully',
        lastChecked: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setConnectionTest({
        isConnected: false,
        status: 'Connection failed',
        lastChecked: new Date().toLocaleTimeString()
      });
    }
  }, [executeHello, executeStatus, executeData]);

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, [testConnection]);

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🚀 CerebrasApp - AI-Powered Sales Outreach Platform
        </h1>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            Welcome to your intelligent sales outreach platform. This application helps you discover companies, 
            find contacts, and generate personalized email campaigns using AI.
          </p>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <div 
              className="bg-blue-50 p-6 rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/chatbot')}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                🤖
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Chatbot</h3>
              <p className="text-gray-600">Interactive profile setup with AI-powered company discovery and product suggestions.</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                🏢
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Research</h3>
              <p className="text-gray-600">Automated market research, competitor analysis, and buying signal detection.</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                👥
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Discovery</h3>
              <p className="text-gray-600">Find decision-makers and key contacts with role detection and org chart building.</p>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                📧
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Generation</h3>
              <p className="text-gray-600">AI-powered personalized email campaigns with tone adaptation by contact role.</p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                📊
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inbox Workspace</h3>
              <p className="text-gray-600">Outlook/Gmail-like interface for managing prospects and tracking campaigns.</p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                🔌
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrations</h3>
              <p className="text-gray-600">Connect with Clearbit, Crunchbase, LinkedIn, Outlook, and Gmail APIs.</p>
            </div>
          </div>

          {/* Technical Stack */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Technical Stack</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Frontend</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• React 18 with TypeScript</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Modern responsive design</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Backend</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Django 4.2 + REST Framework</li>
                  <li>• Celery for background tasks</li>
                  <li>• PostgreSQL + Redis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🔗 Backend Connection Test
          </h3>
          <button
            onClick={testConnection}
            disabled={connectionTest.status === 'Testing...'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connectionTest.status === 'Testing...' ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={`h-3 w-3 rounded-full ${connectionTest.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              Status: {connectionTest.status}
            </span>
            {connectionTest.lastChecked && (
              <span className="text-sm text-gray-500">
                Last checked: {connectionTest.lastChecked}
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            Endpoint: http://localhost:8000/api/
          </div>

          {/* API Test Results */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {/* Hello World Test */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Hello World Test</h4>
              {helloState.loading && <p className="text-sm text-blue-600">Loading...</p>}
              {helloState.error && <p className="text-sm text-red-600">Error: {helloState.error}</p>}
              {helloState.data && (
                <div className="text-sm text-green-600">
                  <p>✅ {helloState.data.message}</p>
                  <p className="text-gray-500">Status: {helloState.data.status}</p>
                </div>
              )}
            </div>

            {/* Status Test */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Status Check</h4>
              {statusState.loading && <p className="text-sm text-blue-600">Loading...</p>}
              {statusState.error && <p className="text-sm text-red-600">Error: {statusState.error}</p>}
              {statusState.data && (
                <div className="text-sm text-green-600">
                  <p>✅ API {statusState.data.status}</p>
                  <p className="text-gray-500">Version: {statusState.data.version}</p>
                </div>
              )}
            </div>

            {/* Data Test */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Data Endpoint</h4>
              {dataState.loading && <p className="text-sm text-blue-600">Loading...</p>}
              {dataState.error && <p className="text-sm text-red-600">Error: {dataState.error}</p>}
              {dataState.data && (
                <div className="text-sm text-green-600">
                  <p>✅ Got {dataState.data.count} items</p>
                  <p className="text-gray-500">Status: {dataState.data.status}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sample Data Display */}
          {dataState.data && dataState.data.data && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Sample Data from Backend:</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {dataState.data.data.map((item) => (
                  <div key={item.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">
                        {item.icon === 'lightning' && '⚡'}
                        {item.icon === 'check' && '✅'}
                        {item.icon === 'heart' && '❤️'}
                      </span>
                      <h5 className="font-medium text-gray-900">{item.title}</h5>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default HomePage;
