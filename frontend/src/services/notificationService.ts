import type {
    Notification,
    NotificationManagementResponse,
} from '../types/notification'

const API_BASE_URL = 'http://localhost:8080'

export async function getNotifications(): Promise<Notification[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view notifications.')
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.')
        }
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Unable to load notifications.')
    }

    const data = await response.json()
    return (Array.isArray(data) ? data : []).map((n: any) => ({
        id: String(n.id),
        type: n.type,
        status: n.status,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
        transactionId: n.transactionId,
        paymentId: n.paymentId,
    }))
}

export async function getNotificationById(
    notificationId: string,
): Promise<Notification | null> {
    const notifications = await getNotifications()
    return notifications.find((item) => item.id === notificationId) ?? null
}

export async function markNotificationAsRead(
    notificationId: string,
): Promise<NotificationManagementResponse> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to update notifications.')
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Failed to update notification.')
    }

    const res = await response.json()
    return {
        notificationId: String(res.notificationId || notificationId),
        status: res.status || 'READ',
        action: 'MARK_AS_READ',
    }
}

export async function getUnreadNotificationCount(): Promise<number> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) return 0

    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) return 0
        const data = await response.json()
        return Number(data.unreadCount || 0)
    } catch {
        return 0
    }
}