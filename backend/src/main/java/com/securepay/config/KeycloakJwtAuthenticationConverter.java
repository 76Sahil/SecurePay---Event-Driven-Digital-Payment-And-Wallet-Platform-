package com.securepay.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final JwtGrantedAuthoritiesConverter defaultGrantedAuthoritiesConverter =
            new JwtGrantedAuthoritiesConverter();

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = defaultGrantedAuthoritiesConverter.convert(jwt);
        List<GrantedAuthority> result = authorities != null
                ? new ArrayList<>(authorities)
                : new ArrayList<>();

        Set<String> roles = new HashSet<>();

        // 1. Extract realm roles: realm_access.roles
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            Object rolesObj = realmAccess.get("roles");
            if (rolesObj instanceof Collection<?> roleList) {
                for (Object role : roleList) {
                    if (role instanceof String roleStr) {
                        roles.add(roleStr);
                    }
                }
            }
        }

        // 2. Extract client/resource roles: resource_access.<client-id>.roles
        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            for (Object clientObj : resourceAccess.values()) {
                if (clientObj instanceof Map<?, ?> clientMap && clientMap.containsKey("roles")) {
                    Object clientRoles = clientMap.get("roles");
                    if (clientRoles instanceof Collection<?> roleList) {
                        for (Object role : roleList) {
                            if (role instanceof String roleStr) {
                                roles.add(roleStr);
                            }
                        }
                    }
                }
            }
        }

        // 3. Extract direct 'roles' claim if present
        List<String> directRoles = jwt.getClaimAsStringList("roles");
        if (directRoles != null) {
            roles.addAll(directRoles);
        }

        // If neither ADMIN nor MERCHANT is assigned, default to CUSTOMER
        // to maintain parity with the frontend and ensure standard customer access.
        boolean hasAdmin = roles.stream().anyMatch(r -> r.equalsIgnoreCase("ADMIN") || r.equalsIgnoreCase("ROLE_ADMIN"));
        boolean hasMerchant = roles.stream().anyMatch(r -> r.equalsIgnoreCase("MERCHANT") || r.equalsIgnoreCase("ROLE_MERCHANT"));
        if (!hasAdmin && !hasMerchant) {
            roles.add("CUSTOMER");
        }

        for (String role : roles) {
            String trimmed = role.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            String normalized = trimmed.toUpperCase(Locale.ROOT);
            if (!normalized.startsWith("ROLE_")) {
                normalized = "ROLE_" + normalized;
            }
            result.add(new SimpleGrantedAuthority(normalized));
        }

        return Collections.unmodifiableList(result);
    }

    public JwtAuthenticationConverter getJwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this);
        return converter;
    }
}
