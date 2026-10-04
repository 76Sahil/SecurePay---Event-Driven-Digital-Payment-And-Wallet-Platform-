package com.securepay.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class KeycloakRegistrationService {

    private static final Logger log = LoggerFactory.getLogger(KeycloakRegistrationService.class);

    private final RestClient restClient = RestClient.create();

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private String resolveClientSecret() {
        if (clientSecret != null && !clientSecret.isBlank()) {
            return clientSecret;
        }
        String env = System.getenv("KEYCLOAK_CLIENT_SECRET");
        if (env != null && !env.isBlank()) {
            return env;
        }
        String prop = System.getProperty("KEYCLOAK_CLIENT_SECRET");
        if (prop != null && !prop.isBlank()) {
            return prop;
        }
        throw new IllegalStateException(
                "KEYCLOAK_CLIENT_SECRET is missing. Please ensure KEYCLOAK_CLIENT_SECRET is configured in .env or as an environment variable."
        );
    }

    private String getAdminToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", resolveClientSecret());

        Map<?, ?> response = restClient.post()
                .uri(serverUrl + "/realms/" + realm
                        + "/protocol/openid-connect/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new IllegalStateException(
                    "Could not obtain Keycloak access token");
        }

        return response.get("access_token").toString();
    }

    public String createUser(
            String fullName,
            String email,
            String password) {

        String token = getAdminToken();

        String[] names = fullName.trim().split("\\s+", 2);

        Map<String, Object> user = Map.of(
                "username", email,
                "email", email,
                "firstName", names[0],
                "lastName", names.length > 1 ? names[1] : "",
                "enabled", true,
                "emailVerified", true,
                "credentials", List.of(Map.of(
                        "type", "password",
                        "value", password,
                        "temporary", false
                ))
        );

        var response = restClient.post()
                .uri(serverUrl + "/admin/realms/" + realm + "/users")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(user)
                .retrieve()
                .toBodilessEntity();

        String location = response.getHeaders()
                .getFirst("Location");

        if (location == null || location.isBlank()) {
            throw new IllegalStateException(
                    "Keycloak did not return the created user location");
        }

        String userId = location.substring(
                location.lastIndexOf('/') + 1);

        restClient.put()
                .uri(serverUrl + "/admin/realms/" + realm
                        + "/users/" + userId + "/reset-password")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "type", "password",
                        "value", password,
                        "temporary", false
                ))
                .retrieve()
                .toBodilessEntity();

        return userId;
    }

    public void assignRole(String userId, String roleName) {
        String token = getAdminToken();
        try {
            Map<?, ?> role = restClient.get()
                    .uri(serverUrl + "/admin/realms/" + realm + "/roles/" + roleName)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .body(Map.class);

            if (role != null) {
                restClient.post()
                        .uri(serverUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(List.of(role))
                        .retrieve()
                        .toBodilessEntity();
            }
        } catch (Exception ex) {
            log.warn("Could not assign role {} to user {}: {}", roleName, userId, ex.getMessage());
        }
    }
}
