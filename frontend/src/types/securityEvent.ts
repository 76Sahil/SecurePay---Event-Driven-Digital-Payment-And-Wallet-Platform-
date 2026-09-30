export type SecurityEventSeverity =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL'

export type SecurityEventStatus =
    | 'OPEN'
    | 'REVIEWED'
    | 'RESOLVED'

export type SecurityEvent = {
    id: string
    eventType: string
    description: string
    severity: SecurityEventSeverity
    status: SecurityEventStatus
    actor: string
    createdAt: string
}