package com.yourteam.monitoring.auth.service;

import com.yourteam.monitoring.auth.api.LoginRequest;
import com.yourteam.monitoring.auth.api.LoginResponse;
import com.yourteam.monitoring.auth.domain.User;
import com.yourteam.monitoring.auth.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        JwtService.CreatedToken createdToken = jwtService.createToken(user);
        return new LoginResponse(
                createdToken.token(),
                "Bearer",
                createdToken.expiresAt(),
                user.getUsername(),
                user.getRole()
        );
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }
}
