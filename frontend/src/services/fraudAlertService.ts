import type { FraudAlert, FraudAlertSeverity } from '../types/fraudAlert'

const API_BASE_URL = 'http://localhost:8080'

export async function getFraudAlerts(): Promise<FraudAlert[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view fraud alerts.')
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
        throw new Error(errorBody?.message || 'Unable to load fraud alerts.')
    }

    const data = await response.json()
    const rawEvents = Array.isArray(data) ? data : []

    // Filter to events that are risk/fraud/blocked alerts
    const alerts = rawEvents.filter((e: any) => {
        const type = String(e.eventType || '').toUpperCase()
        const sev = String(e.severity || '').toUpperCase()
        return (
            sev === 'CRITICAL' ||
            sev === 'WARN' ||
            type.includes('BLOCKED') ||
            type.includes('FRAUD') ||
            type.includes('SUSPICIOUS')
        )
    })

    return alerts.map((e: any) => {
        let mappedSeverity: FraudAlertSeverity = 'MEDIUM'
        const sev = String(e.severity || '').toUpperCase()
        if (sev === 'CRITICAL') mappedSeverity = 'CRITICAL'
        else if (sev === 'WARN' || sev === 'HIGH') mappedSeverity = 'HIGH'

        return {
            id: `FRD-${e.id}`,
            transactionReference: e.transactionReference || `TXN-REF-${e.id}`,
            customerName: e.actor || e.userEmail || 'Flagged Account',
            amount: Number(e.amount || 0),
            currency: 'INR',
            riskScore: mappedSeverity === 'CRITICAL' ? 95 : mappedSeverity === 'HIGH' ? 75 : 45,
            reason: e.description || e.details || 'Risk rule triggered',
            severity: mappedSeverity,
            status: 'OPEN' as const,
            createdAt: e.createdAt ?? new Date().toISOString(),
        }
    })
}