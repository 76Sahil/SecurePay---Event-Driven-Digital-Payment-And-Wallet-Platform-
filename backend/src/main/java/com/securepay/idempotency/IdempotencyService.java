package com.securepay.idempotency;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);
    private static final int DEFAULT_TTL_HOURS = 24;

    private final IdempotencyRecordRepository repository;

    public IdempotencyService(IdempotencyRecordRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Optional<IdempotencyRecord> checkOrAcquire(Long userId, String idempotencyKey, String payload) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return Optional.empty();
        }

        String requestHash = hashPayload(payload);
        Optional<IdempotencyRecord> existingOpt = repository.findByUserIdAndIdempotencyKey(userId, idempotencyKey);

        if (existingOpt.isPresent()) {
            IdempotencyRecord existing = existingOpt.get();

            if (existing.getExpiresAt().isBefore(LocalDateTime.now())) {
                repository.delete(existing);
            } else {
                if (!existing.getRequestHash().equals(requestHash)) {
                    throw new IllegalArgumentException(
                            "Idempotency key was previously used with a different request payload."
                    );
                }

                if (existing.getStatus() == IdempotencyStatus.PROCESSING) {
                    throw new IllegalStateException(
                            "A concurrent transaction is currently in progress with this idempotency key."
                    );
                }

                if (existing.getStatus() == IdempotencyStatus.COMPLETED) {
                    log.info("Returning cached idempotent response for user {} and key {}", userId, idempotencyKey);
                    return Optional.of(existing);
                }

                // If previously FAILED, reset to PROCESSING for a retry attempt
                existing.setStatus(IdempotencyStatus.PROCESSING);
                existing.setExpiresAt(LocalDateTime.now().plusHours(DEFAULT_TTL_HOURS));
                repository.save(existing);
                return Optional.empty();
            }
        }

        IdempotencyRecord newRecord = new IdempotencyRecord();
        newRecord.setUserId(userId);
        newRecord.setIdempotencyKey(idempotencyKey);
        newRecord.setRequestHash(requestHash);
        newRecord.setStatus(IdempotencyStatus.PROCESSING);
        newRecord.setExpiresAt(LocalDateTime.now().plusHours(DEFAULT_TTL_HOURS));
        repository.save(newRecord);

        return Optional.empty();
    }

    @Transactional
    public void complete(Long userId, String idempotencyKey, int statusCode, String responseBody) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }

        repository.findByUserIdAndIdempotencyKey(userId, idempotencyKey).ifPresent(record -> {
            record.setStatus(IdempotencyStatus.COMPLETED);
            record.setResponseStatus(statusCode);
            record.setResponseBody(responseBody);
            repository.save(record);
        });
    }

    @Transactional
    public void markFailed(Long userId, String idempotencyKey, String errorMessage) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }

        repository.findByUserIdAndIdempotencyKey(userId, idempotencyKey).ifPresent(record -> {
            record.setStatus(IdempotencyStatus.FAILED);
            record.setResponseBody(errorMessage);
            repository.save(record);
        });
    }

    private String hashPayload(String payload) {
        if (payload == null) {
            payload = "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
