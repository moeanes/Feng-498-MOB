import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Network, Clock, Server, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Machine {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  osName: string;
  agentVersion: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen: string;
  createdAt: string;
}

interface MachineMetrics {
  machineId: string;
  recordedAt: string;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  netInKbps: number;
  netOutKbps: number;
  uptimeSeconds: number;
  history: Array<{
    time: string;
    timestamp: number;
    cpu: number;
    ram: number;
    disk: number;
    netIn: number;
    netOut: number;
  }>;
}

// Generate mock historical data
const generateHistoricalData = () => {
  const data: Array<{
    time: string;
    timestamp: number;
    cpu: number;
    ram: number;
    disk: number;
    netIn: number;
    netOut: number;
  }> = [];
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    const timestamp = now - i * 60000; // 1 minute intervals
    data.push({
      time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp,
      cpu: 15 + Math.random() * 45,
      ram: 40 + Math.random() * 30,
      disk: 62 + Math.random() * 8,
      netIn: 100 + Math.random() * 400,
      netOut: 50 + Math.random() * 200,
    });
  }
  return data;
};

// Generate mock current metrics for a machine
const generateCurrentMetrics = (machineId: string, baseValues: any): MachineMetrics => ({
  machineId,
  recordedAt: new Date().toISOString(),
  cpuUsage: baseValues.cpuBase + Math.random() * 15,
  ramUsage: baseValues.ramBase + Math.random() * 10,
  diskUsage: baseValues.diskBase + Math.random() * 5,
  netInKbps: baseValues.netInBase + Math.random() * 200,
  netOutKbps: baseValues.netOutBase + Math.random() * 100,
  uptimeSeconds: baseValues.uptimeBase + Math.floor(Math.random() * 10000),
  history: generateHistoricalData(),
});

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
};

