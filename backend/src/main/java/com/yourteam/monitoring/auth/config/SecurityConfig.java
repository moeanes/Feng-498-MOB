package com.yourteam.monitoring.auth.config;

import com.yourteam.monitoring.machine.repo.MachineTokenRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Central Spring Security configuration.
 *
 * Rules:
 *   /api/v1/agent/**              → ROLE_AGENT required (validated by MachineTokenAuthFilter)
 *   /api/v1/machines/{id}/tokens  → TODO: restrict to ROLE_ADMIN once dashboard JWT is added.
 *                                   Currently denied to everyone as a safe default — an
 *                                   unauthenticated caller must NOT be able to issue or revoke
 *                                   machine tokens. Remove denyAll() and replace with
 *                                   hasRole("ADMIN") when user auth is implemented.
 *   everything else               → open (remaining dashboard endpoints have no auth yet)
 *
 * MachineTokenAuthFilter is registered before Spring's built-in
 * UsernamePasswordAuthenticationFilter so it runs early in the chain.
 */
@Configuration
public class SecurityConfig {

    private final MachineTokenRepository machineTokenRepository;

    public SecurityConfig(MachineTokenRepository machineTokenRepository) {
        this.machineTokenRepository = machineTokenRepository;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        MachineTokenAuthFilter machineTokenAuthFilter =
                new MachineTokenAuthFilter(machineTokenRepository);

        return http
                .csrf(csrf -> csrf.disable())
                .addFilterBefore(machineTokenAuthFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Agent metric ingest — machine token auth enforced by filter
                        .requestMatchers("/api/v1/agent/**").hasRole("AGENT")
                        // Token management — locked down until dashboard JWT auth exists
                        // TODO: replace denyAll() with hasRole("ADMIN") when user auth is added
                        .requestMatchers("/api/v1/machines/*/tokens").denyAll()
                        .anyRequest().permitAll()
                )
                .build();
    }
}
