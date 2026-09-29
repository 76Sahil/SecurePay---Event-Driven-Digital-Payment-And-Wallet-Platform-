import type { FraudAlert } from '../types/fraudAlert'

const mockFraudAlerts: FraudAlert[] = [
    {
        id: 'FRD-001',
        transactionReference: 'SP-PAY-30001',
        customerName: 'Arjun Mehta',
        amount: 85000,
        currency: 'INR',
        riskScore: 92,
        reason: 'High-value transaction from a new device.',
        severity: 'HIGH',
        status: 'OPEN',
        createdAt: '2026-09-30T09:15:00Z',
    },
    {
        id: 'FRD-002',
        transactionReference: 'SP-PAY-30002',
        customerName: 'Riya Kapoor',
        amount: 42500,
        currency: 'INR',
        riskScore: 76,
        reason: 'Unusual transaction velocity detected.',
        severity: 'HIGH',
        status: 'REVIEWED',
        createdAt: '2026-09-30T08:40:00Z',
    },
    {
        id: 'FRD-003',
        transactionReference: 'SP-PAY-30003',
        customerName: 'Karan Verma',
        amount: 18000,
        currency: 'INR',
        riskScore: 61,
        reason: 'New beneficiary combined with unusual amount.',
        severity: 'MEDIUM',
        status: 'OPEN',
        createdAt: '2026-09-30T07:55:00Z',
    },
    {
        id: 'FRD-004',
        transactionReference: 'SP-PAY-30004',
        customerName: 'Neha Sharma',
        amount: 7500,
        currency: 'INR',
        riskScore: 34,
        reason: 'Multiple authentication failures before payment.',
        severity: 'LOW',
        status: 'RESOLVED',
        createdAt: '2026-09-30T06:30:00Z',
    },
]

export async function getFraudAlerts(): Promise<FraudAlert[]> {
    return Promise.resolve(mockFraudAlerts)
}