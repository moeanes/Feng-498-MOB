package com.yourteam.agent.scheduler;

import com.yourteam.agent.collector.SystemMetricCollector;
import com.yourteam.agent.dto.MetricPayload;
import com.yourteam.agent.sender.MetricSender;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Drives the periodic collect → send cycle.
 *
 * How it works:
 *
 *  A single-thread ScheduledExecutorService is used so that metric collection
 *  and sending always happen sequentially on the same thread.  This means:
 *  - No concurrency issues with the OSHI tick-counter state in the collector.
 *  - If one tick takes longer than the interval (e.g. backend is slow),
 *    the next tick is simply delayed — metrics are never sent in parallel.
 *
 *  scheduleAtFixedRate fires the task every `intervalSeconds` seconds.
 *  The first execution is also delayed by `intervalSeconds` so that the
 *  CPU tick delta measured on the very first collection covers a full interval
 *  rather than the short startup period.
 *
 *  Exception handling:
 *  The scheduled task wraps the collect/send call in a try-catch.
 *  If an exception is NOT caught inside a ScheduledExecutorService task,
 *  the executor silently stops scheduling future executions.  The catch
 *  block here logs the error and lets the loop continue, so a single network
 *  failure or backend outage does not stop the agent permanently.
 *
 *  Shutdown:
 *  shutdown() is called by the JVM shutdown hook registered in AgentApplication.
 *  It attempts a graceful termination (waits up to 5 seconds for the current
 *  task to finish) before forcing a stop.
 */
public class MetricScheduler {

    private final SystemMetricCollector collector;
    private final MetricSender sender;
    private final int intervalSeconds;

    private final ScheduledExecutorService executor =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "metric-scheduler");
                t.setDaemon(false); // keep JVM alive while the scheduler is running
                return t;
            });

    public MetricScheduler(SystemMetricCollector collector,
                           MetricSender sender,
                           int intervalSeconds) {
        this.collector       = collector;
        this.sender          = sender;
        this.intervalSeconds = intervalSeconds;
    }

    /**
     * Starts the periodic schedule.
     * First tick fires after one full interval (intentional — see class doc).
     */
    public void start() {
        System.out.printf("[Scheduler] Started — interval: %d seconds%n", intervalSeconds);
        executor.scheduleAtFixedRate(
                this::collectAndSend,
                intervalSeconds,   // initial delay
                intervalSeconds,   // period
                TimeUnit.SECONDS
        );
    }

    /**
     * Gracefully shuts down the scheduler.
     * Called by the JVM shutdown hook so in-flight work can finish cleanly.
     */
    public void shutdown() {
        System.out.println("[Scheduler] Shutting down...");
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        System.out.println("[Scheduler] Stopped.");
    }

    // -------------------------------------------------------------------------
    // Scheduled task
    // -------------------------------------------------------------------------

    /**
     * One tick: collect metrics then send them.
     * Any exception is caught and logged — NOT rethrown — so the scheduler
     * continues running on the next interval.
     */
    private void collectAndSend() {
        try {
            MetricPayload payload = collector.collect();
            sender.send(payload);
        } catch (Exception e) {
            System.err.printf("[Scheduler] Error during collect/send: %s: %s%n",
                    e.getClass().getSimpleName(), e.getMessage());
        }
    }
}
