import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Network, Clock, Server, AlertCircle, Zap, LogOut, Plus, Copy, Check, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch, clearAuthToken, UnauthorizedError, createMachine, issueToken } from './api';
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

// ---- Installer script generators ----

const triggerDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const generateWindowsInstaller = (machineId: string, token: string) => {
  const backendUrl = (import.meta.env.VITE_API_BASE_URL as string ?? '').replace(/\/$/, '');
  const jarUrl = 'https://github.com/moeanes/Feng-498-MOB/releases/latest/download/monitoring-agent.jar';
  const winswUrl = 'https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe';

  const lines = [
    '@echo off',
    'setlocal EnableDelayedExpansion',
    'title Monitoring Agent - Otomatik Kurulum',
    '',
    ':: Bu script dashboard tarafindan olusturulmustur.',
    ':: agent.properties otomatik doldurulur, Windows servisi kurulur.',
    `set "MACHINE_ID=${machineId}"`,
    `set "MACHINE_TOKEN=${token}"`,
    `set "BACKEND_URL=${backendUrl}"`,
    `set "JAR_URL=${jarUrl}"`,
    `set "WINSW_URL=${winswUrl}"`,
    '',
    'net session >nul 2>&1',
    'if %errorLevel% NEQ 0 (',
    '    echo.',
    '    echo  [HATA] Yonetici yetkisi gerekli.',
    '    echo  Dosyaya sag tik ^> "Yonetici olarak calistir" secin.',
    '    echo.',
    '    pause',
    '    exit /b 1',
    ')',
    '',
    'set "DIR=%~dp0"',
    'set "WINSW_EXE=%DIR%monitoring-agent-service.exe"',
    'set "JAR=%DIR%monitoring-agent.jar"',
    'set "PROPS=%DIR%agent.properties"',
    'set "XML=%DIR%monitoring-agent-service.xml"',
    'set "SERVICE_ID=MonitoringAgent"',
    '',
    'echo.',
    'echo  ================================================',
    'echo   Monitoring Agent - Otomatik Kurulum',
    'echo  ================================================',
    'echo.',
    '',
    ':: 1. En yuksek Java 17+ surumunu bul (JAVA_HOME baz alinmaz, tum dizinler taranir)',
    'echo  Java 17+ aranıyor...',
    'set "JAVA_EXE="',
    'powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=\'C:\\Program Files\\Java\',\'C:\\Program Files\\Eclipse Adoptium\',\'C:\\Program Files\\Microsoft\',\'C:\\Program Files\\BellSoft\',\'C:\\Program Files\\Amazon Corretto\',\'C:\\Program Files\\Zulu\',\'C:\\Program Files\\OpenJDK\',\'C:\\Program Files\\Semeru\'; $b=$null; $bv=0; $d | ForEach-Object { if(Test-Path $_){ Get-ChildItem $_ -Directory -EA 0 | ForEach-Object { $j=Join-Path $_.FullName \'bin\\java.exe\'; if(Test-Path $j){ $r=& $j -version 2>&1 | Select-String \'(\\d+)\'; if($r){ $v=[int]$r.Matches[0].Value; if($v -ge 17 -and $v -gt $bv){ $bv=$v; $b=$j } } } } } }; if($b){ $b } else { exit 1 }" > "%TEMP%\\_javapath.txt" 2>nul',
    'set /p JAVA_EXE=<"%TEMP%\\_javapath.txt"',
    'del "%TEMP%\\_javapath.txt" >nul 2>&1',
    'if not defined JAVA_EXE (',
    '    echo  [HATA] Java 17+ bulunamadi! Java 17+ yukleyin: https://adoptium.net',
    '    pause',
    '    exit /b 1',
    ')',
    'echo  [OK] Java bulundu: %JAVA_EXE%',
    '',
    ':: 2. agent.properties olustur (kimlik bilgileri baked-in)',
    'echo  agent.properties olusturuluyor...',
    '(',
    'echo agent.backend-url=%BACKEND_URL%',
    'echo agent.machine-id=%MACHINE_ID%',
    'echo agent.machine-token=%MACHINE_TOKEN%',
    ') > "%PROPS%"',
    'echo  [OK] agent.properties olusturuldu.',
    '',
    ':: 3. monitoring-agent.jar indir (yoksa)',
    'if not exist "%JAR%" (',
    '    echo  monitoring-agent.jar indiriliyor...',
    '    powershell -NoProfile -Command "Invoke-WebRequest -Uri \'%JAR_URL%\' -OutFile \'%JAR%\' -UseBasicParsing"',
    '    if not exist "%JAR%" (',
    '        echo  [HATA] JAR indirilemedi. monitoring-agent.jar dosyasini bu klasore elle kopyalayin.',
    '        pause',
    '        exit /b 1',
    '    )',
    '    echo  [OK] monitoring-agent.jar indirildi.',
    ') else (',
    '    echo  [OK] monitoring-agent.jar zaten mevcut.',
    ')',
    '',
    ':: 4. WinSW servis XML dosyasini olustur',
    'echo  Servis XML olusturuluyor...',
    '(',
    'echo ^<service^>',
    'echo   ^<id^>MonitoringAgent^</id^>',
    'echo   ^<name^>Monitoring Agent^</name^>',
    'echo   ^<description^>FENG-498 Monitoring Agent^</description^>',
    'echo   ^<executable^>%JAVA_EXE%^</executable^>',
    'echo   ^<arguments^>-jar "%%BASE%%\\monitoring-agent.jar"^</arguments^>',
    'echo   ^<workingdirectory^>%%BASE%%^</workingdirectory^>',
    'echo   ^<logpath^>%%BASE%%\\logs^</logpath^>',
    'echo   ^<logmode^>rotate^</logmode^>',
    'echo   ^<onfailure action="restart" delay="10 sec"/^>',
    'echo   ^<onfailure action="restart" delay="20 sec"/^>',
    'echo   ^<onfailure action="restart" delay="30 sec"/^>',
    'echo   ^<resetfailure^>1 hour^</resetfailure^>',
    'echo   ^<startmode^>Automatic^</startmode^>',
    'echo ^</service^>',
    ') > "%XML%"',
    'echo  [OK] Servis XML olusturuldu.',
    '',
    ':: 5. WinSW indir (yoksa)',
    'if not exist "%WINSW_EXE%" (',
    '    echo  WinSW indiriliyor...',
    '    powershell -NoProfile -Command "Invoke-WebRequest -Uri \'%WINSW_URL%\' -OutFile \'%WINSW_EXE%\' -UseBasicParsing"',
    '    if not exist "%WINSW_EXE%" (',
    '        echo  [HATA] WinSW indirilemedi.',
    '        pause',
    '        exit /b 1',
    '    )',
    '    echo  [OK] WinSW indirildi.',
    ') else (',
    '    echo  [OK] WinSW zaten mevcut.',
    ')',
    '',
    ':: 6. Mevcut servisi kaldir',
    'sc query "%SERVICE_ID%" >nul 2>&1',
    'if %errorLevel% EQU 0 (',
    '    echo  Mevcut servis kaldiriliyor...',
    '    "%WINSW_EXE%" stop  >nul 2>&1',
    '    "%WINSW_EXE%" uninstall >nul 2>&1',
    '    timeout /t 2 /nobreak >nul',
    ')',
    '',
    ':: 7. Servisi kur',
    'echo  Servis kuruluyor...',
    '"%WINSW_EXE%" install',
    'if %errorLevel% NEQ 0 (',
    '    echo  [HATA] Servis kurulamadi!',
    '    pause',
    '    exit /b 1',
    ')',
    'echo  [OK] Servis kuruldu.',
    '',
    ':: 8. Servisi baslat',
    'echo  Servis baslatiliyor...',
    '"%WINSW_EXE%" start',
    'if %errorLevel% NEQ 0 (',
    '    echo  [HATA] Servis baslatilamadi!',
    '    pause',
    '    exit /b 1',
    ')',
    'echo  [OK] Servis baslatildi.',
    '',
    'echo.',
    'echo  ================================================',
    'echo   KURULUM TAMAMLANDI!',
    'echo  ================================================',
    'echo.',
    'echo  Makine ID  : %MACHINE_ID%',
    'echo  Log klasoru: %DIR%logs\\',
    'echo.',
    'sc query "%SERVICE_ID%" | findstr "STATE"',
    'echo.',
    'pause',
  ].join('\r\n');

  triggerDownload(lines, 'install-agent-windows.bat', 'application/octet-stream');
};

