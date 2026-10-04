import type { FraudAlert, FraudAlertSeverity, FraudAlertStatus } from '../types/fraudAlert'

const API_BASE_URL = 'http://localhost:8080'

export async function getFraudAlerts(): Promise<FraudAlert[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view fraud alerts.')
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/security/fraud-alerts`, {
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
    const rawAlerts = Array.isArray(data) ? data : []

    return rawAlerts.map((e: any) => {
        let mappedSeverity: FraudAlertSeverity = 'MEDIUM'
        const sev = String(e.severity || '').toUpperCase()
        if (sev === 'CRITICAL') mappedSeverity = 'CRITICAL'
        else if (sev === 'WARN' || sev === 'HIGH') mappedSeverity = 'HIGH'

        return {
            id: String(e.id || `FRD-${Math.random()}`),
            transactionReference: e.transactionReference || `TXN-REF-${e.id}`,
            customerName: e.customerName || e.userEmail || 'Flagged User',
            amount: Number(e.amount || 0),
            currency: e.currency || 'INR',
            riskScore: Number(e.riskScore || (mappedSeverity === 'CRITICAL' ? 95 : 65)),
            reason: e.reason || 'Risk engine security alert',
            severity: mappedSeverity,
            status: (e.status === 'RESOLVED' || e.status === 'REVIEWED' ? e.status : 'OPEN') as FraudAlertStatus,
            createdAt: e.createdAt ?? new Date().toISOString(),
        }
    })
}

export async function resolveFraudAlert(alertId: string): Promise<void> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to update fraud alerts.')
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/security/fraud-alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Failed to resolve fraud alert.')
    }
}