package com.yourteam.monitoring.machine.service;

import com.yourteam.monitoring.auth.config.MachineTokenAuthFilter;
import com.yourteam.monitoring.machine.domain.Machine;
import com.yourteam.monitoring.machine.domain.MachineToken;
import com.yourteam.monitoring.machine.repo.MachineRepository;
import com.yourteam.monitoring.machine.repo.MachineTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

/**
 * Handles issuing and revoking machine tokens.
 *
 * How token issuance works:
 *  1. A 32-byte random value is generated with SecureRandom (cryptographically
 *     strong). This produces 256 bits of entropy — extremely hard to guess.
 *  2. The bytes are Base64-URL encoded to produce a URL-safe plain-text string
 *     (~43 characters). This is the value the agent puts in agent.properties.
 *  3. The plain text is hashed with SHA-256 via MachineTokenAuthFilter.sha256Hex.
 *  4. Only the hash is stored in machine_tokens. The plain text is returned once
 *     to the caller and never stored — if lost, a new token must be issued.
 *
 * This class is used by MachineController to expose token issuance via the API.
 */
@Service
public class MachineTokenService {

    private final MachineRepository machineRepository;
    private final MachineTokenRepository machineTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public MachineTokenService(MachineRepository machineRepository,
                               MachineTokenRepository machineTokenRepository) {
        this.machineRepository      = machineRepository;
        this.machineTokenRepository = machineTokenRepository;
    }

    /**
     * Issues a new active token for the given machine.
     * Returns the plain-text token — shown only once, not stored.
     */
    @Transactional
    public String issueToken(UUID machineId) {
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Machine not found: " + machineId));

        // Generate a cryptographically random token
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String plainToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        // Hash it and store only the hash
        String tokenHash = MachineTokenAuthFilter.sha256Hex(plainToken);
        MachineToken token = MachineToken.create(machine, tokenHash);
        machineTokenRepository.save(token);

        return plainToken;
    }

    /**
     * Revokes all active tokens for the given machine.
     */
    @Transactional
    public void revokeAllTokens(UUID machineId) {
        if (!machineRepository.existsById(machineId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Machine not found: " + machineId);
        }
        machineTokenRepository.findAllByMachineIdAndActiveTrue(machineId)
                .forEach(MachineToken::revoke);
    }
}
