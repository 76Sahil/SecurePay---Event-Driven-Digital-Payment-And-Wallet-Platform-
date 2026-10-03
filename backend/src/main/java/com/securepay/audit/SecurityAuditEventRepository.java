package com.securepay.audit;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SecurityAuditEventRepository extends JpaRepository<SecurityAuditEvent, Long> {

    List<SecurityAuditEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByEventType(String eventType);

    long countBySeverity(SecurityAuditSeverity severity);
}
