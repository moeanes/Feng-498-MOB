package com.yourteam.agent;

import com.yourteam.agent.collector.SystemMetricCollector;
import com.yourteam.agent.config.AgentConfig;
import com.yourteam.agent.dto.SystemInfoPayload;
import com.yourteam.agent.scheduler.MetricScheduler;
import com.yourteam.agent.sender.MetricSender;
import oshi.SystemInfo;
import oshi.hardware.NetworkIF;
import oshi.software.os.OperatingSystem;

/**
 * Entry point for the monitoring agent.
 *
 * Startup sequence:
 *  1. AgentConfig is constructed first.  It reads agent.properties and
 *     validates every required field.  If anything is missing or malformed
 *     the JVM exits with a clear error message before any OSHI or network
 *     code is touched.
 *
 *  2. SystemMetricCollector is created with the config so it knows which
 *     machineId to embed in every payload.  OSHI's SystemInfo is initialized
 *     here — this may take a short moment on the first run.
 *
 *  3. MetricSender is created with the config so it knows the backend URL
 *     and the machine token.  The HttpClient is built at this point.
 *
 *  4. MetricScheduler is created, wiring the collector and sender together.
 *
 *  5. A JVM shutdown hook is registered so that pressing Ctrl+C or sending
 *     SIGTERM triggers MetricScheduler.shutdown() gracefully — the current
 *     in-flight tick is allowed to finish before the JVM exits.
 *
 *  6. scheduler.start() fires and the agent begins the collect → send loop.
 *
 * There is no Spring context, no dependency injection framework, and no
 * auto-configuration.  The wiring is explicit and visible here in main().
 */
public class AgentApplication {

    public static void main(String[] args) {
        System.out.println("[Agent] Initializing...");

        AgentConfig config;
        try {
            config = new AgentConfig();
        } catch (IllegalStateException e) {
            System.err.println("[Agent] Configuration error: " + e.getMessage());
            System.exit(1);
            return; // unreachable, but satisfies the compiler
        }

        System.out.printf("[Agent] Machine ID : %s%n", config.machineId);
        System.out.printf("[Agent] Backend URL: %s%n", config.backendUrl);
        System.out.printf("[Agent] Interval   : %d seconds%n", config.intervalSeconds);

        SystemMetricCollector collector = new SystemMetricCollector(config);
        MetricSender          sender    = new MetricSender(config);

        // On startup, collect real system info and push it to the backend
        // so the machine record reflects actual hostname/IP/OS instead of placeholders.
        try {
            SystemInfo si = new SystemInfo();
            OperatingSystem os = si.getOperatingSystem();

            String hostname = os.getNetworkParams().getHostName();

            // Find first non-loopback IPv4 address
            String ipAddress = "";
            for (NetworkIF iface : si.getHardware().getNetworkIFs()) {
                String[] addrs = iface.getIPv4addr();
                if (addrs.length > 0 && !addrs[0].startsWith("127.")) {
                    ipAddress = addrs[0];
                    break;
                }
            }

            String osName = os.getFamily() + " " + os.getVersionInfo().getVersion();

            SystemInfoPayload info = new SystemInfoPayload();
            info.machineId    = config.machineId;
            info.hostname     = hostname;
            info.ipAddress    = ipAddress;
            info.osName       = osName;
            info.agentVersion = "1.0";

            sender.register(info);
        } catch (Exception e) {
            System.err.println("[Agent] Register failed (non-fatal): " + e.getMessage());
        }

        MetricScheduler scheduler = new MetricScheduler(collector, sender, config.intervalSeconds);

        // Graceful shutdown on Ctrl+C or SIGTERM
        Runtime.getRuntime().addShutdownHook(new Thread(scheduler::shutdown, "shutdown-hook"));

        scheduler.start();

        System.out.println("[Agent] Running. Press Ctrl+C to stop.");
    }
}
