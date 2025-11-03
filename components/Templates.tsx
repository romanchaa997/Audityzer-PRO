
import React from 'react';

const templates = [
  { title: 'Web3 Security Audit Templates', description: 'Professional templates for smart contract audits, bug bounty programs, and incident response plans. Fast-track your Web3 security workflow.', type: 'Digital Download' },
  { title: 'Bug Bounty Starter Kits', description: 'Everything a project needs to launch its first security bug bounty—legal contracts, standard rules, submission forms, templates, and a promo toolkit.', type: 'Digital Kit/Download' },
];

const TemplateCard: React.FC<{ title: string, description: string, type: string }> = ({ title, description, type }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-cyan-400 transition">
        <span className="text-xs font-semibold uppercase text-cyan-400">{type}</span>
        <h3 className="text-xl font-semibold mt-2">{title}</h3>
        <p className="text-gray-400 text-sm mt-2">{description}</p>
        <button className="mt-6 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition">
            Download
        </button>
    </div>
);

const Templates: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Templates & Kits</h1>
       <p className="text-gray-400 max-w-2xl">
        Accelerate your security programs with our expertly crafted templates and starter kits.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(template => (
          <TemplateCard key={template.title} {...template} />
        ))}
      </div>
    </div>
  );
};

export default Templates;
