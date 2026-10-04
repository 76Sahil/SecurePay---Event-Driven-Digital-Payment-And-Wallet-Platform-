import { useEffect, useState, useCallback, useMemo } from 'react'
import type {
    FraudAlert,
    FraudAlertSeverity,
    FraudAlertStatus,
} from '../types/fraudAlert'
import { getFraudAlerts, resolveFraudAlert } from '../services/fraudAlertService'

function FraudAlertsPage() {
    const [alerts, setAlerts] = useState<FraudAlert[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionMessage, setActionMessage] = useState<string | null>(null)
    const [filterSeverity, setFilterSeverity] = useState<string>('ALL')
    const [resolvingId, setResolvingId] = useState<string | null>(null)

    const loadAlerts = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await getFraudAlerts()
            setAlerts(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load fraud alerts.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadAlerts()
    }, [loadAlerts])

    const filteredAlerts = useMemo(() => {
        if (filterSeverity === 'ALL') return alerts
        return alerts.filter((a) => a.severity === filterSeverity)
    }, [alerts, filterSeverity])

    async function handleResolve(alertId: string) {
        try {
            setResolvingId(alertId)
            setActionMessage(null)
            await resolveFraudAlert(alertId)
            setActionMessage(`Alert ${alertId} resolved successfully.`)
            setAlerts((prev) => prev.filter((a) => a.id !== alertId))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resolve alert.')
        } finally {
            setResolvingId(null)
        }
    }

    function formatDate(date: string) {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date))
    }

    function severityClass(severity: FraudAlertSeverity) {
        return `admin-security-severity admin-security-severity--${severity.toLowerCase()}`
    }

    function statusClass(status: FraudAlertStatus) {
        return `admin-security-status admin-security-status--${status.toLowerCase()}`
    }

    return (
        <section className="page-section">
            <div className="page-section__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p className="page-section__eyebrow">
                        SECURITY COMMAND CENTER
                    </p>
                    <h1>Fraud Alerts</h1>
                    <p>
                        Real-time risk evaluations and suspicious transaction alerts from backend risk engine.
                    </p>
                </div>
                <button
                    type="button"
                    className="sp-btn sp-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
                    onClick={() => void loadAlerts()}
                    disabled={isLoading}
                >
                    ↻ Refresh
                </button>
            </div>

            {actionMessage && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    fontSize: '14px',
                    marginBottom: '16px'
                }}>
                    ✓ {actionMessage}
                </div>
            )}

            {error && (
                <div className="page-state page-state--error" style={{ marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Severity filter pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                    <button
                        key={sev}
                        type="button"
                        onClick={() => setFilterSeverity(sev)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: filterSeverity === sev ? '1px solid #0284c7' : '1px solid #e2e8f0',
                            background: filterSeverity === sev ? '#0284c7' : '#ffffff',
                            color: filterSeverity === sev ? '#ffffff' : '#64748b',
                            cursor: 'pointer'
                        }}
                    >
                        {sev} {sev === 'ALL' ? `(${alerts.length})` : `(${alerts.filter((a) => a.severity === sev).length})`}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="page-state" style={{ padding: '48px', textAlign: 'center' }}>
                    Loading real-time fraud alerts...
                </div>
            ) : filteredAlerts.length === 0 ? (
                <div style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 6px 0' }}>
                        No Fraud Alerts Detected
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                        All transactions and account events have passed risk engine thresholds. The system is operating normally.
                    </p>
                </div>
            ) : (
                <div className="admin-fraud-panel">
                    <div className="admin-fraud-table-wrapper">
                        <table className="admin-fraud-table">
                            <thead>
                            <tr>
                                <th>ALERT</th>
                                <th>TRANSACTION / REF</th>
                                <th>CUSTOMER / ACTOR</th>
                                <th>RISK SCORE</th>
                                <th>SEVERITY</th>
                                <th>STATUS</th>
                                <th>DATE</th>
                                <th>ACTION</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredAlerts.map((alert) => (
                                <tr key={alert.id}>
                                    <td>
                                        <strong>{alert.id}</strong>
                                    </td>

                                    <td>
                                        <strong>{alert.transactionReference}</strong>
                                    </td>

                                    <td>
                                        <strong>{alert.customerName}</strong>
                                        <span className="admin-fraud-reason">
                                            {alert.reason}
                                        </span>
                                    </td>

                                    <td>
                                        <span className="admin-fraud-risk" style={{
                                            color: alert.riskScore >= 70 ? '#ef4444' : alert.riskScore >= 40 ? '#f59e0b' : '#10b981',
                                            fontWeight: 700
                                        }}>
                                            {alert.riskScore} / 100
                                        </span>
                                    </td>

                                    <td>
                                        <span className={severityClass(alert.severity)}>
                                            {alert.severity}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={statusClass(alert.status)}>
                                            {alert.status}
                                        </span>
                                    </td>

                                    <td>
                                        {formatDate(alert.createdAt)}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="sp-btn sp-btn-secondary"
                                            style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                                            onClick={() => handleResolve(alert.id)}
                                            disabled={resolvingId === alert.id}
                                        >
                                            {resolvingId === alert.id ? 'Resolving...' : 'Resolve'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    )
}

export default FraudAlertsPage