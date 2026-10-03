package com.securepay.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class KeycloakJwtAuthenticationConverterTest {

    private KeycloakJwtAuthenticationConverter converter;

    @BeforeEach
    void setUp() {
        converter = new KeycloakJwtAuthenticationConverter();
    }

    @Test
    void shouldExtractRealmRolesCorrectly() {
        Jwt jwt = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of(
                        "sub", "kc-user-123",
                        "realm_access", Map.of("roles", List.of("customer", "offline_access"))
                )
        );

        Collection<GrantedAuthority> authorities = converter.convert(jwt);
        List<String> authorityStrings = authorities.stream().map(GrantedAuthority::getAuthority).toList();

        assertThat(authorityStrings).contains("ROLE_CUSTOMER", "ROLE_OFFLINE_ACCESS");
    }

    @Test
    void shouldExtractResourceAndClientRolesCorrectly() {
        Jwt jwt = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of(
                        "sub", "kc-user-123",
                        "resource_access", Map.of(
                                "securepay-backend", Map.of("roles", List.of("merchant")),
                                "account", Map.of("roles", List.of("manage-account"))
                        )
                )
        );

        Collection<GrantedAuthority> authorities = converter.convert(jwt);
        List<String> authorityStrings = authorities.stream().map(GrantedAuthority::getAuthority).toList();

        assertThat(authorityStrings).contains("ROLE_MERCHANT", "ROLE_MANAGE-ACCOUNT");
    }

    @Test
    void shouldHandleDirectRolesAndExistingRolePrefix() {
        Jwt jwt = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of(
                        "sub", "kc-user-123",
                        "roles", List.of("ROLE_ADMIN", "auditor")
                )
        );

        Collection<GrantedAuthority> authorities = converter.convert(jwt);
        List<String> authorityStrings = authorities.stream().map(GrantedAuthority::getAuthority).toList();

        assertThat(authorityStrings).contains("ROLE_ADMIN", "ROLE_AUDITOR");
    }

    @Test
    void shouldPreserveOAuth2Scopes() {
        Jwt jwt = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of(
                        "sub", "kc-user-123",
                        "scope", "openid email profile"
                )
        );

        Collection<GrantedAuthority> authorities = converter.convert(jwt);
        List<String> authorityStrings = authorities.stream().map(GrantedAuthority::getAuthority).toList();

        assertThat(authorityStrings).contains("SCOPE_openid", "SCOPE_email", "SCOPE_profile");
    }
}