const generateMacOSInstaller = (machineId: string, token: string) => {
  const backendUrl = (import.meta.env.VITE_API_BASE_URL as string ?? '').replace(/\/$/, '');
  const jarUrl = 'https://github.com/moeanes/Feng-498-MOB/releases/latest/download/monitoring-agent.jar';

  const script = `#!/bin/bash
# Bu script dashboard tarafindan olusturulmustur.
# agent.properties otomatik doldurulur, macOS launchd servisi kurulur.

MACHINE_ID="${machineId}"
MACHINE_TOKEN="${token}"
BACKEND_URL="${backendUrl}"
JAR_URL="${jarUrl}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="/Library/MonitoringAgent"
PLIST_NAME="com.yourteam.monitoringagent"
PLIST_DEST="/Library/LaunchDaemons/$PLIST_NAME.plist"
JAR="$SCRIPT_DIR/monitoring-agent.jar"
PROPS="$SCRIPT_DIR/agent.properties"

if [ "$EUID" -ne 0 ]; then
    echo ""
    echo "  [HATA] Yonetici yetkisi gerekli."
    echo "  Kullanim: sudo bash install-agent.sh"
    echo ""
    exit 1
fi

echo ""
echo "  ================================================"
echo "   Monitoring Agent macOS - Otomatik Kurulum"
echo "  ================================================"
echo ""

# 1. En yuksek Java 17+ surumunu bul (JAVA_HOME baz alinmaz, tum JVMler taranir)
JAVA_REAL=""
JAVA_BEST_VER=0
for jvm_home in /Library/Java/JavaVirtualMachines/*/Contents/Home; do
    java_bin="$jvm_home/bin/java"
    if [ -x "$java_bin" ]; then
        ver=$("$java_bin" -version 2>&1 | head -1 | sed 's/[^0-9]*\\([0-9]*\\).*/\\1/')
        if [ "$ver" -ge 17 ] 2>/dev/null && [ "$ver" -gt "$JAVA_BEST_VER" ] 2>/dev/null; then
            JAVA_BEST_VER=$ver
            JAVA_REAL="$java_bin"
        fi
    fi
done

if [ -z "$JAVA_REAL" ]; then
    echo "  [HATA] Java 17+ bulunamadi!"
    echo "  https://adoptium.net adresinden yukleyin."
    exit 1
fi
echo "  [OK] Java bulundu: $($JAVA_REAL -version 2>&1 | head -1)"

# 2. agent.properties olustur (kimlik bilgileri baked-in)
echo "  agent.properties olusturuluyor..."
cat > "$PROPS" <<AGENTEOF
agent.backend-url=$BACKEND_URL
agent.machine-id=$MACHINE_ID
agent.machine-token=$MACHINE_TOKEN
AGENTEOF
echo "  [OK] agent.properties olusturuldu."

# 3. monitoring-agent.jar indir (yoksa)
if [ ! -f "$JAR" ]; then
    echo "  monitoring-agent.jar indiriliyor..."
    curl -fsSL "$JAR_URL" -o "$JAR"
    if [ ! -f "$JAR" ]; then
        echo "  [HATA] JAR indirilemedi. monitoring-agent.jar dosyasini bu klasore elle kopyalayin."
        exit 1
    fi
    echo "  [OK] monitoring-agent.jar indirildi."
else
    echo "  [OK] monitoring-agent.jar zaten mevcut."
fi

# 4. Mevcut servisi kaldir
if launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
    echo "  Mevcut servis kaldiriliyor..."
    launchctl unload "$PLIST_DEST" 2>/dev/null
    sleep 1
fi

# 5. Kurulum dizini olustur ve dosyalari kopyala
mkdir -p "$INSTALL_DIR/logs"
cp "$JAR"   "$INSTALL_DIR/monitoring-agent.jar"
cp "$PROPS" "$INSTALL_DIR/agent.properties"

# 6. Launchd plist olustur
cat > "$PLIST_DEST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.yourteam.monitoringagent</string>
    <key>ProgramArguments</key>
    <array>
        <string>$JAVA_REAL</string>
        <string>-jar</string>
        <string>/Library/MonitoringAgent/monitoring-agent.jar</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Library/MonitoringAgent</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Library/MonitoringAgent/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Library/MonitoringAgent/logs/stderr.log</string>
</dict>
</plist>
PLISTEOF
chmod 644 "$PLIST_DEST"
chown root:wheel "$PLIST_DEST"
echo "  [OK] Servis yapilandirmasi olusturuldu."

# 7. Servisi baslat
launchctl load -w "$PLIST_DEST"
sleep 2

if launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
    echo "  [OK] Servis baslatildi."
else
    echo "  [HATA] Servis baslatılamadi!"
    echo "  Loglara bak: $INSTALL_DIR/logs/stderr.log"
    exit 1
fi

echo ""
echo "  ================================================"
echo "   KURULUM TAMAMLANDI!"
echo "  ================================================"
echo ""
echo "  Makine ID  : $MACHINE_ID"
echo "  Kurulum    : $INSTALL_DIR"
echo "  Log klasoru: $INSTALL_DIR/logs/"
echo ""
echo "  Kaldirmak icin: sudo bash uninstall-agent.sh"
echo ""
`;

  triggerDownload(script, 'install-agent-macos.sh', 'application/x-sh');
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

                  {/* Installer download */}
                  <div className="mb-5 p-3 border border-neutral-800 bg-neutral-950">
                    <div className="text-xs text-neutral-400 mb-1">Agent Installer</div>
                    <div className="text-xs text-neutral-600 mb-3">
                      Script, agent.properties'i otomatik doldurur, JAR'ı indirir ve servisi kurar. Yönetici/sudo yetkisiyle çalıştırın.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateWindowsInstaller(addMachineResult.machineId, addMachineResult.token)}
                        className="flex items-center gap-1.5 px-3 py-2 border border-blue-500/40 bg-blue-500/10 text-xs text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/60 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Windows (.bat)
                      </button>
                      <button
                        onClick={() => generateMacOSInstaller(addMachineResult.machineId, addMachineResult.token)}
                        className="flex items-center gap-1.5 px-3 py-2 border border-neutral-700 bg-neutral-900 text-xs text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        macOS (.sh)
                      </button>
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
                  {status === 'offline' && <div className="w-2 h-2 rounded-full bg-neutral-500" />}
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
