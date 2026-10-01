export type AuditLogSeverity =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL'

export type AuditLog = {
    id: string
    eventType: string
    actor: string
    description: string
    severity: AuditLogSeverity
    createdAt: string
}

