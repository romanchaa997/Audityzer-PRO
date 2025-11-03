import React, { useState } from 'react';
import { useAppContext } from '../App';
import type { IntegrationState } from '../types';
import { ClockIcon } from './ui/Icons';

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

const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const GeneralIntegrationCard: React.FC<{ name: string, logo: string, description: string }> = ({ name, logo, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center text-center border border-gray-700 hover:border-cyan-400 transition">
        <img src={logo} alt={`${name} logo`} className="h-16 w-16 mb-4" style={{'filter': 'brightness(0) invert(1)'}}/>
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-gray-400 text-sm mt-2 flex-grow">{description}</p>
        <button className="mt-6 w-full px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-cyan-500 transition">Connect</button>
    </div>
);

interface ProjectManagementIntegrationCardProps {
  id: 'asana' | 'monday';
  name: 'Asana' | 'Monday.com';
  logo: string;
  description: string;
  integrationState: IntegrationState;
  onUpdate: (newState: IntegrationState) => void;
  logIntegrationEvent: (message: string, tool: 'Asana' | 'Monday.com') => void;
}

const ProjectManagementIntegrationCard: React.FC<ProjectManagementIntegrationCardProps> = ({ id, name, logo, description, integrationState, onUpdate, logIntegrationEvent }) => {
    const [projectId, setProjectId] = useState(integrationState.projectId);
    
    const handleSave = () => {
        const trimmedId = projectId.trim();
        if (trimmedId) {
            onUpdate({ connected: true, projectId: trimmedId });
            logIntegrationEvent(`Connected to project: ${trimmedId}`, name);
        }
    }

    const handleDisconnect = () => {
        logIntegrationEvent(`Disconnected from project: ${integrationState.projectId}`, name);
        setProjectId('');
        onUpdate({ connected: false, projectId: '' });
    }

    return (
        <div className={`bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col text-center border ${integrationState.connected ? 'border-green-500' : 'border-gray-700 hover:border-cyan-400'} transition`}>
             {integrationState.connected && <span className="text-xs font-bold uppercase text-green-400 self-end">Connected</span>}
            <img src={logo} alt={`${name} logo`} className="h-16 w-16 mb-4 self-center" style={{'filter': 'brightness(0) invert(1)'}}/>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-gray-400 text-sm mt-2 flex-grow">{description}</p>
            <div className="mt-4 space-y-3">
                <input type="text" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Enter Project ID" disabled={integrationState.connected} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-900/50 disabled:cursor-not-allowed" />
                {integrationState.connected ? (
                     <button onClick={handleDisconnect} className="w-full px-4 py-2 bg-red-600/50 text-white font-semibold rounded-md hover:bg-red-600 transition">Disconnect</button>
                ) : (
                    <button onClick={handleSave} disabled={!projectId.trim()} className="w-full px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600">Connect & Save</button>
                )}
            </div>
        </div>
    );
}

const Integrations: React.FC = () => {
  const { integrations, setIntegrations, integrationEvents, logIntegrationEvent } = useAppContext();

  const handleUpdate = (id: 'asana' | 'monday', newState: IntegrationState) => {
    setIntegrations(prev => ({ ...prev, [id]: newState }));
  };
    
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Integrations</h1>
      
      <div>
        <h2 className="text-2xl font-semibold mb-2">Project Management</h2>
        <p className="text-gray-400 max-w-2xl mb-6">Automate your remediation workflow by creating tasks whenever a critical vulnerability is discovered.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectManagementIntegrations.map(integration => (
                <ProjectManagementIntegrationCard 
                    key={integration.id}
                    {...integration}
                    id={integration.id as 'asana' | 'monday'}
                    name={integration.name as 'Asana' | 'Monday.com'}
                    integrationState={integrations[integration.id as 'asana' | 'monday']}
                    onUpdate={(newState) => handleUpdate(integration.id as 'asana' | 'monday', newState)}
                    logIntegrationEvent={logIntegrationEvent}
                />
            ))}
        </div>
      </div>
      
       <div className="pt-8">
        <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 max-h-96 overflow-y-auto">
            {integrationEvents.length > 0 ? (
                <ul className="space-y-4">
                    {integrationEvents.map(event => (
                        <li key={event.id} className="flex items-start text-sm">
                            <ClockIcon className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                            <div className="ml-3 flex-1">
                               <p className="text-gray-300"><span className="font-semibold text-cyan-400">{event.tool === 'General' ? 'System' : event.tool}:</span> {event.message}</p>
                               <p className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center py-4">No integration activity yet.</p>
            )}
        </div>
      </div>

      <div className="pt-8">
        <h2 className="text-2xl font-semibold mb-2">General Integrations</h2>
        <p className="text-gray-400 max-w-2xl mb-6">Connect Audityzer PRO with other tools to streamline your security workflow.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalIntegrations.map(integration => (<GeneralIntegrationCard key={integration.name} {...integration} />))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
