
import React, { useState } from 'react';
import type { AppIntegrations, IntegrationState } from '../types';

const generalIntegrations = [
  { name: 'Jira', logo: 'https://cdn.worldvectorlogo.com/logos/jira-1.svg', description: 'Create and track issues from vulnerabilities.' },
  { name: 'Slack', logo: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg', description: 'Get real-time notifications for scan results.' },
  { name: 'GitHub', logo: 'https://cdn.worldvectorlogo.com/logos/github-icon-1.svg', description: 'Integrate security scans into your CI/CD pipeline.' },
  { name: 'Notion', logo: 'https://cdn.worldvectorlogo.com/logos/notion-1.svg', description: 'Sync scan reports to your knowledge base.' },
  { name: 'Trello', logo: 'https://cdn.worldvectorlogo.com/logos/trello.svg', description: 'Create vulnerability cards on your boards.' },
  { name: 'Discord', logo: 'https://cdn.worldvectorlogo.com/logos/discord-6.svg', description: 'Alert your team about security events.' },
];

const projectManagementIntegrations = [
    { id: 'asana', name: 'Asana', logo: 'https://cdn.worldvectorlogo.com/logos/asana-1.svg', description: 'Automatically create tasks for critical vulnerabilities in your Asana projects.' },
    { id: 'monday', name: 'Monday.com', logo: 'https://cdn.worldvectorlogo.com/logos/monday-com.svg', description: 'Push critical findings directly to your Monday.com boards as new items.' },
];

const GeneralIntegrationCard: React.FC<{ name: string, logo: string, description: string }> = ({ name, logo, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center text-center border border-gray-700 hover:border-cyan-400 transition">
        <img src={logo} alt={`${name} logo`} className="h-16 w-16 mb-4 filter invert brightness-0" style={{'filter': 'brightness(0) invert(1)'}}/>
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-gray-400 text-sm mt-2 flex-grow">{description}</p>
        <button className="mt-6 w-full px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-cyan-500 transition">
            Connect
        </button>
    </div>
);

interface ProjectManagementIntegrationCardProps {
  id: 'asana' | 'monday';
  name: string;
  logo: string;
  description: string;
  integrationState: IntegrationState;
  onUpdate: (newState: IntegrationState) => void;
}

const ProjectManagementIntegrationCard: React.FC<ProjectManagementIntegrationCardProps> = ({ id, name, logo, description, integrationState, onUpdate }) => {
    const [projectId, setProjectId] = useState(integrationState.projectId);
    
    const handleSave = () => {
        if (projectId.trim()) {
            onUpdate({ connected: true, projectId: projectId.trim() });
        }
    }

    const handleDisconnect = () => {
        setProjectId('');
        onUpdate({ connected: false, projectId: '' });
    }

    return (
        <div className={`bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col text-center border ${integrationState.connected ? 'border-green-500' : 'border-gray-700 hover:border-cyan-400'} transition`}>
             {integrationState.connected && <span className="text-xs font-bold uppercase text-green-400 self-end">Connected</span>}
            <img src={logo} alt={`${name} logo`} className="h-16 w-16 mb-4 filter invert brightness-0 self-center" style={{'filter': 'brightness(0) invert(1)'}}/>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-gray-400 text-sm mt-2 flex-grow">{description}</p>
            
            <div className="mt-4 space-y-3">
                <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Enter Project ID"
                    disabled={integrationState.connected}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-900/50 disabled:cursor-not-allowed"
                />
                {integrationState.connected ? (
                     <button onClick={handleDisconnect} className="w-full px-4 py-2 bg-red-600/50 text-white font-semibold rounded-md hover:bg-red-600 transition">
                        Disconnect
                    </button>
                ) : (
                    <button onClick={handleSave} disabled={!projectId.trim()} className="w-full px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600">
                        Connect & Save
                    </button>
                )}
            </div>
        </div>
    );
}

interface IntegrationsProps {
  integrations: AppIntegrations;
  setIntegrations: React.Dispatch<React.SetStateAction<AppIntegrations>>;
}

const Integrations: React.FC<IntegrationsProps> = ({ integrations, setIntegrations }) => {
  const handleUpdate = (id: 'asana' | 'monday', newState: IntegrationState) => {
    setIntegrations(prev => ({ ...prev, [id]: newState }));
  };
    
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Integrations</h1>
      
      <div>
        <h2 className="text-2xl font-semibold mb-2">Project Management</h2>
        <p className="text-gray-400 max-w-2xl mb-6">
            Automate your remediation workflow by creating tasks in your favorite tools whenever a critical vulnerability is discovered.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectManagementIntegrations.map(integration => (
                <ProjectManagementIntegrationCard 
                    key={integration.id}
                    {...integration}
                    id={integration.id as 'asana' | 'monday'}
                    integrationState={integrations[integration.id as 'asana' | 'monday']}
                    onUpdate={(newState) => handleUpdate(integration.id as 'asana' | 'monday', newState)}
                />
            ))}
        </div>
      </div>
      
      <div className="pt-8">
        <h2 className="text-2xl font-semibold mb-2">General Integrations</h2>
        <p className="text-gray-400 max-w-2xl mb-6">
            Connect Audityzer PRO with your favorite tools to streamline your security workflow and automate your processes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalIntegrations.map(integration => (
            <GeneralIntegrationCard key={integration.name} {...integration} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
