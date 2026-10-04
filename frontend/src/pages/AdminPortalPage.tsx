import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import type {
    AdminSecurityEvent,
    AdminSecuritySummary,
} from '../types/adminSecurity'
import type { FraudAlert } from '../types/fraudAlert'
import { getAdminSecuritySummary } from '../services/adminSecurityService'
import { getFraudAlerts } from '../services/fraudAlertService'

function AdminPortalPage() {
    const [summary, setSummary] = useState<AdminSecuritySummary | null>(null)
    const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadSecurityData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const [secSummary, alerts] = await Promise.all([
                getAdminSecuritySummary(),
                getFraudAlerts().catch(() => []),
            ])
            setSummary(secSummary)
            setFraudAlerts(alerts)
        } catch {
            setError('Unable to load security command center telemetry.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadSecurityData()
    }, [loadSecurityData])

    function formatDate(date: string) {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date))
    }

    function getSeverityClass(severity: AdminSecurityEvent['severity']) {
        return `admin-security-severity admin-security-severity--${severity.toLowerCase()}`
    }

    function getStatusClass(status: AdminSecurityEvent['status']) {
        return `admin-security-status admin-security-status--${status.toLowerCase()}`
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">Loading security command center...</p>
            </section>
        )
    }

    if (error || !summary) {
        return (
            <section className="page-section">
                <div className="page-state page-state--error">
                    {error ?? 'Unable to load security data.'}
                </div>
            </section>
        )
    }

    const isAttentionRequired = summary.openFraudAlerts > 0 || summary.lockedAccounts > 0

    return (
        <section className="page-section">
            {/* Header */}
            <div className="page-section__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p className="page-section__eyebrow">
                        SECURITY COMMAND CENTER &bull; LIVE TELEMETRY
                    </p>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Admin Command Center
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: isAttentionRequired ? '#fef3c7' : '#dcfce7',
                            color: isAttentionRequired ? '#b45309' : '#15803d',
                            border: isAttentionRequired ? '1px solid #fde68a' : '1px solid #bbf7d0',
                        }}>
                            {isAttentionRequired ? '⚠ ATTENTION REQUIRED' : '● SYSTEM SECURE'}
                        </span>
                    </h1>
                    <p>
                        High-assurance monitoring of authentication health, fraud risk signals, and account protection.
                    </p>
                </div>

                <button
                    type="button"
                    className="sp-btn sp-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
                    onClick={() => void loadSecurityData()}
                >
                    ↻ Refresh Telemetry
                </button>
            </div>

            {/* Quick Command Actions */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
            }}>
                <Link to="/admin/security-events" style={{
                    padding: '14px 18px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textDecoration: 'none',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}>
                    <span style={{ fontSize: '18px', color: '#0284c7' }}>◈</span>
                    <div>
                        <div>Security Events</div>
                        <small style={{ color: '#64748b', fontWeight: 400 }}>Inspect audit trail</small>
                    </div>
                </Link>

                <Link to="/admin/fraud-alerts" style={{
                    padding: '14px 18px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textDecoration: 'none',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}>
                    <span style={{ fontSize: '18px', color: '#e11d48' }}>⚠</span>
                    <div>
                        <div>Fraud Alerts</div>
                        <small style={{ color: '#64748b', fontWeight: 400 }}>{summary.openFraudAlerts} active alerts</small>
                    </div>
                </Link>

                <Link to="/admin/users" style={{
                    padding: '14px 18px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textDecoration: 'none',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}>
                    <span style={{ fontSize: '18px', color: '#8b5cf6' }}>♙</span>
                    <div>
                        <div>User Protection</div>
                        <small style={{ color: '#64748b', fontWeight: 400 }}>Access control & locks</small>
                    </div>
                </Link>

                <Link to="/admin/audit" style={{
                    padding: '14px 18px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textDecoration: 'none',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}>
                    <span style={{ fontSize: '18px', color: '#10b981' }}>☷</span>
                    <div>
                        <div>Audit Logs</div>
                        <small style={{ color: '#64748b', fontWeight: 400 }}>Compliance records</small>
                    </div>
                </Link>
            </div>

            {/* Risk & Fraud Telemetry Grid */}
            <div className="admin-security-stats">
                <div className="admin-security-stat">
                    <span className="admin-security-stat__label">Failed Logins</span>
                    <strong className="admin-security-stat__value" style={{ color: summary.failedLogins > 0 ? '#ef4444' : '#0f172a' }}>
                        {summary.failedLogins}
                    </strong>
                    <span className="admin-security-stat__meta">Authentication anomalies</span>
                </div>

                <div className="admin-security-stat">
                    <span className="admin-security-stat__label">Suspicious Transactions</span>
                    <strong className="admin-security-stat__value" style={{ color: summary.suspiciousTransactions > 0 ? '#f59e0b' : '#0f172a' }}>
                        {summary.suspiciousTransactions}
                    </strong>
                    <span className="admin-security-stat__meta">Blocked or flagged by risk engine</span>
                </div>

                <div className="admin-security-stat">
                    <span className="admin-security-stat__label">Locked Accounts</span>
                    <strong className="admin-security-stat__value" style={{ color: summary.lockedAccounts > 0 ? '#dc2626' : '#0f172a' }}>
                        {summary.lockedAccounts}
                    </strong>
                    <span className="admin-security-stat__meta">Accounts isolated for safety</span>
                </div>

                <div className="admin-security-stat">
                    <span className="admin-security-stat__label">Open Fraud Alerts</span>
                    <strong className="admin-security-stat__value" style={{ color: summary.openFraudAlerts > 0 ? '#e11d48' : '#0f172a' }}>
                        {summary.openFraudAlerts}
                    </strong>
                    <span className="admin-security-stat__meta">Active critical/high risk events</span>
                </div>
            </div>

            {/* Two-Column Grid: Recent Security Events & Recent Fraud Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginTop: '24px' }}>
                {/* Panel 1: Recent Security Events */}
                <div className="admin-security-panel" style={{ margin: 0 }}>
                    <div className="admin-security-panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '16px', margin: 0 }}>Recent Security Events</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Audit log records from system activities</p>
                        </div>
                        <Link to="/admin/security-events" style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                            View All →
                        </Link>
                    </div>

                    <div className="admin-security-events">
                        {summary.securityEvents.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                                No security events recorded yet.
                            </div>
                        ) : (
                            summary.securityEvents.slice(0, 6).map((event) => (
                                <div key={event.id} className="admin-security-event">
                                    <div className="admin-security-event__main">
                                        <strong>{event.type}</strong>
                                        <p>{event.description}</p>
                                        <span>{formatDate(event.createdAt)}</span>
                                    </div>
                                    <div className="admin-security-event__meta">
                                        <span className={getSeverityClass(event.severity)}>
                                            {event.severity}
                                        </span>
                                        <span className={getStatusClass(event.status)}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Panel 2: Recent Fraud Alerts */}
                <div className="admin-security-panel" style={{ margin: 0 }}>
                    <div className="admin-security-panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '16px', margin: 0 }}>Recent Fraud Alerts</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Live alerts from risk rules and transaction evaluation</p>
                        </div>
                        <Link to="/admin/fraud-alerts" style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                            View All →
                        </Link>
                    </div>

                    <div className="admin-security-events">
                        {fraudAlerts.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                                🛡️ No fraud alerts detected. System is operating normally.
                            </div>
                        ) : (
                            fraudAlerts.slice(0, 6).map((alert) => (
                                <div key={alert.id} className="admin-security-event">
                                    <div className="admin-security-event__main">
                                        <strong style={{ color: alert.severity === 'CRITICAL' ? '#dc2626' : '#d97706' }}>
                                            {alert.id} &bull; {alert.transactionReference}
                                        </strong>
                                        <p>{alert.reason}</p>
                                        <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span>{alert.customerName}</span>
                                            <span>&bull;</span>
                                            <span>{formatDate(alert.createdAt)}</span>
                                        </span>
                                    </div>
                                    <div className="admin-security-event__meta">
                                        <span className={`admin-security-severity admin-security-severity--${alert.severity.toLowerCase()}`}>
                                            {alert.severity} ({alert.riskScore})
                                        </span>
                                        <span className="admin-security-status admin-security-status--open">
                                            {alert.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AdminPortalPage