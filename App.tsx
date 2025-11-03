
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Scans from './components/Scans';
import Integrations from './components/Integrations';
import Templates from './components/Templates';
import Workshops from './components/Workshops';
import Settings from './components/Settings';
import type { Page, AppIntegrations } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [integrations, setIntegrations] = useState<AppIntegrations>({
    asana: { connected: false, projectId: '' },
    monday: { connected: false, projectId: '' },
  });

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Scans':
        return <Scans integrations={integrations} />;
      case 'Integrations':
        return <Integrations integrations={integrations} setIntegrations={setIntegrations} />;
      case 'Templates':
        return <Templates />;
      case 'Workshops':
        return <Workshops />;
      case 'Settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-16 sm:ml-64">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
