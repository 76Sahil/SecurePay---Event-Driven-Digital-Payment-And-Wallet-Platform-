import { useEffect, useState } from 'react'
import type {
    SecurityEvent,
    SecurityEventSeverity,
    SecurityEventStatus,
} from '../types/securityEvent'
import { getSecurityEvents } from '../services/securityEventService'

function SecurityEventsPage() {
    const [events, setEvents] = useState<SecurityEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadEvents() {
            try {
                const result = await getSecurityEvents()
                setEvents(result)
            } catch {
                setError('Unable to load security events.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadEvents()
    }, [])

    function formatDate(date: string) {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date))
    }

    function severityClass(severity: SecurityEventSeverity) {
        return `admin-security-severity admin-security-severity--${severity.toLowerCase()}`
    }

    function statusClass(status: SecurityEventStatus) {
        return `admin-security-status admin-security-status--${status.toLowerCase()}`
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">
                    Loading security events...
                </p>
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

                    <h1>Security Events</h1>

                    <p>
                        Monitor authentication, account and transaction
                        security activity.
                    </p>
                </div>
            </div>

            <div className="admin-security-events-panel">
                <div className="admin-security-events-table-wrapper">
                    <table className="admin-security-events-table">
                        <thead>
                        <tr>
                            <th>EVENT</th>
                            <th>DESCRIPTION</th>
                            <th>ACTOR</th>
                            <th>SEVERITY</th>
                            <th>STATUS</th>
                            <th>DATE</th>
                        </tr>
                        </thead>

                        <tbody>
                        {events.map((event) => (
                            <tr key={event.id}>
                                <td>
                                    <strong>{event.eventType}</strong>

                                    <span className="admin-security-event-id">
                                            {event.id}
                                        </span>
                                </td>

                                <td>
                                        <span className="admin-security-event-description">
                                            {event.description}
                                        </span>
                                </td>

                                <td>
                                    <strong>{event.actor}</strong>
                                </td>

                                <td>
                                        <span
                                            className={severityClass(
                                                event.severity,
                                            )}
                                        >
                                            {event.severity}
                                        </span>
                                </td>

                                <td>
                                        <span
                                            className={statusClass(
                                                event.status,
                                            )}
                                        >
                                            {event.status}
                                        </span>
                                </td>

                                <td>
                                    {formatDate(event.createdAt)}
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

export default SecurityEventsPage