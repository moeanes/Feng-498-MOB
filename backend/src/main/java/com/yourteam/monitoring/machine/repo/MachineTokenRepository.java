package com.yourteam.monitoring.machine.repo;

import com.yourteam.monitoring.machine.domain.MachineToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Data access for machine_tokens table.
 *
 * findByTokenHashAndActiveTrue  → used by MachineTokenAuthFilter to validate
 *                                 an incoming Bearer token on every agent request.
 * findAllByMachineIdAndActiveTrue → used by MachineTokenService to revoke all
 *                                   active tokens for a machine at once.
 */
public interface MachineTokenRepository extends JpaRepository<MachineToken, UUID> {

    Optional<MachineToken> findByTokenHashAndActiveTrue(String tokenHash);

    List<MachineToken> findAllByMachineIdAndActiveTrue(UUID machineId);
}
