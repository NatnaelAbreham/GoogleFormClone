import React, { useState } from 'react';

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState('form');
  const [profileDropdown, setProfileDropdown] = useState(false);

  const navItems = [
    { id: 'form', label: 'Form', icon: '📝' },
    { id: 'view', label: 'View', icon: '👁️' },
    { id: 'delete', label: 'Delete', icon: '🗑️' },
    { id: 'publish', label: 'Publish', icon: '🚀' },
  ];

  const profileItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'logout', label: 'Logout', icon: '🚪' },
  ];

  const handleNavClick = (navId) => {
    setActiveNav(navId);
  };

  const handleProfileItemClick = (itemId) => {
    setProfileDropdown(false);
    console.log(`Clicked: ${itemId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">FormBuilder</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeNav === item.id
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2 text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Profile Dropdown */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">U</span>
                  </div>
                  <span className="text-gray-700 font-medium hidden sm:block">John Doe</span>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      profileDropdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    {profileItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleProfileItemClick(item.id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <span className="mr-3 text-base">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-gray-200 pt-2 pb-3">
            <div className="flex space-x-4 overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap ${
                    activeNav === item.id
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeNav} Page</h1>
            <p className="text-gray-600 mt-2">
              Welcome to the {activeNav.toLowerCase()} section. Manage your forms and settings here.
            </p>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                View detailed analytics and insights about your forms and responses.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Responses</h3>
              <p className="text-gray-600 text-sm">
                Manage and review responses from your published forms and surveys.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates</h3>
              <p className="text-gray-600 text-sm">
                Choose from pre-built templates to create forms quickly and efficiently.
              </p>
            </div>

            {activeNav === 'form' && (
              <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Form Builder</h3>
                <p className="text-gray-700 mb-4">
                  Create amazing forms with our drag-and-drop builder. Add questions, customize styles, and preview in real time.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                  Create New Form
                </button>
              </div>
            )}

            {activeNav === 'view' && (
              <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">View Forms</h3>
                <p className="text-gray-700 mb-4">
                  Browse through all your created forms. Edit, duplicate, or analyze existing forms.
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                  Browse Forms
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">F</span>
                </div>
                <span className="text-xl font-bold">FormBuilder</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Build beautiful forms and surveys with our intuitive builder. Create, manage, and analyze forms easily.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>hello@formbuilder.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Form Street, Suite 100</li>
                <li>San Francisco, CA 94107</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 FormBuilder. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
