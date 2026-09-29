import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Notification } from '../types/notification'
import { getNotifications } from '../services/notificationService'

function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadNotifications() {
            try {
                setIsLoading(true)
                setError(null)

                const data = await getNotifications()
                setNotifications(data)
            } catch {
                setError('Unable to load notifications.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadNotifications()
    }, [])

    const unreadNotifications = notifications.filter(
        (notification) => notification.status === 'UNREAD',
    )

    const readNotifications = notifications.filter(
        (notification) => notification.status === 'READ',
    )

    const getTypeClass = (
        type: Notification['type'],
    ) => {
        return `notification-type notification-type-${type.toLowerCase()}`
    }

    const getStatusClass = (
        status: Notification['status'],
    ) => {
        return `notification-status notification-status-${status.toLowerCase()}`
    }

    const formatDate = (createdAt: string) => {
        return new Date(createdAt).toLocaleString()
    }

    const renderNotification = (
        notification: Notification,
    ) => {
        const content = (
            <div
                className={`notification-item ${
                    notification.status === 'UNREAD'
                        ? 'notification-item-unread'
                        : ''
                }`}
            >
                <div className="notification-item-main">
                    <div className="notification-icon">
                        {notification.type.charAt(0)}
                    </div>

                    <div className="notification-content">
                        <div className="notification-title-row">
                            <h3>{notification.title}</h3>

                            <span
                                className={getTypeClass(
                                    notification.type,
                                )}
                            >
                                {notification.type}
                            </span>
                        </div>

                        <p>{notification.message}</p>

                        <span className="notification-date">
                            {formatDate(notification.createdAt)}
                        </span>
                    </div>
                </div>

                <span
                    className={getStatusClass(
                        notification.status,
                    )}
                >
                    {notification.status}
                </span>
            </div>
        )

        if (notification.transactionId) {
            return (
                <Link
                    key={notification.id}
                    to={`/customer/transactions/${notification.transactionId}`}
                    className="notification-item-link"
                >
                    {content}
                </Link>
            )
        }

        return (
            <div key={notification.id}>
                {content}
            </div>
        )
    }

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <div>
                    <h1>Notifications</h1>

                    <p>
                        Stay updated with your account,
                        payments, transactions, and security
                        activity.
                    </p>
                </div>

                <div className="notifications-summary">
                    <span>
                        {unreadNotifications.length} unread
                    </span>
                </div>
            </div>

            {isLoading && (
                <div className="notifications-card notifications-state">
                    <p>Loading notifications...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="notifications-card notifications-state notifications-error">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading &&
                !error &&
                notifications.length === 0 && (
                    <div className="notifications-card notifications-state">
                        <p>No notifications available.</p>
                    </div>
                )}

            {!isLoading &&
                !error &&
                notifications.length > 0 && (
                    <>
                        {unreadNotifications.length > 0 && (
                            <section>
                                <div className="notifications-section-header">
                                    <div>
                                        <h2>Unread</h2>

                                        <p>
                                            Notifications that
                                            need your attention.
                                        </p>
                                    </div>

                                    <span className="notification-count">
                                        {unreadNotifications.length}
                                    </span>
                                </div>

                                <div className="notifications-list">
                                    {unreadNotifications.map(
                                        renderNotification,
                                    )}
                                </div>
                            </section>
                        )}

                        {readNotifications.length > 0 && (
                            <section>
                                <div className="notifications-section-header">
                                    <div>
                                        <h2>Earlier</h2>

                                        <p>
                                            Previously viewed
                                            notifications.
                                        </p>
                                    </div>

                                    <span className="notification-count">
                                        {readNotifications.length}
                                    </span>
                                </div>

                                <div className="notifications-list">
                                    {readNotifications.map(
                                        renderNotification,
                                    )}
                                </div>
                            </section>
                        )}
                    </>
                )}
        </div>
    )
}

export default NotificationsPage