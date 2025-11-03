
import React from 'react';
import { DashboardIcon, ScanIcon, IntegrationIcon, TemplateIcon, WorkshopIcon, SettingsIcon } from './ui/Icons';
import type { Page, NavItem } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
  { name: 'Scans', icon: <ScanIcon className="w-6 h-6" /> },
  { name: 'Integrations', icon: <IntegrationIcon className="w-6 h-6" /> },
  { name: 'Templates', icon: <TemplateIcon className="w-6 h-6" /> },
  { name: 'Workshops', icon: <WorkshopIcon className="w-6 h-6" /> },
  { name: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <aside className="fixed top-0 left-0 z-40 w-16 sm:w-64 h-screen transition-transform">
      <div className="flex flex-col h-full px-3 py-4 overflow-y-auto bg-gray-800 border-r border-gray-700">
        <a href="#" className="flex items-center ps-2.5 mb-5" onClick={() => setCurrentPage('Dashboard')}>
          <svg className="h-8 w-8 text-cyan-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="self-center text-xl font-semibold whitespace-nowrap hidden sm:inline ml-3">Audityzer</span>
        </a>
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href="#"
                onClick={() => setCurrentPage(item.name)}
                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${
                  currentPage === item.name ? 'bg-gray-700' : ''
                }`}
              >
                {item.icon}
                <span className="ms-3 hidden sm:inline">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
