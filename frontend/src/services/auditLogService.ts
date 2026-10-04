import type { AuditLog, AuditLogSeverity } from '../types/auditLog'

const API_BASE_URL = 'http://localhost:8080'

export async function getAuditLogs(): Promise<AuditLog[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view audit logs.')
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/security/events?limit=50`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('Access denied. Administrator privileges required.')
        }
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Unable to load audit logs.')
    }

    const data = await response.json()
    return (Array.isArray(data) ? data : []).map((e: any) => {
        let mappedSeverity: AuditLogSeverity = 'LOW'
        const sev = String(e.severity || '').toUpperCase()
        if (sev === 'CRITICAL') mappedSeverity = 'CRITICAL'
        else if (sev === 'HIGH' || sev === 'WARN') mappedSeverity = 'HIGH'
        else if (sev === 'MEDIUM') mappedSeverity = 'MEDIUM'

        return {
            id: String(e.id),
            eventType: e.eventType ?? 'AUDIT_EVENT',
            actor: e.actor ?? e.userEmail ?? 'system',
            description: e.description ?? e.details ?? 'Security audit event recorded.',
            severity: mappedSeverity,
            createdAt: e.createdAt ?? new Date().toISOString(),
        }
    })
}