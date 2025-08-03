import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  NexLead
                </h1>
              </div>              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  🏠 Home
                </NavLink>
                <NavLink
                  to="/chatbot"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  🤖 Chatbot
                </NavLink>
                <NavLink
                  to="/customer-manager"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  👥 Customer Manager
                </NavLink>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Outlet />
    </div>
  );
};

export default Layout;
