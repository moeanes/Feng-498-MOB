package com.yourteam.agent.collector;

import com.yourteam.agent.config.AgentConfig;
import com.yourteam.agent.dto.MetricPayload;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.hardware.NetworkIF;
import oshi.software.os.OSFileStore;
import oshi.software.os.OperatingSystem;

import java.time.Instant;
import java.util.List;

/**
 * Collects a single metric snapshot from the local OS using OSHI.
 *
 * How each metric is collected:
 *
 *  CPU
 *    OSHI reads the kernel's CPU tick counters (idle, user, sys, etc.).
 *    getSystemCpuLoadBetweenTicks() computes the difference between the
 *    current tick array and the previous one, giving a true average CPU
 *    utilization over the elapsed period.  prevCpuTicks is updated after
 *    every call so the next call always measures the most recent interval.
 *
 *  RAM
 *    getTotal() and getAvailable() come straight from the OS memory API.
 *    Used = Total - Available.  The result is expressed as a percentage.
 *
 *  Disk
 *    Iterates all mounted file stores (partitions).  Sums getTotalSpace()
 *    and (getTotalSpace() - getUsableSpace()) across all of them so the
 *    percentage reflects overall disk usage, not just one partition.
 *
 *  Network (KB/s)
 *    OSHI gives cumulative byte counters per interface.  This class stores
 *    the previous counters and the timestamp of the last collection.
 *    On each call it:
 *      1. Calls updateAttributes() to refresh each interface's counters.
 *      2. Sums getBytesRecv() and getBytesSent() across all interfaces
 *         (loopback included — consistent with backend expectations).
 *      3. Divides the delta bytes by the elapsed seconds and by 1024
 *         to produce KB/s values.
 *
 *  Uptime
 *    getSystemUptime() returns OS uptime in seconds directly.
 */
public class SystemMetricCollector {

    private final AgentConfig config;

    // OSHI objects are created once and reused — they are thread-safe for reads
    private final SystemInfo si = new SystemInfo();
    private final HardwareAbstractionLayer hal = si.getHardware();
    private final OperatingSystem os = si.getOperatingSystem();
    private final CentralProcessor cpu = hal.getProcessor();

    // CPU: keep previous tick array so the next call can compute a delta
    private long[] prevCpuTicks = cpu.getSystemCpuLoadTicks();

    // Network: keep previous cumulative byte counters and the timestamp
    private long prevNetIn  = 0L;
    private long prevNetOut = 0L;
    private long prevNetTs  = System.currentTimeMillis();

    public SystemMetricCollector(AgentConfig config) {
        this.config = config;
    }

    /**
     * Collects one complete metric snapshot and returns it as a MetricPayload.
     * This method is intentionally not synchronized — it is always called from
     * a single scheduler thread.
     */
    public MetricPayload collect() {
        MetricPayload payload = new MetricPayload();
        payload.machineId  = config.machineId;
        payload.recordedAt = Instant.now();

        collectCpu(payload);
        collectRam(payload);
        collectDisk(payload);
        collectNetwork(payload);
        collectUptime(payload);

        return payload;
    }

    // -------------------------------------------------------------------------
    // Private collection methods
    // -------------------------------------------------------------------------

    private void collectCpu(MetricPayload p) {
        long[] currentTicks = cpu.getSystemCpuLoadTicks();
        // Returns a value between 0.0 and 1.0; multiply by 100 for percentage
        double load = cpu.getSystemCpuLoadBetweenTicks(prevCpuTicks);
        p.cpuUsage     = clamp(load * 100.0);
        prevCpuTicks   = currentTicks;
    }

    private void collectRam(MetricPayload p) {
        GlobalMemory mem  = hal.getMemory();
        long total        = mem.getTotal();
        long available    = mem.getAvailable();
        long used         = total - available;
        p.ramUsage        = total > 0 ? clamp(used * 100.0 / total) : 0.0;
    }

    private void collectDisk(MetricPayload p) {
        List<OSFileStore> fileStores = os.getFileSystem().getFileStores();
        long totalSpace = 0L;
        long usedSpace  = 0L;
        for (OSFileStore fs : fileStores) {
            totalSpace += fs.getTotalSpace();
            usedSpace  += (fs.getTotalSpace() - fs.getUsableSpace());
        }
        p.diskUsage = totalSpace > 0 ? clamp(usedSpace * 100.0 / totalSpace) : 0.0;
    }

    private void collectNetwork(MetricPayload p) {
        long nowMs      = System.currentTimeMillis();
        long elapsedMs  = Math.max(nowMs - prevNetTs, 1L); // guard against divide-by-zero
        double elapsedSec = elapsedMs / 1000.0;

        long curIn  = 0L;
        long curOut = 0L;
        for (NetworkIF net : hal.getNetworkIFs()) {
            net.updateAttributes(); // refresh counters from the OS
            curIn  += net.getBytesRecv();
            curOut += net.getBytesSent();
        }

        // Delta bytes / elapsed seconds / 1024 = KB/s
        p.netInKbps  = Math.max(0.0, (curIn  - prevNetIn)  / 1024.0 / elapsedSec);
        p.netOutKbps = Math.max(0.0, (curOut - prevNetOut) / 1024.0 / elapsedSec);

        prevNetIn  = curIn;
        prevNetOut = curOut;
        prevNetTs  = nowMs;
    }

    private void collectUptime(MetricPayload p) {
        p.uptimeSeconds = os.getSystemUptime();
    }

    /** Ensures a percentage value stays in [0.0, 100.0]. */
    private static double clamp(double value) {
        return Math.min(100.0, Math.max(0.0, value));
    }
}
