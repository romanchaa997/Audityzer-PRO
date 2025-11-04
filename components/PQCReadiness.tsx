import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { AlertTriangleIcon, CheckCircleIcon, ChevronUpIcon, ChevronDownIcon } from './ui/Icons';
import type { Notification } from '../types';

type MigrationStatus = 'Migrated' | 'Pending' | 'Vulnerable';

interface CryptoAsset {
  id: string;
  name: string;
  type: 'Certificate' | 'API Key' | 'Signature Algorithm' | 'KEM' | 'Shared Secret';
  algorithm: string;
  status: MigrationStatus;
  notes: string;
}

const cryptoAssets: CryptoAsset[] = [
  { id: 'cert-1', name: 'api.audityzer.pro SSL', type: 'Certificate', algorithm: 'RSA-2048', status: 'Vulnerable', notes: 'Scheduled for Q4 rotation.' },
  { id: 'cert-2', name: 'internal-ca-root', type: 'Certificate', algorithm: 'ECDSA P-256', status: 'Vulnerable', notes: 'Depends on infrastructure update.' },
  { id: 'key-1', name: 'Main Signing Key', type: 'API Key', algorithm: 'HMAC-SHA256', status: 'Pending', notes: 'New key generated, awaiting deployment.' },
  { id: 'algo-1', name: 'User Authentication JWT', type: 'Signature Algorithm', algorithm: 'RS256', status: 'Pending', notes: 'Migrating to CRYSTALS-Dilithium.' },
  { id: 'kem-1', name: 'Secure Channel KEX', type: 'KEM', algorithm: 'CRYSTALS-Kyber', status: 'Migrated', notes: 'Completed last month.' },
  { id: 'secret-1', name: 'Database Encryption Key', type: 'Shared Secret', algorithm: 'AES-256', status: 'Migrated', notes: 'Rotated with PQC KEM.' },
  { id: 'cert-3', name: 'dev.audityzer.pro SSL', type: 'Certificate', algorithm: 'RSA-2048', status: 'Vulnerable', notes: 'Low priority.' },
  { id: 'key-2', name: 'Integration Partner Key', type: 'API Key', algorithm: 'HMAC-SHA512', status: 'Vulnerable', notes: 'Partner dependency.' },
  { id: 'algo-2', name: 'Document Signing', type: 'Signature Algorithm', algorithm: 'ECDSA P-384', status: 'Migrated', notes: 'Using SPHINCS+.' },
];

const statusConfig: { [key in MigrationStatus]: { color: string; ring: string; text: string; } } = {
    'Migrated': { color: 'bg-green-500', ring: 'ring-green-500', text: 'text-green-300' },
    'Pending': { color: 'bg-yellow-500', ring: 'ring-yellow-500', text: 'text-yellow-300' },
    'Vulnerable': { color: 'bg-red-500', ring: 'ring-red-500', text: 'text-red-300' },
};

