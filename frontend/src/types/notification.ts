export type NotificationType =
    | 'TRANSACTION'
    | 'PAYMENT'
    | 'SECURITY'
    | 'SYSTEM'

export type NotificationStatus =
    | 'UNREAD'
    | 'READ'

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