const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
  if (value >= thresholds.critical) return 'text-red-500';
  if (value >= thresholds.warning) return 'text-yellow-500';
  return 'text-green-500';
};

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [metrics, setMetrics] = useState<Record<string, MachineMetrics>>({});
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('/api/v1/machines');
        if (!response.ok) {
          throw new Error('Failed to fetch machines');
        }
        const data: Machine[] = await response.json();
        setMachines(data);
        if (data.length > 0) {
          setSelectedMachine(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching machines:', error);
        // Fallback to mock data on error
        const mockMachines: Machine[] = [
          { id: '1', name: 'Production Server', hostname: 'prod-01', ipAddress: '192.168.1.10', osName: 'Ubuntu 22.04', agentVersion: '1.2.3', status: 'ONLINE', lastSeen: new Date().toISOString(), createdAt: new Date().toISOString() },
          { id: '2', name: 'Staging Server', hostname: 'stage-01', ipAddress: '192.168.1.11', osName: 'CentOS 8', agentVersion: '1.2.3', status: 'OFFLINE', lastSeen: new Date(Date.now() - 300000).toISOString(), createdAt: new Date().toISOString() },
          { id: '3', name: 'Dev Server', hostname: 'dev-01', ipAddress: '192.168.1.12', osName: 'Windows Server 2022', agentVersion: '1.2.3', status: 'ONLINE', lastSeen: new Date().toISOString(), createdAt: new Date().toISOString() },
        ];
        setMachines(mockMachines);
        if (mockMachines.length > 0) {
          setSelectedMachine(mockMachines[0].id);
        }
      }
    };
    fetchMachines();
  }, []);

  useEffect(() => {
    if (machines.length > 0) {
      const baseValues = {
        '1': { cpuBase: 20, ramBase: 50, diskBase: 70, netInBase: 300, netOutBase: 150, uptimeBase: 500000 },
        '2': { cpuBase: 10, ramBase: 30, diskBase: 40, netInBase: 100, netOutBase: 50, uptimeBase: 200000 },
        '3': { cpuBase: 5, ramBase: 20, diskBase: 30, netInBase: 50, netOutBase: 20, uptimeBase: 100000 },
      };
      const interval = setInterval(() => {
        const newMetrics: Record<string, MachineMetrics> = {};
        machines.forEach(m => {
          if (m.status === 'ONLINE') {
            newMetrics[m.id] = generateCurrentMetrics(m.id, (baseValues as any)[m.id] || baseValues['3']);
          }
        });
        setMetrics(currentMetrics => ({ ...currentMetrics, ...newMetrics }));
      }, 3000); // Update every 3 seconds
      return () => clearInterval(interval);
    }
  }, [machines]);

  const currentMetrics = selectedMachine ? metrics[selectedMachine] : null;

  return (
    <div className="flex h-screen bg-neutral-900 text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-neutral-950 p-4 flex flex-col border-r border-neutral-800">
        <div className="flex items-center gap-2 mb-8">
          <Server className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl">System Monitor</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <h2 className="text-sm text-neutral-500 uppercase tracking-wider mb-2">Machines</h2>
          {machines.map(machine => (
            <button
              key={machine.id}
              onClick={() => setSelectedMachine(machine.id)}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-colors ${
                selectedMachine === machine.id ? 'bg-blue-600' : 'hover:bg-neutral-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${machine.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="flex-1 truncate">{machine.name}</span>
              <span className="text-xs text-neutral-400">{machine.ipAddress}</span>
            </button>
          ))}
        </nav>
        <div className="text-xs text-neutral-600">
          <p>&copy; 2024 System Monitor</p>
          <p>Version 1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {currentMetrics ? (
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl">{machines.find(m => m.id === selectedMachine)?.name}</h2>
                  <p className="text-neutral-400">{machines.find(m => m.id === selectedMachine)?.hostname}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${machines.find(m => m.id === selectedMachine)?.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {machines.find(m => m.id === selectedMachine)?.status}
                  </span>
                  <span>|</span>
                  <span>Last seen: {new Date(machines.find(m => m.id === selectedMachine)?.lastSeen || 0).toLocaleString()}</span>
                </div>
              </div>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <Cpu className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-neutral-400">CPU Usage</p>
                    <p className={`text-2xl font-bold ${getStatusColor(currentMetrics.cpuUsage, { warning: 70, critical: 90 })}`}>
                      {currentMetrics.cpuUsage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <Activity className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-neutral-400">RAM Usage</p>
                    <p className={`text-2xl font-bold ${getStatusColor(currentMetrics.ramUsage, { warning: 80, critical: 95 })}`}>
                      {currentMetrics.ramUsage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <HardDrive className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-neutral-400">Disk Usage</p>
                    <p className={`text-2xl font-bold ${getStatusColor(currentMetrics.diskUsage, { warning: 85, critical: 95 })}`}>
                      {currentMetrics.diskUsage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <Network className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-neutral-400">Network</p>
                    <p className="text-lg">
                      ↓ {currentMetrics.netInKbps.toFixed(1)} kbps / ↑ {currentMetrics.netOutKbps.toFixed(1)} kbps
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-800 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-neutral-400">Uptime</p>
                    <p className="text-lg">{formatUptime(currentMetrics.uptimeSeconds)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl mb-4">CPU Usage (%)</h3>
                <div className="h-64 bg-neutral-800 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentMetrics.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis dataKey="time" stroke="#a3a3a3" fontSize={12} />
                      <YAxis stroke="#a3a3a3" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040' }}
                        labelStyle={{ color: '#d4d4d4' }}
                      />
                      <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-xl mb-4">RAM Usage (%)</h3>
                <div className="h-64 bg-neutral-800 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentMetrics.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis dataKey="time" stroke="#a3a3a3" fontSize={12} />
                      <YAxis stroke="#a3a3a3" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040' }}
                        labelStyle={{ color: '#d4d4d4' }}
                      />
                      <Line type="monotone" dataKey="ram" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-xl mb-4">Network Traffic (kbps)</h3>
                <div className="h-64 bg-neutral-800 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentMetrics.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis dataKey="time" stroke="#a3a3a3" fontSize={12} />
                      <YAxis stroke="#a3a3a3" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040' }}
                        labelStyle={{ color: '#d4d4d4' }}
                      />
                      <Line type="monotone" dataKey="netIn" name="Inbound" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="netOut" name="Outbound" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h2 className="text-2xl mb-2">No Machine Selected</h2>
              <p className="text-neutral-400">Please select a machine from the sidebar to view its metrics.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