const MetricCard: React.FC<{ title: string; value: string | number; description: string; status?: MigrationStatus }> = ({ title, value, description, status }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative">
        {status && <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${statusConfig[status].color}`}></div>}
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className={`text-3xl font-bold ${status ? statusConfig[status].text : 'text-white'} mt-2`}>{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
);

const NotificationComponent: React.FC<{ notification: Notification; onClose: (id: string) => void; }> = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(notification.id);
        }, 7000); // Auto-dismiss after 7 seconds
        return () => clearTimeout(timer);
    }, [notification.id, onClose]);

    const config = {
        vulnerable: {
            icon: <AlertTriangleIcon className="h-6 w-6 text-red-400" />,
            borderColor: 'border-red-500',
            title: 'Vulnerable Asset Detected',
        },
        migrated: {
            icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
            borderColor: 'border-green-500',
            title: 'Migration Completed',
        },
    };

    const { icon, borderColor, title } = config[notification.type];

    return (
        <div className={`w-full max-w-sm bg-gray-800 rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${borderColor}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-white">{title}</p>
                        <p className="mt-1 text-sm text-gray-400">{notification.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={() => onClose(notification.id)} className="inline-flex text-gray-400 rounded-md hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800">
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PQCReadiness: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // State for filtering and sorting
  const [filterType, setFilterType] = useState<'All' | CryptoAsset['type']>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | MigrationStatus>('All');
  const [filterAlgorithm, setFilterAlgorithm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CryptoAsset; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const assetTypes = useMemo(() => ['All', ...Array.from(new Set(cryptoAssets.map(a => a.type)))], []);
  const assetStatuses = useMemo(() => ['All', 'Migrated', 'Pending', 'Vulnerable'], []);

  const addNotification = useCallback((message: string, type: 'vulnerable' | 'migrated') => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      message,
      type,
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    // Simulate detecting a vulnerable asset
    const firstVulnerable = cryptoAssets.find(a => a.status === 'Vulnerable');
    if (firstVulnerable) {
      const timer1 = setTimeout(() => {
        addNotification(`Asset "${firstVulnerable.name}" is using a non-PQC algorithm.`, 'vulnerable');
      }, 2000);
      
      return () => clearTimeout(timer1);
    }
  }, [addNotification]);
  
  useEffect(() => {
    // Simulate a migration completion
    const firstMigrated = cryptoAssets.find(a => a.status === 'Migrated');
    if (firstMigrated) {
      const timer2 = setTimeout(() => {
        addNotification(`Asset "${firstMigrated.name}" has been successfully migrated.`, 'migrated');
      }, 4000);

      return () => clearTimeout(timer2);
    }
  }, [addNotification]);

  const { readinessScore, total, migrated, pending, vulnerable } = useMemo(() => {
    const total = cryptoAssets.length;
    const migrated = cryptoAssets.filter(a => a.status === 'Migrated').length;
    const pending = cryptoAssets.filter(a => a.status === 'Pending').length;
    const vulnerable = cryptoAssets.filter(a => a.status === 'Vulnerable').length;
    const readinessScore = total > 0 ? Math.round((migrated / total) * 100) : 0;
    return { readinessScore, total, migrated, pending, vulnerable };
  }, []);

  const filteredAndSortedAssets = useMemo(() => {
    let assets = [...cryptoAssets];

    assets = assets.filter(asset => {
        const typeMatch = filterType === 'All' || asset.type === filterType;
        const statusMatch = filterStatus === 'All' || asset.status === filterStatus;
        const algorithmMatch = asset.algorithm.toLowerCase().includes(filterAlgorithm.toLowerCase());
        return typeMatch && statusMatch && algorithmMatch;
    });

    if (sortConfig !== null) {
        assets.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    return assets;
  }, [filterType, filterStatus, filterAlgorithm, sortConfig]);

  const requestSort = (key: keyof CryptoAsset) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const SortableHeader: React.FC<{ children: React.ReactNode; sortKey: keyof CryptoAsset; }> = ({ children, sortKey }) => {
    const isSorting = sortConfig?.key === sortKey;
    const icon = isSorting ? (sortConfig?.direction === 'ascending' ? <ChevronUpIcon className="w-4 h-4 ml-1" /> : <ChevronDownIcon className="w-4 h-4 ml-1" />) : null;
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            <button onClick={() => requestSort(sortKey)} className="flex items-center hover:text-white transition-colors">
                {children}<span className="ml-1 w-4 h-4">{icon}</span>
            </button>
        </th>
    );
  };
  
  const chartData = [{ name: 'Readiness', value: readinessScore, fill: '#22d3ee' }];

  return (
    <>
      <div className="fixed top-5 right-5 z-50 w-full max-w-sm space-y-4">
        {notifications.map(notification => (
          <NotificationComponent key={notification.id} notification={notification} onClose={removeNotification} />
        ))}
      </div>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">PQC Readiness Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold mb-2">Overall Readiness Score</h2>
              <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart 
                      innerRadius="70%" 
                      outerRadius="85%" 
                      data={chartData} 
                      startAngle={90} 
                      endAngle={-270}
                  >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={10} angleAxisId={0} />
                       <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-5xl font-bold">
                          {`${readinessScore}%`}
                      </text>
                  </RadialBarChart>
              </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard title="Total Cryptographic Assets" value={total} description="All identified assets" />
              <MetricCard title="Migrated to PQC" value={migrated} description="Assets fully quantum-resistant" status="Migrated" />
              <MetricCard title="Migration Pending" value={pending} description="Assets currently being updated" status="Pending" />
              <MetricCard title="Vulnerable" value={vulnerable} description="Vulnerable assets requiring action" status="Vulnerable" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Cryptographic Asset Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={filterType} onChange={e => setFilterType(e.target.value as 'All' | CryptoAsset['type'])} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {assetTypes.map(type => <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as 'All' | MigrationStatus)} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {assetStatuses.map(status => <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>)}
                </select>
                <input type="text" value={filterAlgorithm} onChange={e => setFilterAlgorithm(e.target.value)} placeholder="Filter by algorithm..." className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700/50">
                      <tr>
                          <SortableHeader sortKey="name">Asset Name</SortableHeader>
                          <SortableHeader sortKey="type">Type</SortableHeader>
                          <SortableHeader sortKey="algorithm">Algorithm</SortableHeader>
                          <SortableHeader sortKey="status">Status</SortableHeader>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notes</th>
                      </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {filteredAndSortedAssets.map(asset => (
                          <tr key={asset.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{asset.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{asset.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{asset.algorithm}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center">
                                      <span className={`h-2.5 w-2.5 rounded-full ${statusConfig[asset.status].color} mr-2`}></span>
                                      <span className={statusConfig[asset.status].text}>{asset.status}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 max-w-xs truncate">{asset.notes}</td>
                          </tr>
                      ))}
                      {filteredAndSortedAssets.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-500">No assets match the current filters.</td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default PQCReadiness;