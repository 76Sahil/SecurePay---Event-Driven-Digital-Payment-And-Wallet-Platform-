package com.securepay.outbox;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OutboxService {

    private static final Logger log = LoggerFactory.getLogger(OutboxService.class);

    private final OutboxEventRepository outboxRepository;

    public OutboxService(OutboxEventRepository outboxRepository) {
        this.outboxRepository = outboxRepository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public OutboxEvent saveEvent(
            String aggregateType,
            String aggregateId,
            String eventType,
            String payload) {

        OutboxEvent event = new OutboxEvent();
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setEventType(eventType);
        event.setPayload(payload);
        event.setStatus("PENDING");

        OutboxEvent saved = outboxRepository.save(event);
        log.info("OUTBOX EVENT CREATED: [{}] aggregate={}:{}", eventType, aggregateType, aggregateId);

        return saved;
    }
}
