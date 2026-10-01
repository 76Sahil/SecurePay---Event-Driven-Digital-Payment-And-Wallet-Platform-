import type { AuditLog } from '../types/auditLog'

const mockAuditLogs: AuditLog[] = [
    {
        id: 'AUD-001',
        eventType: 'LOGIN_SUCCESS',
        actor: 'admin@securepay.com',
        description: 'Administrator successfully authenticated.',
        severity: 'LOW',
        createdAt: '2026-09-30T09:45:00Z',
    },
    {
        id: 'AUD-002',
        eventType: 'LOGIN_FAILED',
        actor: 'rahul@example.com',
        description: 'Multiple failed login attempts detected.',
        severity: 'MEDIUM',
        createdAt: '2026-09-30T08:40:00Z',
    },
    {
        id: 'AUD-003',
        eventType: 'ACCOUNT_LOCKED',
        actor: 'rahul@example.com',
        description: 'Customer account was locked after repeated failed authentication.',
        severity: 'HIGH',
        createdAt: '2026-09-30T08:42:00Z',
    },
    {
        id: 'AUD-004',
        eventType: 'SUSPICIOUS_TRANSACTION',
        actor: 'vikram@example.com',
        description: 'Transaction flagged by the fraud detection system.',
        severity: 'CRITICAL',
        createdAt: '2026-09-30T08:15:00Z',
    },
    {
        id: 'AUD-005',
        eventType: 'API_KEY_REVOKED',
        actor: 'merchant@securepay.com',
        description: 'Merchant API key was revoked.',
        severity: 'HIGH',
        createdAt: '2026-09-29T16:30:00Z',
    },
    {
        id: 'AUD-006',
        eventType: 'NEW_DEVICE',
        actor: 'priya@example.com',
        description: 'A new device was registered for the customer account.',
        severity: 'MEDIUM',
        createdAt: '2026-09-29T14:20:00Z',
    },
    {
        id: 'AUD-007',
        eventType: 'PASSWORD_CHANGED',
        actor: 'aarav@example.com',
        description: 'Customer password was successfully changed.',
        severity: 'LOW',
        createdAt: '2026-09-29T11:10:00Z',
    },
]

export async function getAuditLogs(): Promise<AuditLog[]> {
    return Promise.resolve(mockAuditLogs)
}