import { useEffect, useState, useCallback, useMemo } from 'react'
import type { Notification } from '../types/notification'
import {
    getNotifications,
    markNotificationAsRead,
} from '../services/notificationService'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL')
    const [markingAsReadId, setMarkingAsReadId] = useState<string | null>(null)
    const [managementError, setManagementError] = useState<string | null>(null)

    const loadNotifications = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await getNotifications()
            setNotifications(data)
        } catch (err) {
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : 'Unable to load notifications. Please try again.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadNotifications()
    }, [loadNotifications])

    const filteredNotifications = useMemo(() => {
        if (filter === 'UNREAD') return notifications.filter((n) => n.status === 'UNREAD')
        if (filter === 'READ') return notifications.filter((n) => n.status === 'READ')
        return notifications
    }, [notifications, filter])

    const unreadCount = useMemo(
        () => notifications.filter((n) => n.status === 'UNREAD').length,
        [notifications],
    )

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            setMarkingAsReadId(notificationId)
            setManagementError(null)
            const response = await markNotificationAsRead(notificationId)

            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === response.notificationId
                        ? { ...item, status: response.status }
                        : item,
                ),
            )
        } catch {
            setManagementError('Unable to update notification status.')
        } finally {
            setMarkingAsReadId(null)
        }
    }

    if (isLoading) {
        return (
            <section className="sp-page">
                <LoadingState message="Loading your notifications..." />
            </section>
        )
    }

    if (error) {
        return (
            <section className="sp-page">
                <ErrorState
                    title="Could Not Load Notifications"
                    message={error}
                    onRetry={() => void loadNotifications()}
                />
            </section>
        )
    }

    const getIconForType = (type: Notification['type']) => {
        switch (type) {
            case 'SECURITY':
                return '🛡️'
            case 'TRANSACTION':
                return '💸'
            case 'PAYMENT':
                return '💳'
            default:
                return '🔔'
        }
    }

    return (
        <div className="sp-page notifications-view">
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">Alerts & Messages</span>
                    <h1 className="sp-page-title">Notifications</h1>
                    <p className="sp-page-subtitle">
                        Stay updated on payment confirmations, transfers, and security alerts.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <div className="sp-header-actions">
                        <span className="sp-badge sp-badge-warning">
                            {unreadCount} Unread
                        </span>
                    </div>
                )}
            </header>

            {managementError && (
                <div className="sp-alert sp-alert-error" role="alert">
                    {managementError}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="sp-toolbar">
                <div className="sp-filter-tabs">
                    <button
                        type="button"
                        className={`sp-tab-btn ${filter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilter('ALL')}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        type="button"
                        className={`sp-tab-btn ${filter === 'UNREAD' ? 'active' : ''}`}
                        onClick={() => setFilter('UNREAD')}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        type="button"
                        className={`sp-tab-btn ${filter === 'READ' ? 'active' : ''}`}
                        onClick={() => setFilter('READ')}
                    >
                        Read ({notifications.length - unreadCount})
                    </button>
                </div>
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="sp-card">
                    <EmptyState
                        icon="🔔"
                        title={filter === 'UNREAD' ? "You're all caught up!" : 'No notifications'}
                        description={
                            filter === 'UNREAD'
                                ? 'No unread notifications to review at this moment.'
                                : 'You currently have no recorded notifications.'
                        }
                    />
                </div>
            ) : (
                <div className="sp-notification-list">
                    {filteredNotifications.map((n) => {
                        const isUnread = n.status === 'UNREAD'
                        const formattedDate = new Date(n.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })

                        return (
                            <article
                                key={n.id}
                                className={`sp-card sp-notification-item ${isUnread ? 'sp-notification-item--unread' : ''}`}
                            >
                                <div className="sp-notification-item__icon">
                                    {getIconForType(n.type)}
                                </div>
                                <div className="sp-notification-item__body">
                                    <div className="sp-notification-item__top">
                                        <div className="sp-notification-item__title-group">
                                            <h3 className="sp-notification-item__title">{n.title}</h3>
                                            <span className="sp-badge sp-badge-neutral sp-badge-xs">
                                                {n.type}
                                            </span>
                                        </div>
                                        <span className="sp-notification-item__time">{formattedDate}</span>
                                    </div>
                                    <p className="sp-notification-item__desc">{n.message}</p>
                                    <div className="sp-notification-item__footer">
                                        {isUnread && (
                                            <button
                                                type="button"
                                                className="sp-btn sp-btn-ghost sp-btn-sm"
                                                onClick={() => void handleMarkAsRead(n.id)}
                                                disabled={markingAsReadId === n.id}
                                            >
                                                {markingAsReadId === n.id ? 'Marking...' : 'Mark as Read'}
                                            </button>
                                        )}
                                        {n.status === 'READ' && (
                                            <span className="sp-text-muted sp-text-sm">Read</span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default NotificationsPage