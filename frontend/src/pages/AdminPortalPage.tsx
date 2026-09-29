import { useEffect, useState } from 'react'
import type {
    AdminSecurityEvent,
    AdminSecuritySummary,
} from '../types/adminSecurity'
import { getAdminSecuritySummary } from '../services/adminSecurityService'

function AdminPortalPage() {
    const [summary, setSummary] = useState<AdminSecuritySummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadSecuritySummary() {
            try {
                const result = await getAdminSecuritySummary()
                setSummary(result)
            } catch {
                setError('Unable to load security overview.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadSecuritySummary()
    }, [])

    function formatDate(date: string) {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date))
    }

    function getSeverityClass(
        severity: AdminSecurityEvent['severity'],
    ) {
        return `admin-security-severity admin-security-severity--${severity.toLowerCase()}`
    }

    function getStatusClass(
        status: AdminSecurityEvent['status'],
    ) {
        return `admin-security-status admin-security-status--${status.toLowerCase()}`
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">
                    Loading security command center...
                </p>
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

    return (
        <section className="page-section">
            <div className="page-section__header">
                <div>
                    <p className="page-section__eyebrow">
                        SECURITY COMMAND CENTER
                    </p>

                    <h1>Admin Dashboard</h1>

                    <p>
                        Monitor security activity, fraud signals and
                        account protection events.
                    </p>
                </div>
            </div>

            <div className="admin-security-stats">
                <div className="admin-security-stat">
                    <span className="admin-security-stat__label">
                        Failed Logins
                    </span>

                    <strong className="admin-security-stat__value">
                        {summary.failedLogins}
                    </strong>

                    <span className="admin-security-stat__meta">
                        Recent authentication failures
                    </span>
                </div>

                <div className="admin-security-stat">
                    <span className="admin-security-stat__label">
                        Suspicious Transactions
                    </span>

                    <strong className="admin-security-stat__value">
                        {summary.suspiciousTransactions}
                    </strong>

                    <span className="admin-security-stat__meta">
                        Transactions requiring attention
                    </span>
                </div>

                <div className="admin-security-stat">
                    <span className="admin-security-stat__label">
                        Locked Accounts
                    </span>

                    <strong className="admin-security-stat__value">
                        {summary.lockedAccounts}
                    </strong>

                    <span className="admin-security-stat__meta">
                        Accounts currently protected
                    </span>
                </div>

                <div className="admin-security-stat">
                    <span className="admin-security-stat__label">
                        Open Fraud Alerts
                    </span>

                    <strong className="admin-security-stat__value">
                        {summary.openFraudAlerts}
                    </strong>

                    <span className="admin-security-stat__meta">
                        Alerts awaiting investigation
                    </span>
                </div>
            </div>

            <div className="admin-security-panel">
                <div className="admin-security-panel__header">
                    <div>
                        <h2>Recent Security Events</h2>
                        <p>
                            Latest security and fraud-related activity.
                        </p>
                    </div>
                </div>

                <div className="admin-security-events">
                    {summary.securityEvents.map((event) => (
                        <div
                            key={event.id}
                            className="admin-security-event"
                        >
                            <div className="admin-security-event__main">
                                <strong>{event.type}</strong>

                                <p>{event.description}</p>

                                <span>
                                    {formatDate(event.createdAt)}
                                </span>
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
                    ))}
                </div>
            </div>
        </section>
    )
}

export default AdminPortalPage