package com.yourteam.monitoring.auth.config;

import com.yourteam.monitoring.machine.repo.MachineTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

/**
 * Servlet filter that authenticates incoming agent requests using a
 * machine token carried in the Authorization header.
 *
 * How it works:
 *
 *  1. Only requests to /api/v1/agent/** are intercepted.
 *     All other requests pass through untouched.
 *
 *  2. The filter reads the Authorization header and expects the format:
 *       Authorization: Bearer <plain-text-token>
 *     If the header is missing or malformed, the request is rejected with 401.
 *
 *  3. The plain-text token is hashed with SHA-256 (hex encoded).
 *     The hash is looked up in machine_tokens via MachineTokenRepository.
 *     Only rows where is_active = true match.
 *
 *  4. If a matching active token is found, a Spring Security Authentication
 *     object is placed in the SecurityContext with the ROLE_AGENT authority.
 *     The request proceeds to AgentMetricController normally.
 *
 *  5. If the token is not found or is revoked, the filter writes a 401
 *     response immediately and does NOT continue the filter chain.
 *
 * Why SHA-256 instead of BCrypt:
 *   BCrypt is designed for passwords (slow by design). Machine tokens are
 *   long random strings and are validated on every metric tick (every 10 s).
 *   SHA-256 is fast and sufficient for a random high-entropy token.
 */
public class MachineTokenAuthFilter extends OncePerRequestFilter {

    private static final String AGENT_PATH_PREFIX = "/api/v1/agent/";
    private static final String BEARER_PREFIX      = "Bearer ";

    private final MachineTokenRepository machineTokenRepository;

    public MachineTokenAuthFilter(MachineTokenRepository machineTokenRepository) {
        this.machineTokenRepository = machineTokenRepository;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        // Only activate this filter for agent API paths
        return !request.getRequestURI().startsWith(AGENT_PATH_PREFIX);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            rejectUnauthorized(response, "Missing or malformed Authorization header");
            return;
        }

        String plainToken = authHeader.substring(BEARER_PREFIX.length()).strip();
        if (plainToken.isBlank()) {
            rejectUnauthorized(response, "Empty token");
            return;
        }

        String tokenHash = sha256Hex(plainToken);

        boolean valid = machineTokenRepository
                .findByTokenHashAndActiveTrue(tokenHash)
                .map(token -> {
                    // Place authentication in the security context
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    token.getMachine().getId(),
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_AGENT"))
                            );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    return true;
                })
                .orElse(false);

        if (!valid) {
            rejectUnauthorized(response, "Invalid or revoked machine token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static void rejectUnauthorized(HttpServletResponse response,
                                           String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }

    /**
     * Computes the SHA-256 hash of the given string and returns it as a
     * lowercase hex string (64 characters).
     */
    public static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed to be available in every JVM
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
