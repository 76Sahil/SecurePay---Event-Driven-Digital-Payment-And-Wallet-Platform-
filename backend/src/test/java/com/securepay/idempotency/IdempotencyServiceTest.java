package com.securepay.idempotency;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private IdempotencyRecordRepository repository;

    @InjectMocks
    private IdempotencyService idempotencyService;

    private Long userId;
    private String key;
    private String payload;

    @BeforeEach
    void setUp() {
        userId = 1L;
        key = "idem-test-key-123";
        payload = "TRANSFER:alice@securepay.local:500.00";
    }

    @Test
    void shouldAcquireNewKeySuccessfully() {
        when(repository.findByUserIdAndIdempotencyKey(userId, key)).thenReturn(Optional.empty());

        Optional<IdempotencyRecord> result = idempotencyService.checkOrAcquire(userId, key, payload);

        assertThat(result).isEmpty();
        verify(repository).save(any(IdempotencyRecord.class));
    }

    @Test
    void shouldReturnCachedResponseWhenAlreadyCompleted() {
        IdempotencyRecord completed = new IdempotencyRecord();
        completed.setUserId(userId);
        completed.setIdempotencyKey(key);
        completed.setRequestHash(hash(payload));
        completed.setStatus(IdempotencyStatus.COMPLETED);
        completed.setResponseStatus(200);
        completed.setResponseBody("{\"status\":\"SUCCESS\",\"amount\":500}");
        completed.setExpiresAt(LocalDateTime.now().plusHours(24));

        when(repository.findByUserIdAndIdempotencyKey(userId, key)).thenReturn(Optional.of(completed));

        Optional<IdempotencyRecord> result = idempotencyService.checkOrAcquire(userId, key, payload);

        assertThat(result).isPresent();
        assertThat(result.get().getResponseBody()).contains("500");
        verify(repository, never()).save(any(IdempotencyRecord.class));
    }

    @Test
    void shouldThrowExceptionWhenKeyUsedConcurrently() {
        IdempotencyRecord processing = new IdempotencyRecord();
        processing.setUserId(userId);
        processing.setIdempotencyKey(key);
        processing.setRequestHash(hash(payload));
        processing.setStatus(IdempotencyStatus.PROCESSING);
        processing.setExpiresAt(LocalDateTime.now().plusHours(24));

        when(repository.findByUserIdAndIdempotencyKey(userId, key)).thenReturn(Optional.of(processing));

        assertThatThrownBy(() -> idempotencyService.checkOrAcquire(userId, key, payload))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("concurrent transaction is currently in progress");
    }

    private String hash(String input) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void shouldThrowExceptionWhenPayloadDiffers() {
        IdempotencyRecord existing = new IdempotencyRecord();
        existing.setUserId(userId);
        existing.setIdempotencyKey(key);
        existing.setRequestHash("different-hash-value");
        existing.setStatus(IdempotencyStatus.COMPLETED);
        existing.setExpiresAt(LocalDateTime.now().plusHours(24));

        when(repository.findByUserIdAndIdempotencyKey(userId, key)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> idempotencyService.checkOrAcquire(userId, key, payload))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("previously used with a different request payload");
    }
}
