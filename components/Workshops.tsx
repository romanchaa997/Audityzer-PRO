
import React from 'react';

const offerings = [
    { title: 'On-Demand Mini-Courses: Web3 Secure Dev', description: 'Bite-sized, actionable workshops for Web3 devs aiming to upskill in smart contract security. Includes hands-on exercises, real-world bug bounty case studies, and Q&A.', price: '$49–$199 per session', type: 'Service/Event' },
    { title: '1:1 Web3 Security Consulting', description: 'Book a personalized strategy session: code review, vulnerability triage, or security strategy deep-dive with a Web3 expert.', price: '$99–$299/hour', type: 'Service Product' },
];

const OfferingCard: React.FC<{ title: string, description: string, price: string, type: string }> = ({ title, description, price, type }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col hover:border-cyan-400 transition">
        <span className="text-xs font-semibold uppercase text-cyan-400">{type}</span>
        <h3 className="text-xl font-semibold mt-2">{title}</h3>
        <p className="text-gray-400 text-sm mt-2 flex-grow">{description}</p>
        <p className="text-lg font-bold mt-4 text-white">{price}</p>
        <button className="mt-4 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition">
            Learn More
        </button>
    </div>
);

const Workshops: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Training & Consulting</h1>
      <p className="text-gray-400 max-w-2xl">
        Upskill your team or get expert guidance with our specialized workshops and one-on-one consulting sessions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offerings.map(offering => (
          <OfferingCard key={offering.title} {...offering} />
        ))}
      </div>
    </div>
  );
};

export default Workshops;
