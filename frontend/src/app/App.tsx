import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Network, Clock, Server, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

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

export default function App() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [metrics, setMetrics] = useState<Record<string, MachineMetrics>>({});
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/machines`);
        if (!response.ok) {
          throw new Error('Failed to fetch machines');
        }
        const data: Machine[] = await response.json();
        setMachines(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMachines();
  }, []);

  useEffect(() => {
    if (machines.length === 0) return;

    const fetchAllMetrics = async () => {
      await Promise.all(
        machines.map(async (machine) => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/v1/machines/${machine.id}/metrics/history`);
            if (!res.ok) return;
            const records: Array<{
              machineId: string;
              recordedAt: string;
              cpuUsage: number;
              ramUsage: number;
              diskUsage: number;
              netInKbps: number | null;
              netOutKbps: number | null;
              uptimeSeconds: number | null;
            }> = await res.json();
            if (records.length === 0) return;

            const latest = records[records.length - 1];
            const history = records.map(r => ({
              time: new Date(r.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              timestamp: new Date(r.recordedAt).getTime(),
              cpu: r.cpuUsage,
              ram: r.ramUsage,
              disk: r.diskUsage,
              netIn: r.netInKbps ?? 0,
              netOut: r.netOutKbps ?? 0,
            }));

            setMetrics(prev => ({
              ...prev,
              [machine.id]: {
                machineId: machine.id,
                recordedAt: latest.recordedAt,
                cpuUsage: latest.cpuUsage,
                ramUsage: latest.ramUsage,
                diskUsage: latest.diskUsage,
                netInKbps: latest.netInKbps ?? 0,
                netOutKbps: latest.netOutKbps ?? 0,
                uptimeSeconds: latest.uptimeSeconds ?? 0,
                history,
              },
            }));
          } catch (err) {
            console.error('Failed to fetch metrics for', machine.id, err);
          }
        })
      );
    };

    fetchAllMetrics();
    const interval = setInterval(fetchAllMetrics, 3000);
    return () => clearInterval(interval);
  }, [machines]);

  const getOverallStatus = (machine: Machine) => {
    const machineMetrics = metrics[machine.id];
    if (!machineMetrics) return 'healthy';

    const issues: string[] = [];
    if (machineMetrics.cpuUsage >= 85) issues.push('critical');
    else if (machineMetrics.cpuUsage >= 70) issues.push('warning');
    if (machineMetrics.ramUsage >= 90) issues.push('critical');
    else if (machineMetrics.ramUsage >= 75) issues.push('warning');
    if (machineMetrics.diskUsage >= 90) issues.push('critical');
    else if (machineMetrics.diskUsage >= 80) issues.push('warning');

    if (issues.includes('critical')) return 'critical';
    if (issues.includes('warning')) return 'warning';
    return 'healthy';
  };

  const displayedMachine = selectedMachine
    ? machines.find(m => m.id === selectedMachine)
    : null;
  const displayedMachineMetrics = displayedMachine ? metrics[displayedMachine.id] : null;

  return (
    <div className="size-full bg-neutral-950 text-white overflow-auto">
      <div className="max-w-[1800px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">System Monitor</h1>
          <div className="text-sm text-neutral-400">
            {machines.length} machines connected
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {machines.map(machine => {
            const status = getOverallStatus(machine);
            const isSelected = selectedMachine === machine.id;
            const machineMetrics = metrics[machine.id];

            return (
              <button
                key={machine.id}
                onClick={() => setSelectedMachine(isSelected ? null : machine.id)}
                className={`bg-neutral-900 border p-6 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-neutral-400" />
                    <span className="font-mono text-sm">{machine.name}</span>
                  </div>
                  {status === 'critical' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  {status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                  {status === 'healthy' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-neutral-500 mb-1">CPU</div>
                    <div className={getStatusColor(machineMetrics?.cpuUsage ?? 0, { warning: 70, critical: 85 })}>
                      {(machineMetrics?.cpuUsage ?? 0).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">RAM</div>
                    <div className={getStatusColor(machineMetrics?.ramUsage ?? 0, { warning: 75, critical: 90 })}>
                      {(machineMetrics?.ramUsage ?? 0).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">Disk</div>
                    <div className={getStatusColor(machineMetrics?.diskUsage ?? 0, { warning: 80, critical: 90 })}>
                      {(machineMetrics?.diskUsage ?? 0).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed View */}
        {displayedMachine && displayedMachineMetrics ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl mb-1">{displayedMachine.name}</h2>
                <div className="text-sm text-neutral-400">
                  Last updated: {new Date(displayedMachineMetrics.recordedAt).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedMachine(null)}
                className="text-sm text-neutral-400 hover:text-white"
              >
                Close Details
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                  <Cpu className="w-4 h-4" />
                  <span>CPU</span>
                </div>
                <div className={`text-4xl mb-1 ${getStatusColor(displayedMachineMetrics.cpuUsage, { warning: 70, critical: 85 })}`}>
                  {displayedMachineMetrics.cpuUsage.toFixed(1)}%
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                  <Activity className="w-4 h-4" />
                  <span>RAM</span>
                </div>
                <div className={`text-4xl mb-1 ${getStatusColor(displayedMachineMetrics.ramUsage, { warning: 75, critical: 90 })}`}>
                  {displayedMachineMetrics.ramUsage.toFixed(1)}%
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                  <HardDrive className="w-4 h-4" />
                  <span>Disk Space</span>
                </div>
                <div className={`text-4xl mb-1 ${getStatusColor(displayedMachineMetrics.diskUsage, { warning: 80, critical: 90 })}`}>
                  {displayedMachineMetrics.diskUsage.toFixed(1)}%
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                  <Network className="w-4 h-4" />
                  <span>Net In</span>
                </div>
                <div className="text-4xl text-white mb-1">
                  {displayedMachineMetrics.netInKbps.toFixed(0)}
                </div>
                <div className="text-xs text-neutral-500">Kbps</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                  <Network className="w-4 h-4" />
                  <span>Net Out</span>
                </div>
                <div className="text-4xl text-white mb-1">
                  {displayedMachineMetrics.netOutKbps.toFixed(0)}
                </div>
                <div className="text-xs text-neutral-500">Kbps</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Uptime</span>
                </div>
                <div className="text-2xl text-white mb-1">
                  {formatUptime(displayedMachineMetrics.uptimeSeconds)}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <h3 className="text-sm text-neutral-400 mb-4">CPU & RAM Usage</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={displayedMachineMetrics.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="time" stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: '#a3a3a3' }}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} dot={false} name="CPU %" />
                    <Line type="monotone" dataKey="ram" stroke="#3b82f6" strokeWidth={2} dot={false} name="RAM %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <h3 className="text-sm text-neutral-400 mb-4">Network Traffic</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={displayedMachineMetrics.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="time" stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: '#a3a3a3' }}
                    />
                    <Line type="monotone" dataKey="netIn" stroke="#10b981" strokeWidth={2} dot={false} name="In (Kbps)" />
                    <Line type="monotone" dataKey="netOut" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Out (Kbps)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 p-12 text-center text-neutral-500">
            Select a machine above to view detailed metrics
          </div>
        )}
      </div>
    </div>
  );
}
