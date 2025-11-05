import React, { useState, lazy, Suspense, createContext, useCallback, useContext, ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import { LoaderIcon } from './components/ui/Icons';
import type { Page, AppIntegrations, IntegrationEvent } from './types';

// 1. CONTEXT FOR CENTRALIZED STATE MANAGEMENT
interface AppContextType {
    integrations: AppIntegrations;
    setIntegrations: React.Dispatch<React.SetStateAction<AppIntegrations>>;
    integrationEvents: IntegrationEvent[];
    logIntegrationEvent: (message: string, tool?: 'Asana' | 'Monday.com') => void;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [integrations, setIntegrations] = useState<AppIntegrations>({
        asana: { connected: false, projectId: '' },
        monday: { connected: false, projectId: '' },
    });
    const [integrationEvents, setIntegrationEvents] = useState<IntegrationEvent[]>([]);

    const logIntegrationEvent = useCallback((message: string, tool?: 'Asana' | 'Monday.com') => {
        const newEvent: IntegrationEvent = {
            id: `event-${Date.now()}`,
            timestamp: new Date(),
            message,
            tool: tool || 'General',
        };
        setIntegrationEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
    }, []);

    return (
        <AppContext.Provider value={{ integrations, setIntegrations, integrationEvents, logIntegrationEvent }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};


// 2. DYNAMICALLY IMPORTED (LAZY-LOADED) COMPONENTS
const Dashboard = lazy(() => import('./components/Dashboard'));
const Scans = lazy(() => import('./components/Scans'));
const CreatorStudio = lazy(() => import('./components/CreatorStudio'));
const Simulation = lazy(() => import('./components/Simulation'));
const PQCReadiness = lazy(() => import('./components/PQCReadiness'));
const Integrations = lazy(() => import('./components/Integrations'));
const Templates = lazy(() => import('./components/Templates'));
const PRDGenerator = lazy(() => import('./components/PRDGenerator'));
const Workshops = lazy(() => import('./components/Workshops'));
const Settings = lazy(() => import('./components/Settings'));


// 3. APP CONTENT COMPONENT
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard': return <Dashboard />;
      case 'Scans': return <Scans />;
      case 'CreatorStudio': return <CreatorStudio />;
      case 'Simulation': return <Simulation />;
      case 'PQCReadiness': return <PQCReadiness />;
      case 'Integrations': return <Integrations />;
      case 'Templates': return <Templates />;
      case 'PRDGenerator': return <PRDGenerator />;
      case 'Workshops': return <Workshops />;
      case 'Settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-16 sm:ml-64">
        <Suspense 
            fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400"/>
                </div>
            }
        >
            {renderContent()}
        </Suspense>
      </main>
    </div>
  );
};


// 4. MAIN APP COMPONENT WRAPPED WITH PROVIDER
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
