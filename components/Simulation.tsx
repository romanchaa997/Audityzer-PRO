import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { LoaderIcon, CheckCircleIcon, XCircleIcon, ArrowRightCircleIcon } from './ui/Icons';

type NodeStatus = 'pending' | 'active' | 'pass' | 'fail';
type SimStatus = 'idle' | 'running' | 'finished';
type LogEntry = {
    timestamp: string;
    message: string;
};

const statusConfig: { [key in NodeStatus]: { color: string; icon: ReactNode; text: string } } = {
    pending: { color: 'border-gray-600', icon: <div className="w-5 h-5 rounded-full bg-gray-600"></div>, text: 'Pending' },
    active: { color: 'border-cyan-500 animate-pulse-slow', icon: <LoaderIcon className="w-5 h-5 text-cyan-400 animate-spin" />, text: 'Processing...' },
    pass: { color: 'border-green-500', icon: <CheckCircleIcon className="w-5 h-5 text-green-400" />, text: 'Clear' },
    fail: { color: 'border-red-500', icon: <XCircleIcon className="w-5 h-5 text-red-400" />, text: 'Threat Detected' },
};

const arbitrationConfig = {
    ...statusConfig,
    pass: { ...statusConfig.pass, text: 'Approved' },
    fail: { ...statusConfig.fail, text: 'Rejected' },
};

const FlowNode: React.FC<{ title: string; status: NodeStatus; config?: typeof statusConfig; children?: ReactNode }> = ({ title, status, config = statusConfig, children }) => {
    const { color, icon, text } = config[status];
    return (
        <div className={`bg-gray-800 border-2 ${color} rounded-lg shadow-lg w-64 min-h-[8rem] flex flex-col justify-between p-4 transition-all duration-500`}>
            <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-300">
                    {icon}
                    <span>{text}</span>
                </div>
            </div>
            {children && <div className="text-xs text-gray-400 mt-2">{children}</div>}
        </div>
    );
};

const Connector: React.FC<{ active: boolean }> = ({ active }) => (
    <div className="relative w-full h-1 my-4">
        <div className="absolute inset-0 bg-gray-700 rounded"></div>
        <div className={`absolute inset-0 bg-cyan-400 rounded transition-all duration-1000 ${active ? 'w-full' : 'w-0'}`} style={{ backgroundImage: active ? 'linear-gradient(90deg, #1E1E1E, #22d3ee)' : '' }}></div>
    </div>
);

const AISecuritySimulation: React.FC = () => {
    const [simStatus, setSimStatus] = useState<SimStatus>('idle');
    const [reqStatus, setReqStatus] = useState<NodeStatus>('pending');
    const [sysAStatus, setSysAStatus] = useState<NodeStatus>('pending');
    const [sysBStatus, setSysBStatus] = useState<NodeStatus>('pending');
    const [arbStatus, setArbStatus] = useState<NodeStatus>('pending');
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message }]);
    };

    const resetSimulation = useCallback(() => {
        setSimStatus('idle');
        setReqStatus('pending');
        setSysAStatus('pending');
        setSysBStatus('pending');
        setArbStatus('pending');
        setLogs([]);
    }, []);

    const runSimulation = useCallback(() => {
        resetSimulation();
        setSimStatus('running');

        // FIX: The return type of `setTimeout` in a browser environment is `number`, not `NodeJS.Timeout`.
        const timeouts: number[] = [];
        const runStep = (fn: () => void, delay: number) => timeouts.push(setTimeout(fn, delay));

        addLog("Simulation started: Incoming request received.");
        runStep(() => setReqStatus('active'), 250);

        runStep(() => {
            addLog("Request forwarded to analysis systems.");
            setSysAStatus('active');
            setSysBStatus('active');
        }, 1500);

        runStep(() => {
            const outcomeA = Math.random() > 0.4 ? 'pass' : 'fail';
            setSysAStatus(outcomeA);
            addLog(`System A (AI Heuristic) completed. Result: ${outcomeA.toUpperCase()}`);

            const outcomeB = Math.random() > 0.2 ? 'pass' : 'fail';
            setSysBStatus(outcomeB);
            addLog(`System B (Symbolic Execution) completed. Result: ${outcomeB.toUpperCase()}`);

            runStep(() => {
                addLog("Results sent to Arbitration Layer.");
                setArbStatus('active');

                runStep(() => {
                    const finalOutcome = (outcomeA === 'pass' && outcomeB === 'pass') ? 'pass' : 'fail';
                    setArbStatus(finalOutcome);
                    setReqStatus(finalOutcome);
                    addLog(`Arbitration complete. Final Decision: ${finalOutcome === 'pass' ? 'APPROVED' : 'REJECTED'}`);
                    addLog("Simulation finished.");
                    setSimStatus('finished');
                }, 1500);
            }, 500);
        }, 3500);

        return () => timeouts.forEach(clearTimeout);
    }, [resetSimulation]);
    
    useEffect(() => {
        // Auto-scroll logs
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">AI Security Simulation</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-xl font-semibold">Threat Flow Visualization</h2>
                <div className="flex justify-center items-center space-x-8 py-8 min-h-[20rem]">
                    {/* Column 1: Request */}
                    <FlowNode title="Incoming Request" status={reqStatus} />

                    {/* Connectors */}
                    <div className="flex flex-col items-center justify-center h-full w-32">
                        <Connector active={sysAStatus !== 'pending'} />
                        <Connector active={sysBStatus !== 'pending'} />
                    </div>

                    {/* Column 2: Systems */}
                    <div className="flex flex-col space-y-8">
                        <FlowNode title="System A" status={sysAStatus}>AI Heuristic Analysis</FlowNode>
                        <FlowNode title="System B" status={sysBStatus}>Symbolic Execution</FlowNode>
                    </div>

                    {/* Connectors */}
                    <div className="flex flex-col items-center justify-center h-full w-32">
                        <Connector active={arbStatus !== 'pending'} />
                    </div>

                    {/* Column 3: Arbitration */}
                    <FlowNode title="Arbitration Layer" status={arbStatus} config={arbitrationConfig} />
                </div>
                 <div className="flex items-center justify-center space-x-4">
                    <button onClick={runSimulation} disabled={simStatus === 'running'} className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed">Start Simulation</button>
                    <button onClick={resetSimulation} disabled={simStatus === 'idle'} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition disabled:opacity-50">Reset</button>
                </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-2 px-2">Simulation Log</h2>
                <div id="log-container" className="h-48 overflow-y-auto bg-gray-900/50 rounded p-2 font-mono text-sm">
                    {logs.length > 0 ? logs.map((log, index) => (
                        <p key={index} className="text-gray-300"><span className="text-gray-500 mr-2">{log.timestamp}</span>{log.message}</p>
                    )) : <p className="text-gray-500">Simulation not started. Click "Start Simulation" to begin.</p>}
                </div>
            </div>
        </div>
    );
};

export default AISecuritySimulation;