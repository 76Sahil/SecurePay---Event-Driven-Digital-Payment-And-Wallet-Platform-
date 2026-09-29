export type FraudAlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type FraudAlertStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED'

export type FraudAlert = {
    id: string
    transactionReference: string
    customerName: string
    amount: number
    currency: string
    riskScore: number
    reason: string
    severity: FraudAlertSeverity
    status: FraudAlertStatus
    createdAt: string
}