
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, LoaderIcon } from './ui/Icons';

const validationSteps = [
  'Source Mirror (Direct Validation)',
  'Cross-Reference Mirror (External Correlation)',
  'Semantic Mirror (Content Analysis)',
  'Meta-Validation Mirror (Higher-Order Logic)',
  'Generating Report...'
];

interface ValidationStepProps {
  title: string;
  status: 'pending' | 'running' | 'completed';
}

const ValidationStep: React.FC<ValidationStepProps> = ({ title, status }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-between transition-all duration-500 border border-gray-700">
      <p className="font-medium text-lg">{title}</p>
      <div>
        {status === 'running' && <LoaderIcon className="w-8 h-8 text-yellow-400 animate-spin" />}
        {status === 'completed' && <CheckCircleIcon className="w-8 h-8 text-green-400" />}
        {status === 'pending' && <div className="w-8 h-8 rounded-full bg-gray-600"></div>}
      </div>
    </div>
  );
};


const ScanProgress: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < validationSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1500 + Math.random() * 500); // Simulate variable step duration
      return () => clearTimeout(timer);
    } else {
        onComplete();
    }
  }, [currentStep, onComplete]);

  const getStatus = (stepIndex: number): 'pending' | 'running' | 'completed' => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'running';
    return 'pending';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">AI Analysis in Progress...</h1>
        {validationSteps.map((title, index) => (
          <ValidationStep key={title} title={title} status={getStatus(index)} />
        ))}
         <p className="text-center text-gray-400 pt-4">This process leverages our advanced Four-Mirror Validation engine to ensure the highest accuracy.</p>
      </div>
    </div>
  );
};

export default ScanProgress;
