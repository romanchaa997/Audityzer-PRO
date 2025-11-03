
import React, { useState } from 'react';

// Define algorithm details in a structured way for clarity and maintainability
const pqcAlgorithms = [
  { 
    id: 'kyber', 
    name: 'CRYSTALS-Kyber (Recommended)', 
    description: 'A key encapsulation mechanism (KEM) chosen as a NIST standard. It is highly efficient and designed to establish secure communication channels resistant to quantum attacks.' 
  },
  { 
    id: 'dilithium', 
    name: 'CRYSTALS-Dilithium', 
    description: 'A digital signature algorithm (DSA) also chosen as a NIST standard. It is used to verify the authenticity and integrity of messages, providing strong security guarantees.' 
  },
  { 
    id: 'sphincs', 
    name: 'SPHINCS+', 
    description: 'A stateless hash-based signature scheme, another NIST standard. Its security relies on well-understood hash function properties, offering a conservative and robust choice.' 
  },
];


const Settings: React.FC = () => {
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState(pqcAlgorithms[0].id);
  
  const selectedAlgorithm = pqcAlgorithms.find(algo => algo.id === selectedAlgorithmId);

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-4 mb-4">API & Security</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">Audityzer API Key</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input type="text" id="api-key" readOnly value={`aud_************************${'1a2b'}`} className="block w-full rounded-none rounded-l-md bg-gray-700 border-gray-600 px-3 py-2 sm:text-sm" />
              <button className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-600 bg-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-500">
                <span>Copy</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">Your API key for programmatic access. Do not share this key publicly.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="pqc-algo" className="block text-sm font-medium text-gray-300">Post-Quantum Cryptography</label>
            <select 
              id="pqc-algo" 
              value={selectedAlgorithmId}
              onChange={(e) => setSelectedAlgorithmId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 py-2 pl-3 pr-10 text-base focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
              aria-describedby="pqc-description"
            >
              {pqcAlgorithms.map(algo => (
                <option key={algo.id} value={algo.id}>{algo.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">Select the quantum-resistant algorithm for signature verification and key exchange.</p>
             {selectedAlgorithm && (
              <div id="pqc-description" className="mt-2 p-3 bg-gray-700/50 border border-gray-600 rounded-md text-sm text-gray-300 transition-all" aria-live="polite">
                <p>{selectedAlgorithm.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
       <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-4 mb-4">Notifications</h2>
        <fieldset className="space-y-4">
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input id="email-notifs" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"/>
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email-notifs" className="font-medium text-gray-300">Email Notifications</label>
                <p className="text-gray-400">Receive summaries of scan reports and security alerts via email.</p>
              </div>
            </div>
             <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input id="push-notifs" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"/>
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="push-notifs" className="font-medium text-gray-300">Push Notifications</label>
                <p className="text-gray-400">Get instant alerts on your mobile device (requires mobile app).</p>
              </div>
            </div>
        </fieldset>
      </div>

    </div>
  );
};

export default Settings;
