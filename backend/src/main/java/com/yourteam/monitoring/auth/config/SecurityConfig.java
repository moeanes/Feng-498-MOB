package com.yourteam.monitoring.auth.config;

import com.yourteam.monitoring.machine.repo.MachineTokenRepository;
import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
 *   /api/v1/auth/login            → public login endpoint
 *   dashboard API endpoints       → JWT required
 *   admin mutation endpoints      → ROLE_ADMIN required
 *
 * MachineTokenAuthFilter is registered before Spring's built-in
 * UsernamePasswordAuthenticationFilter so it runs early in the chain.
 */
@Configuration
public class SecurityConfig {

    private final MachineTokenRepository machineTokenRepository;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final List<String> allowedOriginPatterns;

    public SecurityConfig(
            MachineTokenRepository machineTokenRepository,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${app.cors.allowed-origin-patterns:http://localhost:5173,http://localhost:4173,https://*.up.railway.app}")
            String allowedOriginPatterns
    ) {
        this.machineTokenRepository = machineTokenRepository;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
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
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Authentication required\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Access denied\"}");
                        })
                )
                .addFilterBefore(machineTokenAuthFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/error").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        // Agent metric ingest — machine token auth enforced by filter
                        .requestMatchers("/api/v1/agent/**").hasRole("AGENT")
                        .requestMatchers(HttpMethod.POST, "/api/v1/machines").authenticated()
                        .requestMatchers("/api/v1/machines/*/tokens").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/alert-rules", "/api/v1/alert-rules/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/alert-rules", "/api/v1/alert-rules/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/alert-rules", "/api/v1/alert-rules/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/auth/me").authenticated()
                        .requestMatchers("/api/v1/machines/**").authenticated()
                        .requestMatchers("/api/v1/alert-rules", "/api/v1/alert-rules/**").authenticated()
                        .requestMatchers("/api/v1/alerts", "/api/v1/alerts/**").authenticated()
                        .requestMatchers("/api/v1/system/**").authenticated()
                        .anyRequest().authenticated()
                )
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException("UserDetailsService is not used; authenticate through /api/v1/auth/login");
        };
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
