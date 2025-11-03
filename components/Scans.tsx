import React, { useState, useCallback, useMemo } from 'react';
import { analyzeContract } from '../services/geminiService';
import { createProjectManagementTask } from '../services/integrationService';
import ScanProgress from './ScanProgress';
import ScanReport from './ScanReport';
import type { Scan, ScanResult, AppIntegrations, Vulnerability } from '../types';
import { ScanStatus } from '../types';
import { ChevronUpIcon, ChevronDownIcon } from './ui/Icons';

interface ScansProps {
  integrations: AppIntegrations;
}

type SortableScanKeys = 'contractAddress' | 'status' | 'submittedAt';
type SeverityFilter = 'All' | Vulnerability['severity'];

const Scans: React.FC<ScansProps> = ({ integrations }) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [newScanAddress, setNewScanAddress] = useState('');
  const [runningScanId, setRunningScanId] = useState<string | null>(null);
  const [selectedScanResult, setSelectedScanResult] = useState<ScanResult | null>(null);
  
  // State for filtering and sorting
  const [filterAddress, setFilterAddress] = useState('');
  const [filterStatus, setFilterStatus] = useState<ScanStatus | 'All'>('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<SeverityFilter>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortableScanKeys; direction: 'ascending' | 'descending' } | null>({ key: 'submittedAt', direction: 'descending' });


  const startNewScan = useCallback(async () => {
    if (!newScanAddress.trim()) return;

    const newScan: Scan = {
      id: `scan-${Date.now()}`,
      contractAddress: newScanAddress,
      status: ScanStatus.Running,
      submittedAt: new Date(),
    };

    setScans(prev => [newScan, ...prev]);
    setRunningScanId(newScan.id);
    setNewScanAddress('');
    setSelectedScanResult(null);

    try {
      const result = await analyzeContract(newScanAddress);

      setScans(prev =>
        prev.map(s =>
          s.id === newScan.id
            ? { ...s, status: ScanStatus.Completed, completedAt: new Date(), result }
            : s
        )
      );
      setRunningScanId(null);
      setSelectedScanResult(result);

      // Integration logic
      const criticalVulns = result.vulnerabilities.filter(v => v.severity === 'Critical');
      if (criticalVulns.length > 0) {
        const connectedTools: string[] = [];
        if (integrations.asana.connected && integrations.asana.projectId) {
            for (const vuln of criticalVulns) {
                await createProjectManagementTask(vuln, 'Asana', integrations.asana.projectId);
            }
            connectedTools.push('Asana');
        }
        if (integrations.monday.connected && integrations.monday.projectId) {
            for (const vuln of criticalVulns) {
                await createProjectManagementTask(vuln, 'Monday.com', integrations.monday.projectId);
            }
            connectedTools.push('Monday.com');
        }

        if (connectedTools.length > 0) {
            alert(`Audityzer found ${criticalVulns.length} critical vulnerabilities and created tasks in ${connectedTools.join(' & ')}.`);
        }
      }

    } catch (error) {
      console.error("Failed to run scan:", error);
      setScans(prev =>
        prev.map(s =>
          s.id === newScan.id
            ? { ...s, status: ScanStatus.Failed, completedAt: new Date() }
            : s
        )
      );
      setRunningScanId(null);
      alert("The scan failed. Please check the contract address and try again. The AI model may be temporarily unavailable or returned an invalid response.");
    }
  }, [newScanAddress, integrations]);
  
  const filteredAndSortedScans = useMemo(() => {
    let filteredScans = scans.filter(scan => {
        const addressMatch = scan.contractAddress.toLowerCase().includes(filterAddress.toLowerCase());
        const statusMatch = filterStatus === 'All' || scan.status === filterStatus;
        
        const startDate = filterStartDate ? new Date(filterStartDate) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);
        
        const endDate = filterEndDate ? new Date(filterEndDate) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);

        const dateMatch = (!startDate || scan.submittedAt >= startDate) && (!endDate || scan.submittedAt <= endDate);

        const severityMatch = filterSeverity === 'All' || (scan.result && scan.result.vulnerabilities.some(v => v.severity === filterSeverity));

        return addressMatch && statusMatch && dateMatch && severityMatch;
    });

    if (sortConfig !== null) {
        filteredScans.sort((a, b) => {
            let aValue: string | number | Date = a[sortConfig.key];
            let bValue: string | number | Date = b[sortConfig.key];

            if (aValue instanceof Date && bValue instanceof Date) {
                aValue = aValue.getTime();
                bValue = bValue.getTime();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    return filteredScans;
  }, [scans, filterAddress, filterStatus, sortConfig, filterStartDate, filterEndDate, filterSeverity]);

  const requestSort = (key: SortableScanKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleViewResult = (result?: ScanResult) => {
    if (result) {
        setRunningScanId(null);
        setSelectedScanResult(result);
    }
  }
  
  const handleBackToList = () => {
      setRunningScanId(null);
      setSelectedScanResult(null);
  }

  if (runningScanId) {
    return <ScanProgress onComplete={() => {}} />;
  }
  
  if (selectedScanResult) {
    return <ScanReport result={selectedScanResult} onBack={handleBackToList} />;
  }
  
  const SortableHeader: React.FC<{ children: React.ReactNode; sortKey: SortableScanKeys; }> = ({ children, sortKey }) => {
    const isSorting = sortConfig?.key === sortKey;
    const icon = isSorting ? (sortConfig?.direction === 'ascending' ? <ChevronUpIcon className="w-4 h-4 ml-1" /> : <ChevronDownIcon className="w-4 h-4 ml-1" />) : null;
    
    return (
         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            <button onClick={() => requestSort(sortKey)} className="flex items-center hover:text-white transition-colors">
                {children}
                <span className="ml-1 w-4 h-4">{icon}</span>
            </button>
        </th>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Contract Scans</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Start a New Scan</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newScanAddress}
            onChange={(e) => setNewScanAddress(e.target.value)}
            placeholder="Enter smart contract address (e.g., 0x...)"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={startNewScan}
            disabled={!newScanAddress.trim()}
            className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Scan Now
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Scan History</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Filter by address..."
              value={filterAddress}
              onChange={(e) => setFilterAddress(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Filter scans by contract address"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ScanStatus | 'All')}
              className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Filter scans by status"
            >
              <option value="All">All Statuses</option>
              {Object.values(ScanStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
             <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as SeverityFilter)}
              className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Filter scans by severity"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="Filter scans by start date"
                />
                <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="Filter scans by end date"
                />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                    <tr>
                        <SortableHeader sortKey="contractAddress">Contract Address</SortableHeader>
                        <SortableHeader sortKey="status">Status</SortableHeader>
                        <SortableHeader sortKey="submittedAt">Submitted</SortableHeader>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredAndSortedScans.length > 0 ? filteredAndSortedScans.map(scan => (
                        <tr key={scan.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300 truncate max-w-xs">{scan.contractAddress}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    scan.status === ScanStatus.Completed ? 'bg-green-500/20 text-green-300' :
                                    scan.status === ScanStatus.Running ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-red-500/20 text-red-300'
                                }`}>
                                    {scan.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{scan.submittedAt.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => handleViewResult(scan.result)}
                                    disabled={scan.status !== ScanStatus.Completed}
                                    className="text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 disabled:cursor-not-allowed">
                                    View Report
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500">No scans match the current filters.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Scans;