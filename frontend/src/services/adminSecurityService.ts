import type { AdminSecuritySummary } from '../types/adminSecurity'

const mockSecuritySummary: AdminSecuritySummary = {
    failedLogins: 18,
    suspiciousTransactions: 7,
    lockedAccounts: 3,
    openFraudAlerts: 4,

    securityEvents: [
        {
            id: 'security-event-001',
            type: 'Suspicious Transaction',
            description:
                'High-value transaction flagged for unusual activity.',
            severity: 'HIGH',
            status: 'OPEN',
            createdAt: '2026-09-30T10:20:00Z',
        },
        {
            id: 'security-event-002',
            type: 'Multiple Failed Logins',
            description:
                'Multiple failed login attempts detected for an account.',
            severity: 'MEDIUM',
            status: 'REVIEWED',
            createdAt: '2026-09-30T09:45:00Z',
        },
        {
            id: 'security-event-003',
            type: 'Account Locked',
            description:
                'Account automatically locked after repeated authentication failures.',
            severity: 'HIGH',
            status: 'OPEN',
            createdAt: '2026-09-30T09:10:00Z',
        },
        {
            id: 'security-event-004',
            type: 'New Device',
            description:
                'Customer account accessed from a previously unseen device.',
            severity: 'LOW',
            status: 'RESOLVED',
            createdAt: '2026-09-30T08:30:00Z',
        },
    ],
}

export async function getAdminSecuritySummary(): Promise<AdminSecuritySummary> {
    return Promise.resolve(mockSecuritySummary)
}