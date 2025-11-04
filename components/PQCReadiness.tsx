import React, { useMemo } from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

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

const PQCReadiness: React.FC = () => {
  const { readinessScore, total, migrated, pending, vulnerable } = useMemo(() => {
    const total = cryptoAssets.length;
    const migrated = cryptoAssets.filter(a => a.status === 'Migrated').length;
    const pending = cryptoAssets.filter(a => a.status === 'Pending').length;
    const vulnerable = cryptoAssets.filter(a => a.status === 'Vulnerable').length;
    const readinessScore = total > 0 ? Math.round((migrated / total) * 100) : 0;
    return { readinessScore, total, migrated, pending, vulnerable };
  }, []);
  
  const chartData = [{ name: 'Readiness', value: readinessScore, fill: '#22d3ee' }];

  return (
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
        <div className="p-6">
          <h2 className="text-xl font-semibold">Cryptographic Asset Inventory</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Algorithm</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notes</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {cryptoAssets.map(asset => (
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
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default PQCReadiness;