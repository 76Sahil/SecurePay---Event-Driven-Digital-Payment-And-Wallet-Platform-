export type NotificationType =
    | 'TRANSACTION'
    | 'PAYMENT'
    | 'SECURITY'
    | 'SYSTEM'

export type NotificationStatus =
    | 'UNREAD'
    | 'READ'

export type NotificationManagementAction =
    | 'MARK_AS_READ'

export type NotificationManagementResponse = {
    notificationId: string
    status: NotificationStatus
    action: NotificationManagementAction
}

export type Notification = {
    id: string
    type: NotificationType
    status: NotificationStatus
    title: string
    message: string
    createdAt: string
    transactionId?: string
    paymentId?: string
}