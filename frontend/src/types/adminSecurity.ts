export type SecurityEventSeverity =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL'

export type SecurityEventStatus =
    | 'OPEN'
    | 'REVIEWED'
    | 'RESOLVED'

export type AdminSecurityEvent = {
    id: string
    type: string
    description: string
    severity: SecurityEventSeverity
    status: SecurityEventStatus
    createdAt: string
}

export type AdminSecuritySummary = {
    failedLogins: number
    suspiciousTransactions: number
    lockedAccounts: number
    openFraudAlerts: number
    securityEvents: AdminSecurityEvent[]
}