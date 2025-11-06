import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import natiImage from '../images/nati.jpg'; // adjust path relative to this file


import {
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  RocketLaunchIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon,

  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';



const Dashboard = () => {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'form', label: 'Form', icon: PencilSquareIcon, path: '/dashboard/form' },
    { id: 'view', label: 'View', icon: EyeIcon, path: '/dashboard/view' },
    { id: 'response', label: 'Response', icon: ClipboardDocumentListIcon, path: '/dashboard/response' },
    { id: 'viewresponses', label: 'View All', icon: EyeIcon, path: '/dashboard/viewresponses' },
    { id: 'render', label: 'Render', icon: ChatBubbleLeftEllipsisIcon, path: '/dashboard/render' },
    { id: 'delete', label: 'Trash', icon: TrashIcon, path: '/dashboard/delete' },
    { id: 'publish', label: 'Publish', icon: RocketLaunchIcon, path: '/dashboard/publish' },

    { id: 'sms', label: 'sms', icon: PaperAirplaneIcon, path: '/dashboard/sms' },
  ];


  const profileItems = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
    { id: 'logout', label: 'Logout', icon: ArrowRightOnRectangleIcon },
  ];


  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleProfileItemClick = (itemId) => {
    setProfileDropdown(false);
    console.log(`Clicked: nati ${itemId}`);
  };

  const getActiveNav = () => {
    return navItems.find(item => location.pathname === item.path)?.id || 'form';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-screen overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/70 shadow-lg border-b border-gray-200 fixed top-0 left-0 w-screen z-50 backdrop-blur-md">
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

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${getActiveNav() === item.id
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  <span className="mr-2 text-base">
                    <item.icon className="w-5 h-5" />
                  </span>
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
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
  <img
    src={natiImage}
    alt="Profile"
    className="w-full h-full object-cover"
  />
</div>
                  <span className="text-gray-700 font-medium hidden sm:block">Natnael Abraham</span>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${profileDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    {profileItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleProfileItemClick(item.id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <item.icon className="w-5 h-5 mr-3 text-gray-500" />
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
                  onClick={() => handleNavClick(item.path)}
                  className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap ${getActiveNav() === item.id
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="w-4 h-4 mr-1" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* Main Content - Now truly full width */}
      <main className="flex-grow w-full pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white w-full">
        {/* Removed max-w-7xl container from footer content */}
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8"> {/* Changed to w-full */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">F</span>
                </div>
                <span className="text-xl font-bold">FormBuilder</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Build beautiful forms and surveys with our intuitive form builder. Create, manage, and analyze forms with ease.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>abrahamkd728@gmail.com</li>
                <li>+251 9 xx xx xx</li>
               {/*  <li>123 Form Street, Suite 100</li>
                <li>San Francisco, CA 94107</li> */}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 FormBuilder. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;