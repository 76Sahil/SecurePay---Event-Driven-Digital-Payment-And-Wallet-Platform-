import { useEffect, useState } from 'react'
import type {
    FraudAlert,
    FraudAlertSeverity,
    FraudAlertStatus,
} from '../types/fraudAlert'
import { getFraudAlerts } from '../services/fraudAlertService'

function FraudAlertsPage() {
    const [alerts, setAlerts] = useState<FraudAlert[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadAlerts() {
            try {
                const result = await getFraudAlerts()
                setAlerts(result)
            } catch {
                setError('Unable to load fraud alerts.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadAlerts()
    }, [])

    function formatAmount(amount: number, currency: string) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(amount)
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

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">Loading fraud alerts...</p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="page-section">
                <div className="page-state page-state--error">
                    {error}
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
                    <h1>Fraud Alerts</h1>
                    <p>
                        Review transactions flagged by the fraud detection
                        system.
                    </p>
                </div>
            </div>

            <div className="admin-fraud-panel">
                <div className="admin-fraud-table-wrapper">
                    <table className="admin-fraud-table">
                        <thead>
                        <tr>
                            <th>ALERT</th>
                            <th>TRANSACTION</th>
                            <th>CUSTOMER</th>
                            <th>RISK</th>
                            <th>AMOUNT</th>
                            <th>SEVERITY</th>
                            <th>STATUS</th>
                            <th>DATE</th>
                        </tr>
                        </thead>

                        <tbody>
                        {alerts.map((alert) => (
                            <tr key={alert.id}>
                                <td>
                                    <strong>{alert.id}</strong>
                                </td>

                                <td>
                                    <strong>
                                        {alert.transactionReference}
                                    </strong>
                                </td>

                                <td>
                                    <strong>
                                        {alert.customerName}
                                    </strong>
                                    <span className="admin-fraud-reason">
                                            {alert.reason}
                                        </span>
                                </td>

                                <td>
                                        <span className="admin-fraud-risk">
                                            {alert.riskScore}
                                        </span>
                                </td>

                                <td>
                                    <strong>
                                        {formatAmount(
                                            alert.amount,
                                            alert.currency,
                                        )}
                                    </strong>
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
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}

export default FraudAlertsPage