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

const API_BASE_URL = 'http://localhost:8080'

export async function getAdminSecuritySummary(): Promise<AdminSecuritySummary> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        return Promise.resolve(mockSecuritySummary)
    }

    try {
        const [metricsRes, eventsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/admin/security/metrics`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }),
            fetch(`${API_BASE_URL}/api/admin/security/events?limit=10`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }),
        ])

        if (metricsRes.ok && eventsRes.ok) {
            const metrics = await metricsRes.json()
            const events = await eventsRes.json()

            return {
                failedLogins: metrics.failedLogins ?? 0,
                suspiciousTransactions: metrics.suspiciousTransactions ?? 0,
                lockedAccounts: metrics.lockedAccounts ?? 0,
                openFraudAlerts: metrics.openFraudAlerts ?? 0,
                securityEvents: events.map((e: any) => ({
                    id: String(e.id),
                    type: e.eventType ?? 'Security Event',
                    description: e.description ?? e.details ?? 'Security audit event',
                    severity: e.severity ?? 'INFO',
                    status: e.status ?? 'OPEN',
                    createdAt: e.createdAt ?? new Date().toISOString(),
                })),
            }
        }
    } catch {
        // Fallback to mock data if network or live server error
    }

    return Promise.resolve(mockSecuritySummary)
}