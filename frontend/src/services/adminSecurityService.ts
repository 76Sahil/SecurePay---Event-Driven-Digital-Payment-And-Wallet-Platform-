import type { AdminSecuritySummary } from '../types/adminSecurity'

const API_BASE_URL = 'http://localhost:8080'

export async function getAdminSecuritySummary(): Promise<AdminSecuritySummary> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view the security command center.')
    }

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

    if (!metricsRes.ok || !eventsRes.ok) {
        if (metricsRes.status === 403 || eventsRes.status === 403) {
            throw new Error('Access denied. Administrator privileges required.')
        }
        throw new Error('Unable to retrieve live security telemetry.')
    }

    const metrics = await metricsRes.json()
    const events = await eventsRes.json()

    return {
        failedLogins: metrics.failedLogins ?? 0,
        suspiciousTransactions: metrics.suspiciousTransactions ?? 0,
        lockedAccounts: metrics.lockedAccounts ?? 0,
        openFraudAlerts: metrics.openFraudAlerts ?? 0,
        securityEvents: (Array.isArray(events) ? events : []).map((e: any) => ({
            id: String(e.id),
            type: e.eventType ?? 'Security Event',
            description: e.description ?? e.details ?? 'Security audit event',
            severity: (e.severity ?? 'INFO') as any,
            status: (e.status ?? 'OPEN') as any,
            createdAt: e.createdAt ?? new Date().toISOString(),
        })),
    }
}