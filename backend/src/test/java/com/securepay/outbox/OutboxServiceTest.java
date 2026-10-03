package com.securepay.outbox;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutboxServiceTest {

    @Mock
    private OutboxEventRepository outboxRepository;

    @InjectMocks
    private OutboxService outboxService;

    @BeforeEach
    void setUp() {
        when(outboxRepository.save(any(OutboxEvent.class))).thenAnswer(i -> {
            OutboxEvent e = i.getArgument(0);
            e.setId(1L);
            return e;
        });
    }

    @Test
    @DisplayName("Should persist outbox event with PENDING status")
    void shouldPersistOutboxEvent() {
        OutboxEvent event = outboxService.saveEvent(
                "WALLET_TRANSACTION",
                "TX-1001",
                "TRANSFER_COMPLETED",
                "{\"amount\":500}"
        );

        assertThat(event.getAggregateType()).isEqualTo("WALLET_TRANSACTION");
        assertThat(event.getAggregateId()).isEqualTo("TX-1001");
        assertThat(event.getEventType()).isEqualTo("TRANSFER_COMPLETED");
        assertThat(event.getStatus()).isEqualTo("PENDING");
        assertThat(event.getRetryCount()).isEqualTo(0);

        verify(outboxRepository).save(any(OutboxEvent.class));
    }
}
