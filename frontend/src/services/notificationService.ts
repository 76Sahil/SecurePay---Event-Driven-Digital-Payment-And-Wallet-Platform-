import type {
    Notification,
    NotificationManagementResponse,
} from '../types/notification'

const mockNotifications: Notification[] = [
    {
        id: 'notification-demo-001',
        type: 'SECURITY',
        status: 'UNREAD',
        title: 'New login detected',
        message:
            'A new login to your SecurePay account was detected.',
        createdAt: '2026-09-29T08:45:00Z',
    },
    {
        id: 'notification-demo-002',
        type: 'TRANSACTION',
        status: 'UNREAD',
        title: 'Transfer completed',
        message:
            'Your transfer to Rahul Sharma was completed successfully.',
        createdAt: '2026-09-28T16:20:00Z',
        transactionId: 'txn-demo-002',
    },
    {
        id: 'notification-demo-003',
        type: 'PAYMENT',
        status: 'READ',
        title: 'Wallet top-up successful',
        message:
            'Your wallet top-up of ₹5,000 was completed successfully.',
        createdAt: '2026-09-28T10:35:00Z',
        paymentId: 'payment-demo-001',
    },
    {
        id: 'notification-demo-004',
        type: 'SECURITY',
        status: 'READ',
        title: 'Card blocked',
        message:
            'Your SecurePay card ending in 1937 is currently blocked.',
        createdAt: '2026-09-27T14:10:00Z',
    },
    {
        id: 'notification-demo-005',
        type: 'SYSTEM',
        status: 'READ',
        title: 'SecurePay security update',
        message:
            'Security improvements have been applied to your account.',
        createdAt: '2026-09-26T09:00:00Z',
    },
]

const API_BASE_URL = 'http://localhost:8080'

export async function getNotifications(): Promise<Notification[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        return Promise.resolve(mockNotifications)
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const data = await response.json()
            return data.map((n: any) => ({
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
    } catch {
        // Fallback to mock notifications
    }

    return Promise.resolve(mockNotifications)
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
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const res = await response.json()
                return {
                    notificationId: String(res.notificationId),
                    status: res.status,
                    action: 'MARK_AS_READ',
                }
            }
        } catch {
            // Fallback to mock update
        }
    }

    const notification = mockNotifications.find(
        (item) => item.id === notificationId,
    )

    if (notification) {
        notification.status = 'READ'
    }

    return Promise.resolve({
        notificationId: notificationId,
        status: 'READ',
        action: 'MARK_AS_READ',
    })
}