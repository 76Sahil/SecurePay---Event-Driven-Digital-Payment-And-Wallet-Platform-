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

const API_BASE_URL = 'http://localhost:8080'

export async function getSecurityEvents(): Promise<SecurityEvent[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        return Promise.resolve(mockSecurityEvents)
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/security/events?limit=50`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const data = await response.json()
            return data.map((e: any) => ({
                id: String(e.id),
                eventType: e.eventType ?? 'Security Event',
                description: e.description ?? e.details ?? 'Security audit event',
                severity: e.severity ?? 'INFO',
                status: e.status ?? 'OPEN',
                actor: e.actor ?? e.userEmail ?? 'system',
                createdAt: e.createdAt ?? new Date().toISOString(),
            }))
        }
    } catch {
        // Fallback to mock data
    }

    return Promise.resolve(mockSecurityEvents)
}