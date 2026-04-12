package com.yourteam.monitoring.machine.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents one issued machine token stored in the machine_tokens table.
 *
 * The plain-text token is NEVER stored here. Only the SHA-256 hash is
 * persisted. When the agent sends "Authorization: Bearer <plain>", the filter
 * hashes the incoming value and compares it to this tokenHash column.
 *
 * A token can be revoked (is_active = false) without deleting the row so
 * that the audit trail is preserved.
 */
@Entity
@Table(name = "machine_tokens")
public class MachineToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    /** SHA-256 hex digest of the plain-text token. */
    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected MachineToken() {
    }

    private MachineToken(Machine machine, String tokenHash) {
        this.machine   = machine;
        this.tokenHash = tokenHash;
        this.active    = true;
    }

    public static MachineToken create(Machine machine, String tokenHash) {
        return new MachineToken(machine, tokenHash);
    }

    public UUID getId() { return id; }

    public Machine getMachine() { return machine; }

    public String getTokenHash() { return tokenHash; }

    public boolean isActive() { return active; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getRevokedAt() { return revokedAt; }

    public void revoke() {
        this.active    = false;
        this.revokedAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
