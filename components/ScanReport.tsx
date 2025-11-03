import React, { useState } from 'react';
import type { ScanResult, Vulnerability } from '../types';
import ExportModal from './ExportModal';

interface ScanReportProps {
  result: ScanResult;
  onBack: () => void;
}

const severityColorMap = {
  Critical: 'border-red-500 bg-red-500/10 text-red-300',
  High: 'border-orange-500 bg-orange-500/10 text-orange-300',
  Medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-300',
  Low: 'border-green-500 bg-green-500/10 text-green-300',
};

const VulnerabilityCard: React.FC<{ vuln: Vulnerability }> = ({ vuln }) => (
    <div className={`border-l-4 p-4 rounded-r-lg ${severityColorMap[vuln.severity]} bg-gray-800 mb-4`}>
        <h3 className="text-lg font-bold">{vuln.title} <span className="text-sm font-normal">({vuln.severity})</span></h3>
        <p className="mt-2 text-gray-300">{vuln.description}</p>
        <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="font-semibold text-cyan-400">Recommendation</h4>
            <p className="mt-1 text-gray-400 text-sm">{vuln.recommendation}</p>
        </div>
    </div>
);


const ScanReport: React.FC<ScanReportProps> = ({ result, onBack }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Scan Report</h1>
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 font-medium">
              &larr; Back to Scans
            </button>
            <button 
              onClick={() => setIsExportModalOpen(true)} 
              className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition"
              aria-haspopup="dialog"
              aria-expanded={isExportModalOpen}
            >
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {Object.entries(result.summary).map(([severity, count]) => (
            <div key={severity} className={`p-4 rounded-lg border-2 ${severityColorMap[severity as keyof typeof severityColorMap]}`}>
              <p className="text-4xl font-bold">{count}</p>
              <p className="text-sm capitalize">{severity}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Detailed Findings</h2>
          {result.vulnerabilities.length > 0 ? (
            result.vulnerabilities.map(vuln => (
              <VulnerabilityCard key={vuln.id} vuln={vuln} />
            ))
          ) : (
            <p className="text-gray-400">No vulnerabilities were found in this scan.</p>
          )}
        </div>
      </div>

      {isExportModalOpen && (
        <ExportModal result={result} onClose={() => setIsExportModalOpen(false)} />
      )}
    </>
  );
};

export default ScanReport;