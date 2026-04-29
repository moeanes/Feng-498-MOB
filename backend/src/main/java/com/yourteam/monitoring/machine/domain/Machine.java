package com.yourteam.monitoring.machine.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "machines")
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "hostname", length = 255)
    private String hostname;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "os_name", length = 120)
    private String osName;

    @Column(name = "agent_version", length = 40)
    private String agentVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MachineStatus status;

    @Column(name = "last_seen")
    private Instant lastSeen;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Machine() {
    }

    private Machine(String name, String hostname, String ipAddress, String osName, String agentVersion) {
        this.name = name;
        this.hostname = hostname;
        this.ipAddress = ipAddress;
        this.osName = osName;
        this.agentVersion = agentVersion;
        this.status = MachineStatus.OFFLINE;
    }

    public static Machine create(String name, String hostname, String ipAddress, String osName, String agentVersion) {
        return new Machine(name, hostname, ipAddress, osName, agentVersion);
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getHostname() {
        return hostname;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getOsName() {
        return osName;
    }

    public String getAgentVersion() {
        return agentVersion;
    }

    public MachineStatus getStatus() {
        return status;
    }

    public Instant getLastSeen() {
        return lastSeen;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void markOnline(Instant seenAt) {
        this.status = MachineStatus.ONLINE;
        this.lastSeen = seenAt == null ? Instant.now() : seenAt;
    }

    public void updateSystemInfo(String hostname, String ipAddress, String osName, String agentVersion) {
        if (hostname != null && !hostname.isBlank()) this.hostname = hostname;
        if (ipAddress != null && !ipAddress.isBlank()) this.ipAddress = ipAddress;
        if (osName != null && !osName.isBlank()) this.osName = osName;
        if (agentVersion != null && !agentVersion.isBlank()) this.agentVersion = agentVersion;
    }

    @PrePersist
    void prePersist() {
        if (status == null) {
            status = MachineStatus.OFFLINE;
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
