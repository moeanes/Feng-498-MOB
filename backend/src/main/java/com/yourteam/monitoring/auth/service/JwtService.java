package com.yourteam.monitoring.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourteam.monitoring.auth.domain.User;
import com.yourteam.monitoring.auth.domain.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final ObjectMapper objectMapper;
    private final byte[] secretBytes;
    private final long expirationMinutes;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.jwt.secret:dev-secret-change-me}") String secret,
            @Value("${app.jwt.expiration-minutes:120}") long expirationMinutes
    ) {
        this.objectMapper = objectMapper;
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMinutes = expirationMinutes;
    }

    public CreatedToken createToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expirationMinutes * 60);

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.getUsername());
        payload.put("uid", user.getId().toString());
        payload.put("role", user.getRole().name());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", expiresAt.getEpochSecond());

        String unsignedToken = base64UrlJson(header) + "." + base64UrlJson(payload);
        String token = unsignedToken + "." + sign(unsignedToken);
        return new CreatedToken(token, expiresAt);
    }

    public AuthenticatedUser parseAndValidate(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new BadCredentialsException("Malformed JWT token");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        String expectedSignature = sign(unsignedToken);
        if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw new BadCredentialsException("Invalid JWT signature");
        }

        Map<String, Object> payload = decodePayload(parts[1]);
        long expiresAt = getLong(payload, "exp");
        if (Instant.now().getEpochSecond() >= expiresAt) {
            throw new BadCredentialsException("JWT token expired");
        }

        String username = getString(payload, "sub");
        UUID userId = UUID.fromString(getString(payload, "uid"));
        UserRole role = UserRole.valueOf(getString(payload, "role"));
        return new AuthenticatedUser(userId, username, role);
    }

    private String base64UrlJson(Map<String, Object> value) {
        try {
            byte[] json = objectMapper.writeValueAsBytes(value);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(json);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not encode JWT", ex);
        }
    }

    private Map<String, Object> decodePayload(String encodedPayload) {
        try {
            byte[] json = Base64.getUrlDecoder().decode(encodedPayload);
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid JWT payload", ex);
        }
    }

    private String sign(String unsignedToken) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secretBytes, HMAC_ALGORITHM));
            byte[] signature = mac.doFinal(unsignedToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not sign JWT", ex);
        }
    }

    private String getString(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        if (value instanceof String stringValue && !stringValue.isBlank()) {
            return stringValue;
        }
        throw new BadCredentialsException("JWT missing claim: " + key);
    }

    private long getLong(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        if (value instanceof Number numberValue) {
            return numberValue.longValue();
        }
        throw new BadCredentialsException("JWT missing numeric claim: " + key);
    }

    public record CreatedToken(String token, Instant expiresAt) {
    }
}
