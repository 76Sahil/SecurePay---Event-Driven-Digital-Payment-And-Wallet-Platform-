package com.securepay.auth;

import com.securepay.auth.dto.RegisterRequest;
import com.securepay.auth.dto.RegisterResponse;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.user.UserRole;
import com.securepay.auth.dto.LoginRequest;
import com.securepay.auth.dto.LoginResponse;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        String normalizedEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException();
        }

        String encodedPassword =
                passwordEncoder.encode(request.password());

        User user = new User(
                request.fullName().trim(),
                normalizedEmail,
                encodedPassword
        );

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            // Protect against concurrent duplicate-email registrations.
            throw new EmailAlreadyExistsException();
        }

        return new RegisterResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                UserRole.CUSTOMER,
                user.getCreatedAt()
        );
    }


    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        String normalizedEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsException();
        }

        return new LoginResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
