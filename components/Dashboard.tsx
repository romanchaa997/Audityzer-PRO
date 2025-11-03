
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const vulnerabilityData = [
  { name: 'Critical', value: 8, fill: '#ef4444' },
  { name: 'High', value: 15, fill: '#f97316' },
  { name: 'Medium', value: 22, fill: '#eab308' },
  { name: 'Low', value: 40, fill: '#22c55e' },
];

const scanHistoryData = [
    { month: 'Jan', scans: 120, vulnerabilities: 30 },
    { month: 'Feb', scans: 150, vulnerabilities: 45 },
    { month: 'Mar', scans: 130, vulnerabilities: 35 },
    { month: 'Apr', scans: 180, vulnerabilities: 60 },
    { month: 'May', scans: 210, vulnerabilities: 75 },
    { month: 'Jun', scans: 190, vulnerabilities: 65 },
];

const coverageTrendData = [
    { month: 'Jan', coverage: 88 },
    { month: 'Feb', coverage: 90 },
    { month: 'Mar', coverage: 91 },
    { month: 'Apr', coverage: 92.5 },
    { month: 'May', coverage: 92 },
    { month: 'Jun', coverage: 93 },
];


const MetricCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-cyan-400 mt-2">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Test Coverage" value="92%" description="Overall test coverage of audited contracts" />
          <MetricCard title="Avg. Execution Speed" value="12.3s" description="Average time per full scan" />
          <MetricCard title="Defect Density" value="0.8/kLoC" description="Defects per 1,000 lines of code" />
          <MetricCard title="Automation Index" value="85%" description="Percentage of automated tests" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Scan History (6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scanHistoryData}>
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Legend />
                    <Bar dataKey="scans" fill="#38bdf8" name="Scans" />
                    <Bar dataKey="vulnerabilities" fill="#eab308" name="Vulnerabilities Found" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Vulnerability Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={vulnerabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                        {vulnerabilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Test Coverage Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={coverageTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[85, 100]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
                <Line type="monotone" dataKey="coverage" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 8 }} name="Test Coverage (%)" />
            </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default Dashboard;
