import { useEffect, useState } from 'react'
import { getAuditLogs } from '../services/auditLogService'
import type { AuditLog } from '../types/auditLog'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadAuditLogs() {
            try {
                const data = await getAuditLogs()
                setLogs(data)
            } catch {
                setError('Unable to load audit logs.')
            } finally {
                setIsLoading(false)
            }
        }

        loadAuditLogs()
    }, [])

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">SECURITY COMMAND CENTER</span>
                    <h1>Audit Logs</h1>
                    <p>Review security and account activity across SecurePay.</p>
                </div>

                <div className="audit-logs-state">
                    <p>Loading audit logs...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">SECURITY COMMAND CENTER</span>
                    <h1>Audit Logs</h1>
                    <p>Review security and account activity across SecurePay.</p>
                </div>

                <div className="audit-logs-state audit-logs-state--error">
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="page-eyebrow">SECURITY COMMAND CENTER</span>
                <h1>Audit Logs</h1>
                <p>Review security and account activity across SecurePay.</p>
            </div>

            <section className="audit-logs-card">
                <div className="audit-logs-card__header">
                    <div>
                        <h2>Activity Log</h2>
                        <p>{logs.length} audit events</p>
                    </div>
                </div>

                {logs.length === 0 ? (
                    <div className="audit-logs-state">
                        <p>No audit events found.</p>
                    </div>
                ) : (
                    <div className="audit-logs-table-wrapper">
                        <table className="audit-logs-table">
                            <thead>
                            <tr>
                                <th>Event</th>
                                <th>Actor</th>
                                <th>Description</th>
                                <th>Severity</th>
                                <th>Date</th>
                            </tr>
                            </thead>

                            <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <div className="audit-log-identity">
                                            <strong>{log.eventType}</strong>
                                            <span>{log.id}</span>
                                        </div>
                                    </td>

                                    <td>{log.actor}</td>

                                    <td className="audit-log-description">
                                        {log.description}
                                    </td>

                                    <td>
                                            <span
                                                className={`audit-log-severity ${log.severity.toLowerCase()}`}
                                            >
                                                {log.severity}
                                            </span>
                                    </td>

                                    <td>{formatDate(log.createdAt)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}

export default AuditLogsPage