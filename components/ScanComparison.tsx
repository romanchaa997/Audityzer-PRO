import React, { useMemo } from 'react';
import type { Scan, Vulnerability } from '../types';
import { PlusCircleIcon, MinusCircleIcon, ArrowRightCircleIcon } from './ui/Icons';

type ComparisonStatus = 'New' | 'Resolved' | 'Unchanged';

interface ComparedVulnerability extends Vulnerability {
  status: ComparisonStatus;
}

interface ScanComparisonProps {
  scans: Scan[];
  onBack: () => void;
}

const statusStyles: { [key in ComparisonStatus]: { icon: React.ReactNode; text: string; color: string; cardClass: string; } } = {
  New: {
    icon: <PlusCircleIcon className="w-4 h-4 mr-1.5" />,
    text: 'New',
    color: 'text-green-400',
    cardClass: 'border-green-500 bg-green-500/10'
  },
  Resolved: {
    icon: <MinusCircleIcon className="w-4 h-4 mr-1.5" />,
    text: 'Resolved',
    color: 'text-red-400',
    cardClass: 'border-red-500 bg-red-500/10 opacity-60'
  },
  Unchanged: {
    icon: <ArrowRightCircleIcon className="w-4 h-4 mr-1.5" />,
    text: 'Unchanged',
    color: 'text-gray-400',
    cardClass: 'border-gray-600 bg-gray-700/50'
  },
};

const VulnerabilityComparisonCard: React.FC<{ vuln: ComparedVulnerability; isBaseScan: boolean; }> = ({ vuln, isBaseScan }) => {
    const style = statusStyles[vuln.status];
    const isResolved = vuln.status === 'Resolved';

    return (
        <div className={`p-3 rounded-lg border-l-4 ${style.cardClass}`}>
            <h4 className={`font-semibold ${isResolved ? 'line-through' : ''}`}>{vuln.title}</h4>
            <p className={`text-xs text-gray-400 ${isResolved ? 'line-through' : ''}`}>Severity: {vuln.severity}</p>
            {!isBaseScan && (
                <div className={`mt-2 flex items-center text-xs font-medium ${style.color}`}>
                    {style.icon}
                    <span>{style.text}</span>
                </div>
            )}
        </div>
    );
};

const ScanComparison: React.FC<ScanComparisonProps> = ({ scans, onBack }) => {
  const baseScan = scans[0];

  const comparisonData = useMemo(() => {
    if (!baseScan || !baseScan.result) return [];
    
    const baseVulns = new Map(baseScan.result.vulnerabilities.map(v => [v.title, v]));

    return scans.map((scan, index) => {
      if (!scan.result) return { ...scan, comparedVulnerabilities: [] };

      // For the base scan, just mark all its own vulnerabilities as 'Unchanged' for display consistency
      if (index === 0) {
        // FIX: Replaced object spread with Object.assign to resolve TS2698
        const vulns = scan.result.vulnerabilities.map(v => Object.assign({}, v, {status: 'Unchanged' as ComparisonStatus}));
        return { ...scan, comparedVulnerabilities: vulns };
      }
      
      const currentVulns = new Map(scan.result.vulnerabilities.map(v => [v.title, v]));
      const comparedVulnerabilities: ComparedVulnerability[] = [];
      
      // Find New and Unchanged vulnerabilities by iterating through the current scan's findings
      for (const [title, vuln] of currentVulns.entries()) {
        // FIX: Replaced object spread with Object.assign to resolve TS2698
        comparedVulnerabilities.push(Object.assign({}, vuln, {
          status: baseVulns.has(title) ? 'Unchanged' : 'New',
        }));
      }

      // Find Resolved vulnerabilities by checking which base vulnerabilities are missing from the current scan
      for (const [title, vuln] of baseVulns.entries()) {
        if (!currentVulns.has(title)) {
          comparedVulnerabilities.push(Object.assign({}, vuln, {
            status: 'Resolved',
          }));
        }
      }
      
      // Sort for consistent display (e.g., Critical first)
      comparedVulnerabilities.sort((a, b) => {
          const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
      });

      return { ...scan, comparedVulnerabilities };
    });
  }, [scans, baseScan]);

  if (scans.length < 2) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl">Please select at least two scans to compare.</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition">
          &larr; Back to Scans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Scan Comparison</h1>
        <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 font-medium">
          &larr; Back to Scans
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Summary Comparison</h2>
        <div className={`grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-${scans.length}`}>
          {scans.map((scan, index) => (
            <div key={scan.id}>
              <h3 className="font-bold truncate text-gray-300" title={scan.contractAddress}>{scan.contractAddress}</h3>
              <p className="text-xs text-gray-500 mb-2">{scan.submittedAt.toLocaleString()}</p>
              {index === 0 && <span className="text-xs font-bold uppercase text-cyan-400">Baseline</span>}
              <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                {Object.entries(scan.result?.summary || {}).map(([severity, count]) => (
                  <div key={severity} className="bg-gray-700 p-2 rounded">
                    <p className="text-xl font-bold">{count as number}</p>
                    <p className="text-xs capitalize text-gray-400">{severity}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 grid-cols-1 md:grid-cols-${scans.length}`}>
        {comparisonData.map((scanData, index) => (
          <div key={scanData.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="font-bold text-lg truncate" title={scanData.contractAddress}>{scanData.contractAddress}</h2>
            <p className="text-xs text-gray-400">{scanData.submittedAt.toLocaleString()}</p>
            {index === 0 && <span className="text-xs font-bold uppercase text-cyan-400">Baseline</span>}

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {scanData.comparedVulnerabilities.length > 0 ? scanData.comparedVulnerabilities.map(vuln => (
                <VulnerabilityComparisonCard key={`${vuln.id}-${vuln.status}`} vuln={vuln} isBaseScan={index === 0} />
              )) : <p className="text-sm text-gray-500 text-center pt-4">No vulnerabilities reported in this scan.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanComparison;