import type { SecurityEvent } from '../types/securityEvent'

const API_BASE_URL = 'http://localhost:8080'

export async function getSecurityEvents(): Promise<SecurityEvent[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view security events.')
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
        throw new Error(errorBody?.message || 'Unable to load security events.')
    }

    const data = await response.json()
    return (Array.isArray(data) ? data : []).map((e: any) => ({
        id: String(e.id),
        eventType: e.eventType ?? 'Security Event',
        description: e.description ?? e.details ?? 'Security audit event',
        severity: (e.severity ?? 'INFO') as any,
        status: (e.status ?? 'OPEN') as any,
        actor: e.actor ?? e.userEmail ?? 'system',
        createdAt: e.createdAt ?? new Date().toISOString(),
    }))
}