import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Notification } from '../types/notification'
import {
    getNotifications,
    markNotificationAsRead,
} from '../services/notificationService'

function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [markingAsReadId, setMarkingAsReadId] = useState<string | null>(
        null,
    )
    const [managementError, setManagementError] =
        useState<string | null>(null)

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

    const handleMarkAsRead = async (
        notificationId: string,
    ) => {
        try {
            setMarkingAsReadId(notificationId)
            setManagementError(null)

            const response = await markNotificationAsRead(
                notificationId,
            )

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === response.notificationId
                        ? {
                            ...notification,
                            status: response.status,
                        }
                        : notification,
                ),
            )
        } catch {
            setManagementError(
                'Unable to mark the notification as read.',
            )
        } finally {
            setMarkingAsReadId(null)
        }
    }

    const renderNotification = (
        notification: Notification,
    ) => {
        const notificationContent = (
            <>
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
            </>
        )

        const notificationActions = (
            <>
                {notification.status === 'UNREAD' && (
                    <button
                        type="button"
                        className="notification-mark-read"
                        onClick={() => {
                            void handleMarkAsRead(
                                notification.id,
                            )
                        }}
                        disabled={
                            markingAsReadId === notification.id
                        }
                    >
                        {markingAsReadId === notification.id
                            ? 'Marking...'
                            : 'Mark as read'}
                    </button>
                )}

                <span
                    className={getStatusClass(
                        notification.status,
                    )}
                >
                    {notification.status}
                </span>
            </>
        )

        const notificationMain = (
            <div
                className={`notification-item ${
                    notification.status === 'UNREAD'
                        ? 'notification-item-unread'
                        : ''
                }`}
            >
                <div className="notification-item-main">
                    {notification.transactionId ? (
                        <Link
                            to={`/customer/transactions/${notification.transactionId}`}
                            className="notification-content-link"
                        >
                            {notificationContent}
                        </Link>
                    ) : (
                        notificationContent
                    )}
                </div>

                <div className="notification-actions">
                    {notificationActions}
                </div>
            </div>
        )

        return (
            <div key={notification.id}>
                {notificationMain}
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

            {!isLoading && managementError && (
                <div className="notifications-card notifications-error">
                    <p>{managementError}</p>
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