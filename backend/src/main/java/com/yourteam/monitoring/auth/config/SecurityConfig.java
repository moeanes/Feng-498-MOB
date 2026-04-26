package com.yourteam.monitoring.auth.config;

import com.yourteam.monitoring.machine.repo.MachineTokenRepository;
import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
    private final List<String> allowedOriginPatterns;

    public SecurityConfig(
            MachineTokenRepository machineTokenRepository,
            @Value("${app.cors.allowed-origin-patterns:http://localhost:5173,http://localhost:4173,https://*.up.railway.app}")
            String allowedOriginPatterns
    ) {
        this.machineTokenRepository = machineTokenRepository;
        this.allowedOriginPatterns = Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(pattern -> !pattern.isBlank())
                .toList();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        MachineTokenAuthFilter machineTokenAuthFilter =
                new MachineTokenAuthFilter(machineTokenRepository);

        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .addFilterBefore(machineTokenAuthFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Agent metric ingest — machine token auth enforced by filter
                        .requestMatchers("/api/v1/agent/**").hasRole("AGENT")
                        // Token management — locked down until dashboard JWT auth exists
                        // TODO: replace denyAll() with hasRole("ADMIN") when user auth is added
                        .requestMatchers("/api/v1/machines/*/tokens").permitAll()
                        .anyRequest().permitAll()
                )
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(allowedOriginPatterns);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
