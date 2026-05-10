import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Network, Clock, Server, AlertCircle, Zap, LogOut, Plus, Copy, Check, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch, clearAuthToken, UnauthorizedError, createMachine, issueToken, deleteMachine } from './api';
import { useNavigate } from './navigation';

interface Machine {
  id: string;
  name: string;
  hostname: string | null;
  ipAddress: string | null;
  osName: string | null;
  agentVersion: string | null;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen: string | null;
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

interface ProcessMetric {
  id: number;
  metricRecordId: number;
  machineId: string;
  recordedAt: string;
  processId: number | null;
  processName: string;
  instanceCount: number;
  cpuUsage: number;
  ramUsageMb: number;
  ramUsagePercent: number;
  impactScore: number;
}

interface ThresholdSettings {
  cpuWarning: number;
  cpuCritical: number;
  ramWarning: number;
  ramCritical: number;
  diskWarning: number;
  diskCritical: number;
  staleSeconds: number;
}

type AlertSeverity = 'WARNING' | 'CRITICAL';
type MachineStatusView = 'healthy' | 'warning' | 'critical' | 'offline';
type FilterMode = 'ALL' | 'ONLINE' | 'OFFLINE' | 'WINDOWS' | 'LINUX' | 'HIGH_CPU' | 'HIGH_RAM';

interface ActiveAlert {
  id: string;
  machineName: string;
  severity: AlertSeverity;
  metric: string;
  value: string;
  message: string;
}

const DEFAULT_THRESHOLDS: ThresholdSettings = {
  cpuWarning: 70,
  cpuCritical: 85,
  ramWarning: 75,
  ramCritical: 90,
  diskWarning: 80,
  diskCritical: 90,
  staleSeconds: 300,
};

const DEMO_THRESHOLDS: ThresholdSettings = {
  cpuWarning: 45,
  cpuCritical: 60,
  ramWarning: 55,
  ramCritical: 70,
  diskWarning: 50,
  diskCritical: 65,
  staleSeconds: 1800,
};

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

const formatMemory = (megabytes: number) => {
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toFixed(1)} GB`;
  }
  return `${megabytes.toFixed(0)} MB`;
};

const displayValue = (value: string | null | undefined, fallback = 'Unknown') => {
  return value && value.trim().length > 0 ? value : fallback;
};

const getImpactLabel = (impactScore: number) => {
  if (impactScore >= 70) return 'Critical';
  if (impactScore >= 40) return 'High';
  if (impactScore >= 15) return 'Medium';
  return 'Low';
};

const getImpactColor = (impactScore: number) => {
  if (impactScore >= 70) return 'text-red-400 bg-red-500/10 border-red-500/30';
  if (impactScore >= 40) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  if (impactScore >= 15) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  return 'text-green-400 bg-green-500/10 border-green-500/30';
};

const loadStoredThresholds = (): ThresholdSettings => {
  try {
    const stored = window.localStorage.getItem('monitoring-thresholds');
    if (!stored) return DEFAULT_THRESHOLDS;

    const parsed = JSON.parse(stored) as Partial<ThresholdSettings>;
    return { ...DEFAULT_THRESHOLDS, ...parsed };
  } catch {
    return DEFAULT_THRESHOLDS;
  }
};

const formatAge = (seconds: number | null) => {
  if (seconds === null) return 'No data yet';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getOperatingSystemGroup = (machine: Machine) => {
  const os = machine.osName?.toLowerCase() ?? '';
  if (os.includes('windows')) return 'WINDOWS';
  if (os.includes('linux') || os.includes('ubuntu') || os.includes('debian') || os.includes('fedora')) return 'LINUX';
  return 'OTHER';
};

const getAlertColor = (severity: AlertSeverity) => {
  return severity === 'CRITICAL'
    ? 'border-red-500/40 bg-red-500/10 text-red-300'
    : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300';
};

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [metrics, setMetrics] = useState<Record<string, MachineMetrics>>({});
  const [processMetrics, setProcessMetrics] = useState<Record<string, ProcessMetric[]>>({});
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('ALL');
  const [showSettings, setShowSettings] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [thresholds, setThresholds] = useState<ThresholdSettings>(() => loadStoredThresholds());
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [addMachineName, setAddMachineName] = useState('');
  const [addMachineLoading, setAddMachineLoading] = useState(false);
  const [addMachineResult, setAddMachineResult] = useState<{ machineId: string; token: string; name: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'id' | 'token' | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestError = (error: unknown) => {
    if (error instanceof UnauthorizedError) {
      navigate('/login');
      return;
    }
    console.error(error);
  };

  const handleAddMachine = async () => {
    if (!addMachineName.trim()) return;
    setAddMachineLoading(true);
    try {
      const machine = await createMachine(addMachineName.trim());
      const tokenData = await issueToken(machine.id);
      setAddMachineResult({ machineId: machine.id, token: tokenData.plainToken, name: machine.name });
      setAddMachineName('');
    } catch (error) {
      handleRequestError(error);
    } finally {
      setAddMachineLoading(false);
    }
  };

  const handleCopy = (text: string, field: 'id' | 'token') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCloseAddMachine = () => {
    setShowAddMachine(false);
    setAddMachineResult(null);
    setAddMachineName('');
  };

  const handleDeleteMachine = async (machineId: string) => {
    setDeleteLoading(true);
    try {
      await deleteMachine(machineId);
      setMachines(prev => prev.filter(m => m.id !== machineId));
      setMetrics(prev => { const next = { ...prev }; delete next[machineId]; return next; });
      setProcessMetrics(prev => { const next = { ...prev }; delete next[machineId]; return next; });
      if (selectedMachine === machineId) setSelectedMachine(null);
    } catch (error) {
      handleRequestError(error);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmId(null);
    }
  };

  useEffect(() => {
    window.localStorage.setItem('monitoring-thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await apiFetch('/api/v1/machines');
        if (!response.ok) {
          throw new Error('Failed to fetch machines');
        }
        const data: Machine[] = await response.json();
        setMachines(data);
      } catch (error) {
        handleRequestError(error);
      }
    };

    fetchMachines();
    const interval = setInterval(fetchMachines, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (machines.length === 0) return;

    const fetchAllMetrics = async () => {
      await Promise.all(
        machines.map(async (machine) => {
          try {
            const res = await apiFetch(`/api/v1/machines/${machine.id}/metrics/history`);
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
            handleRequestError(err);
          }
        })
      );
    };

    fetchAllMetrics();
    const interval = setInterval(fetchAllMetrics, 3000);
    return () => clearInterval(interval);
  }, [machines]);

  useEffect(() => {
    if (!selectedMachine) return;

    const fetchLatestProcesses = async () => {
      try {
        const response = await apiFetch(`/api/v1/machines/${selectedMachine}/processes/latest`);
        if (!response.ok) return;
        const data: ProcessMetric[] = await response.json();
        setProcessMetrics(prev => ({
          ...prev,
          [selectedMachine]: data,
        }));
      } catch (error) {
        handleRequestError(error);
      }
    };

    fetchLatestProcesses();
    const interval = setInterval(fetchLatestProcesses, 3000);
    return () => clearInterval(interval);
  }, [selectedMachine]);

  const effectiveThresholds = demoMode ? DEMO_THRESHOLDS : thresholds;

  const getLatestTimestamp = (machine: Machine) => {
    return metrics[machine.id]?.recordedAt ?? machine.lastSeen ?? null;
  };

  const getDataAgeSeconds = (machine: Machine) => {
    const timestamp = getLatestTimestamp(machine);
    if (!timestamp) return null;

    const age = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    return Number.isFinite(age) ? Math.max(age, 0) : null;
  };

  const isMachineStale = (machine: Machine) => {
    const age = getDataAgeSeconds(machine);
    return age === null || age > effectiveThresholds.staleSeconds;
  };

  const isMachineOnline = (machine: Machine) => {
    return machine.status === 'ONLINE' && !isMachineStale(machine);
  };

  const getOverallStatus = (machine: Machine): MachineStatusView => {
    const machineMetrics = metrics[machine.id];
    if (!isMachineOnline(machine)) return 'offline';
    if (!machineMetrics) return 'offline';

    const issues: MachineStatusView[] = [];
    if (machineMetrics.cpuUsage >= effectiveThresholds.cpuCritical) issues.push('critical');
    else if (machineMetrics.cpuUsage >= effectiveThresholds.cpuWarning) issues.push('warning');
    if (machineMetrics.ramUsage >= effectiveThresholds.ramCritical) issues.push('critical');
    else if (machineMetrics.ramUsage >= effectiveThresholds.ramWarning) issues.push('warning');
    if (machineMetrics.diskUsage >= effectiveThresholds.diskCritical) issues.push('critical');
    else if (machineMetrics.diskUsage >= effectiveThresholds.diskWarning) issues.push('warning');

    if (issues.includes('critical')) return 'critical';
    if (issues.includes('warning')) return 'warning';
    return 'healthy';
  };

  const createMetricAlert = (
    machine: Machine,
    metricName: string,
    value: number,
    warning: number,
    critical: number
  ): ActiveAlert | null => {
    if (!isMachineOnline(machine)) return null;
    if (value < warning) return null;

    const severity: AlertSeverity = value >= critical ? 'CRITICAL' : 'WARNING';
    const threshold = severity === 'CRITICAL' ? critical : warning;
    return {
      id: `${machine.id}-${metricName}-${severity}`,
      machineName: machine.name,
      severity,
      metric: metricName,
      value: `${value.toFixed(1)}%`,
      message: `${machine.name} ${metricName} is ${value.toFixed(1)}%, above ${threshold}% ${severity.toLowerCase()} threshold.`,
    };
  };

  const activeAlerts = machines.flatMap(machine => {
    const machineMetrics = metrics[machine.id];
    const alerts: ActiveAlert[] = [];

    if (!isMachineOnline(machine)) {
      alerts.push({
        id: `${machine.id}-stale`,
        machineName: machine.name,
        severity: 'CRITICAL',
        metric: 'Data Freshness',
        value: formatAge(getDataAgeSeconds(machine)),
        message: `${machine.name} has not sent fresh data within ${effectiveThresholds.staleSeconds} seconds.`,
      });
      return alerts;
    }

    if (!machineMetrics) return alerts;

    [
      createMetricAlert(machine, 'CPU', machineMetrics.cpuUsage, effectiveThresholds.cpuWarning, effectiveThresholds.cpuCritical),
      createMetricAlert(machine, 'RAM', machineMetrics.ramUsage, effectiveThresholds.ramWarning, effectiveThresholds.ramCritical),
      createMetricAlert(machine, 'Disk', machineMetrics.diskUsage, effectiveThresholds.diskWarning, effectiveThresholds.diskCritical),
    ].forEach(alert => {
      if (alert) alerts.push(alert);
    });

    return alerts;
  });

  const onlineCount = machines.filter(isMachineOnline).length;
  const staleCount = machines.length - onlineCount;
  const metricValues = Object.values(metrics);
  const averageCpu = metricValues.length > 0
    ? metricValues.reduce((sum, metric) => sum + metric.cpuUsage, 0) / metricValues.length
    : 0;
  const averageRam = metricValues.length > 0
    ? metricValues.reduce((sum, metric) => sum + metric.ramUsage, 0) / metricValues.length
    : 0;

  const filteredMachines = machines.filter(machine => {
    const machineMetrics = metrics[machine.id];
    switch (filter) {
      case 'ONLINE':
        return isMachineOnline(machine);
      case 'OFFLINE':
        return !isMachineOnline(machine);
      case 'WINDOWS':
        return getOperatingSystemGroup(machine) === 'WINDOWS';
      case 'LINUX':
        return getOperatingSystemGroup(machine) === 'LINUX';
      case 'HIGH_CPU':
        return (machineMetrics?.cpuUsage ?? 0) >= effectiveThresholds.cpuWarning;
      case 'HIGH_RAM':
        return (machineMetrics?.ramUsage ?? 0) >= effectiveThresholds.ramWarning;
      default:
        return true;
    }
  });

  const filterOptions: Array<{ mode: FilterMode; label: string; count: number }> = [
    { mode: 'ALL', label: 'All', count: machines.length },
    { mode: 'ONLINE', label: 'Online', count: onlineCount },
    { mode: 'OFFLINE', label: 'Stale/Offline', count: staleCount },
    { mode: 'WINDOWS', label: 'Windows', count: machines.filter(machine => getOperatingSystemGroup(machine) === 'WINDOWS').length },
    { mode: 'LINUX', label: 'Linux', count: machines.filter(machine => getOperatingSystemGroup(machine) === 'LINUX').length },
    { mode: 'HIGH_CPU', label: 'High CPU', count: machines.filter(machine => (metrics[machine.id]?.cpuUsage ?? 0) >= effectiveThresholds.cpuWarning).length },
    { mode: 'HIGH_RAM', label: 'High RAM', count: machines.filter(machine => (metrics[machine.id]?.ramUsage ?? 0) >= effectiveThresholds.ramWarning).length },
  ];

  const displayedMachine = selectedMachine
    ? machines.find(m => m.id === selectedMachine)
    : null;
  const displayedMachineMetrics = displayedMachine ? metrics[displayedMachine.id] : null;
  const displayedProcessMetrics = displayedMachine ? processMetrics[displayedMachine.id] ?? [] : [];

  const updateThreshold = (field: keyof ThresholdSettings, value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    setThresholds(prev => ({ ...prev, [field]: parsed }));
  };

  return (
    <div className="size-full bg-neutral-950 text-white overflow-auto">
      <div className="max-w-[1800px] mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl mb-2">System Monitor</h1>
            <div className="text-sm text-neutral-400">
              {machines.length} machines connected
            </div>
          </div>
          <button
            onClick={() => {
              clearAuthToken();
              navigate('/login');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-md hover:bg-neutral-800 transition-colors text-sm text-neutral-300 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Health Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 p-4">
            <div className="text-xs text-neutral-500 mb-2">Total Machines</div>
            <div className="text-2xl text-white">{machines.length}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-4">
            <div className="text-xs text-neutral-500 mb-2">Online</div>
            <div className="text-2xl text-green-400">{onlineCount}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-4">
            <div className="text-xs text-neutral-500 mb-2">Stale / Offline</div>
            <div className="text-2xl text-neutral-300">{staleCount}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-4">
            <div className="text-xs text-neutral-500 mb-2">Active Alerts</div>
            <div className={`text-2xl ${activeAlerts.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {activeAlerts.length}
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-4">
            <div className="text-xs text-neutral-500 mb-2">Average CPU</div>
            <div className="text-2xl text-white">{averageCpu.toFixed(0)}%</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-4">
            <div className="text-xs text-neutral-500 mb-2">Average RAM</div>
            <div className="text-2xl text-white">{averageRam.toFixed(0)}%</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 mb-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <div className="text-sm text-neutral-300 mb-2">Dashboard Filters</div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map(option => (
                  <button
                    key={option.mode}
                    onClick={() => setFilter(option.mode)}
                    className={`px-3 py-2 border text-xs transition-colors ${
                      filter === option.mode
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {option.label} <span className="text-neutral-500">{option.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDemoMode(prev => !prev)}
                className={`px-4 py-2 border text-sm transition-colors ${
                  demoMode
                    ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {demoMode ? 'Demo Alerts On' : 'Demo Alerts Off'}
              </button>
              <button
                onClick={() => setShowSettings(prev => !prev)}
                className="px-4 py-2 border border-neutral-800 bg-neutral-950 text-sm text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
              >
                Threshold Settings
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 border border-neutral-800 p-6 w-full max-w-sm mx-4">
              <h2 className="text-lg mb-2">Delete Machine</h2>
              <p className="text-sm text-neutral-400 mb-6">
                Are you sure you want to permanently delete{' '}
                <span className="text-white font-mono">
                  {machines.find(m => m.id === deleteConfirmId)?.name ?? deleteConfirmId}
                </span>?
                This will remove all associated metrics and data and cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-neutral-800 text-sm text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMachine(deleteConfirmId)}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-red-500/50 bg-red-500/10 text-sm text-red-300 hover:bg-red-500/20 hover:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Machine Modal */}
        {showAddMachine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 border border-neutral-800 p-6 w-full max-w-md mx-4">
              <h2 className="text-lg mb-1">Add Machine</h2>
              <p className="text-sm text-neutral-500 mb-5">
                A machine ID and token will be generated. Copy them into the agent's agent.properties file.
              </p>

              {!addMachineResult ? (
                <>
                  <label className="block mb-4">
                    <div className="text-xs text-neutral-400 mb-1">Machine Name</div>
                    <input
                      type="text"
                      value={addMachineName}
                      onChange={e => setAddMachineName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddMachine()}
                      placeholder="e.g. Ogi-PC"
                      className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                    />
                  </label>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCloseAddMachine}
                      className="px-4 py-2 border border-neutral-800 text-sm text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMachine}
                      disabled={addMachineLoading || !addMachineName.trim()}
                      className="px-4 py-2 border border-blue-500/50 bg-blue-500/10 text-sm text-blue-300 hover:bg-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {addMachineLoading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 p-3 border border-green-500/30 bg-green-500/5 text-green-400 text-sm">
                    Machine "{addMachineResult.name}" created. Save these values — the token will not be shown again.
                  </div>
                  <div className="space-y-3 mb-5">
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">machine-id</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-neutral-200 break-all">
                          {addMachineResult.machineId}
                        </code>
                        <button
                          onClick={() => handleCopy(addMachineResult.machineId, 'id')}
                          className="p-2 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
                        >
                          {copiedField === 'id' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">machine-token</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-neutral-200 break-all">
                          {addMachineResult.token}
                        </code>
                        <button
                          onClick={() => handleCopy(addMachineResult.token, 'token')}
                          className="p-2 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
                        >
                          {copiedField === 'token' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCloseAddMachine}
                      className="px-4 py-2 border border-neutral-800 text-sm text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Threshold Settings */}
        {showSettings && (
          <div className="bg-neutral-900 border border-neutral-800 p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg mb-1">Threshold Settings</h2>
                <p className="text-sm text-neutral-500">
                  These settings drive the dashboard alerts and filters. For now they are saved in this browser.
                </p>
              </div>
              <button
                onClick={() => setThresholds(DEFAULT_THRESHOLDS)}
                className="text-sm text-neutral-400 hover:text-white"
              >
                Reset defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { key: 'cpuWarning', label: 'CPU Warning %', max: 100 },
                { key: 'cpuCritical', label: 'CPU Critical %', max: 100 },
                { key: 'ramWarning', label: 'RAM Warning %', max: 100 },
                { key: 'ramCritical', label: 'RAM Critical %', max: 100 },
                { key: 'diskWarning', label: 'Disk Warning %', max: 100 },
                { key: 'diskCritical', label: 'Disk Critical %', max: 100 },
                { key: 'staleSeconds', label: 'Offline After Seconds', max: 3600 },
              ].map(input => (
                <label key={input.key} className="block">
                  <span className="block text-xs text-neutral-500 mb-2">{input.label}</span>
                  <input
                    type="number"
                    min={0}
                    max={input.max}
                    value={thresholds[input.key as keyof ThresholdSettings]}
                    onChange={event => updateThreshold(input.key as keyof ThresholdSettings, event.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Active Alerts */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 mb-1">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <h2 className="text-lg">Active Alerts</h2>
              </div>
              <p className="text-sm text-neutral-500">
                Alerts are calculated from latest metric values using the current threshold settings.
              </p>
            </div>
            <div className="text-xs text-neutral-500">
              Stale limit: {effectiveThresholds.staleSeconds}s
            </div>
          </div>

          {activeAlerts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {activeAlerts.map(alert => (
                <div key={alert.id} className={`border p-4 ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="text-sm font-semibold">{alert.machineName}</div>
                    <div className="text-xs">{alert.severity}</div>
                  </div>
                  <div className="text-xs text-neutral-400 mb-1">{alert.metric}: {alert.value}</div>
                  <div className="text-sm">{alert.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500">
              No active alerts with the current threshold settings.
            </div>
          )}
        </div>

        {/* Overview Grid */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-500">
            {filteredMachines.length} machine{filteredMachines.length !== 1 ? 's' : ''} shown
          </div>
          <button
            onClick={() => setShowAddMachine(true)}
            className="flex items-center gap-2 px-4 py-2 border border-blue-500/50 bg-blue-500/10 text-sm text-blue-300 hover:bg-blue-500/20 hover:border-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Machine
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {filteredMachines.map(machine => {
            const status = getOverallStatus(machine);
            const isSelected = selectedMachine === machine.id;
            const machineMetrics = metrics[machine.id];
            const ageSeconds = getDataAgeSeconds(machine);

            return (
              <div
                key={machine.id}
                className={`relative bg-neutral-900 border transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <button
                  onClick={() => setSelectedMachine(isSelected ? null : machine.id)}
                  className="w-full p-6 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-neutral-400" />
                      <span className="font-mono text-sm">{machine.name}</span>
                    </div>
                    {/* Spacer so the header row still pushes content left */}
                    <div className="w-6" />
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    <span className="border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-300">
                      OS: {displayValue(machine.osName)}
                    </span>
                    <span className="border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-500">
                      Host: {displayValue(machine.hostname)}
                    </span>
                    <span className="border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-500">
                      Seen: {formatAge(ageSeconds)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-neutral-500 mb-1">CPU</div>
                      <div className={getStatusColor(machineMetrics?.cpuUsage ?? 0, { warning: effectiveThresholds.cpuWarning, critical: effectiveThresholds.cpuCritical })}>
                        {(machineMetrics?.cpuUsage ?? 0).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500 mb-1">RAM</div>
                      <div className={getStatusColor(machineMetrics?.ramUsage ?? 0, { warning: effectiveThresholds.ramWarning, critical: effectiveThresholds.ramCritical })}>
                        {(machineMetrics?.ramUsage ?? 0).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500 mb-1">Disk</div>
                      <div className={getStatusColor(machineMetrics?.diskUsage ?? 0, { warning: effectiveThresholds.diskWarning, critical: effectiveThresholds.diskCritical })}>
                        {(machineMetrics?.diskUsage ?? 0).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </button>

                {/* Status indicator + delete button stacked in top-right corner */}
                <div className="absolute top-3 right-3 flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5">
                    {status === 'critical' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    {status === 'healthy' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                    {status === 'offline' && <div className="w-2 h-2 rounded-full bg-neutral-500" />}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(machine.id); }}
                    className="p-1 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete machine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMachines.length === 0 && (
          <div className="bg-neutral-900 border border-neutral-800 p-8 mb-8 text-center text-neutral-500">
            No machines match the selected filter.
          </div>
        )}

        {/* Detailed View */}
        {displayedMachine && displayedMachineMetrics ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl mb-1">{displayedMachine.name}</h2>
                <div className="text-sm text-neutral-400">
                  Last updated: {new Date(displayedMachineMetrics.recordedAt).toLocaleTimeString()} ({formatAge(getDataAgeSeconds(displayedMachine))})
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-300">
                    Operating System: {displayValue(displayedMachine.osName)}
                  </span>
                  <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-400">
                    Hostname: {displayValue(displayedMachine.hostname)}
                  </span>
                  <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-400">
                    IP: {displayValue(displayedMachine.ipAddress)}
                  </span>
                  <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-400">
                    Agent: {displayValue(displayedMachine.agentVersion)}
                  </span>
                  <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-400">
                    Status: {isMachineOnline(displayedMachine) ? 'Online' : 'Stale or offline'}
                  </span>
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
                <div className={`text-4xl mb-1 ${getStatusColor(displayedMachineMetrics.cpuUsage, { warning: effectiveThresholds.cpuWarning, critical: effectiveThresholds.cpuCritical })}`}>
                  {displayedMachineMetrics.cpuUsage.toFixed(1)}%
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                  <Activity className="w-4 h-4" />
                  <span>RAM</span>
                </div>
                <div className={`text-4xl mb-1 ${getStatusColor(displayedMachineMetrics.ramUsage, { warning: effectiveThresholds.ramWarning, critical: effectiveThresholds.ramCritical })}`}>
                  {displayedMachineMetrics.ramUsage.toFixed(1)}%
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
                  <HardDrive className="w-4 h-4" />
                  <span>Disk Space</span>
                </div>
                <div className={`text-4xl mb-1 ${getStatusColor(displayedMachineMetrics.diskUsage, { warning: effectiveThresholds.diskWarning, critical: effectiveThresholds.diskCritical })}`}>
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

            {/* Top Applications */}
            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 text-neutral-300 mb-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm">Top Applications by Resource Impact</h3>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Grouped by process name. Impact is a CPU/RAM based score, not real electrical power in watts.
                  </p>
                </div>
                <div className="text-xs text-neutral-500">
                  {displayedProcessMetrics.length} rows
                </div>
              </div>

              {displayedProcessMetrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-xs text-neutral-500">
                        <th className="text-left font-normal pb-3">Application</th>
                        <th className="text-right font-normal pb-3">CPU</th>
                        <th className="text-right font-normal pb-3">RAM</th>
                        <th className="text-right font-normal pb-3">RAM %</th>
                        <th className="text-right font-normal pb-3">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedProcessMetrics.map(process => (
                        <tr key={`${process.metricRecordId}-${process.processName}-${process.processId ?? 'na'}`} className="border-b border-neutral-800/60 last:border-0">
                          <td className="py-3 pr-4">
                            <div className="text-white">{process.processName}</div>
                            <div className="text-xs text-neutral-500">
                              {process.instanceCount} instance{process.instanceCount === 1 ? '' : 's'}
                              {process.processId !== null ? ` · PID ${process.processId}` : ''}
                            </div>
                          </td>
                          <td className="py-3 text-right text-neutral-300">
                            {process.cpuUsage.toFixed(1)}%
                          </td>
                          <td className="py-3 text-right text-neutral-300">
                            {formatMemory(process.ramUsageMb)}
                          </td>
                          <td className="py-3 text-right text-neutral-300">
                            {process.ramUsagePercent.toFixed(1)}%
                          </td>
                          <td className="py-3 text-right">
                            <span className={`inline-flex items-center border px-2 py-1 text-xs ${getImpactColor(process.impactScore)}`}>
                              {getImpactLabel(process.impactScore)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500">
                  No application-level metrics yet. Start the updated agent and wait for the next metric upload.
                </div>
              )}
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
