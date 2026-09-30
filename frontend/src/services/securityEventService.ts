import type { SecurityEvent } from '../types/securityEvent'

const mockSecurityEvents: SecurityEvent[] = [
    {
        id: 'SEC-001',
        eventType: 'Suspicious Login',
        description:
            'Multiple failed authentication attempts detected.',
        severity: 'HIGH',
        status: 'OPEN',
        actor: 'customer@securepay.com',
        createdAt: '2026-09-30T09:45:00Z',
    },
    {
        id: 'SEC-002',
        eventType: 'Account Locked',
        description:
            'Account automatically locked after repeated login failures.',
        severity: 'HIGH',
        status: 'OPEN',
        actor: 'rahul@example.com',
        createdAt: '2026-09-30T09:10:00Z',
    },
    {
        id: 'SEC-003',
        eventType: 'New Device',
        description:
            'Account accessed from a previously unseen device.',
        severity: 'MEDIUM',
        status: 'REVIEWED',
        actor: 'priya@example.com',
        createdAt: '2026-09-30T08:30:00Z',
    },
    {
        id: 'SEC-004',
        eventType: 'Password Changed',
        description:
            'Customer password was successfully changed.',
        severity: 'LOW',
        status: 'RESOLVED',
        actor: 'aarav@example.com',
        createdAt: '2026-09-30T07:50:00Z',
    },
    {
        id: 'SEC-005',
        eventType: 'Suspicious Transaction',
        description:
            'Transaction flagged because of unusual transaction velocity.',
        severity: 'CRITICAL',
        status: 'OPEN',
        actor: 'vikram@example.com',
        createdAt: '2026-09-30T07:20:00Z',
    },
]

export async function getSecurityEvents(): Promise<SecurityEvent[]> {
    return Promise.resolve(mockSecurityEvents)
}