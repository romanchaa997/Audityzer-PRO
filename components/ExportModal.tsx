import React, { useState } from 'react';
import type { ScanResult } from '../types';
import { exportToCSV, exportToPDF } from '../services/exportService';

interface ExportModalProps {
  result: ScanResult;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ result, onClose }) => {
  const [includeBranding, setIncludeBranding] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeVulnerabilities, setIncludeVulnerabilities] = useState(true);
  const [addWatermark, setAddWatermark] = useState(false);

  const handleExport = (format: 'csv' | 'pdf') => {
    const options = {
      includeBranding,
      includeSummary,
      includeVulnerabilities,
      addWatermark,
    };
    if (format === 'csv') {
      exportToCSV(result, options);
    } else {
      exportToPDF(result, options);
    }
    onClose();
  };
  
  const CheckboxOption: React.FC<{ id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; description: string; }> = ({ id, label, checked, onChange, description }) => (
    <div className="relative flex items-start">
        <div className="flex h-5 items-center">
            <input 
                id={id} 
                name={id}
                type="checkbox" 
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500 bg-gray-700"
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium text-gray-200">{label}</label>
            <p className="text-gray-400">{description}</p>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h2 id="export-modal-title" className="text-xl font-bold">Export Scan Report</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <div className="space-y-4 mb-6">
            <h3 className="text-md font-semibold text-gray-300">Customization Options</h3>
            <CheckboxOption id="include-branding" label="Include Branding" checked={includeBranding} onChange={setIncludeBranding} description="Add 'Audityzer PRO' branding to the report." />
            <CheckboxOption id="include-summary" label="Include Summary" checked={includeSummary} onChange={setIncludeSummary} description="Include the vulnerability summary counts." />
            <CheckboxOption id="include-vulnerabilities" label="Include Vulnerabilities" checked={includeVulnerabilities} onChange={setIncludeVulnerabilities} description="Include the detailed list of findings." />
            <CheckboxOption id="add-watermark" label="Add Confidentiality Watermark" checked={addWatermark} onChange={setAddWatermark} description="Mark the report as confidential." />
        </div>
        
        <div className="flex justify-end space-x-4">
            <button onClick={() => handleExport('csv')} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition">
                Export as CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition">
                Export as PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
