
package com.securepay.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.List;
import java.util.Map;

@Service
public class KeycloakRegistrationService {

    private final RestClient restClient = RestClient.create();

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private String getAdminToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);

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
                "emailVerified", false,
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

        restClient.put()
                .uri(serverUrl + "/admin/realms/" + realm
                        + "/users/" + userId
                        + "/execute-actions-email")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(List.of("VERIFY_EMAIL"))
                .retrieve()
                .toBodilessEntity();

        return userId;
    }
}