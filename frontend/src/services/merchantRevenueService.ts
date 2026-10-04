import type { MerchantRevenueData } from '../types/merchantRevenue'
import { getMerchantPayments } from './merchantPaymentService'
import { getMerchantRefunds } from './merchantRefundService'

export async function getMerchantRevenue(): Promise<MerchantRevenueData> {
    const [payments, refunds] = await Promise.all([
        getMerchantPayments().catch(() => []),
        getMerchantRefunds().catch(() => []),
    ])

    const successfulPayments = payments.filter(
        (p) => p.status === 'SUCCESS' || p.status === 'REFUNDED',
    )
    const pendingPayments = payments.filter((p) => p.status === 'PENDING')

    const totalRevenue = successfulPayments.reduce(
        (acc, p) => acc + p.amount,
        0,
    )
    const totalRefunds = refunds
        .filter((r) => r.status === 'SUCCESS')
        .reduce((acc, r) => acc + r.amount, 0)

    const netRevenue = totalRevenue - totalRefunds

    const paymentActivity = payments
        .filter((p) => p.status !== 'FAILED')
        .map((p) => ({
            id: `rev-pay-${p.id}`,
            reference: p.reference,
            type: 'PAYMENT' as const,
            amount: p.amount,
            currency: p.currency,
            status: (p.status === 'PENDING' ? 'PENDING' : 'SUCCESS') as 'SUCCESS' | 'PENDING',
            createdAt: p.createdAt,
        }))

    const refundActivity = refunds
        .filter((r) => r.status !== 'FAILED')
        .map((r) => ({
            id: `rev-ref-${r.id}`,
            reference: r.reference,
            type: 'REFUND' as const,
            amount: r.amount,
            currency: r.currency,
            status: (r.status === 'PENDING' ? 'PENDING' : 'SUCCESS') as 'SUCCESS' | 'PENDING',
            createdAt: r.createdAt,
        }))

    const recentActivity = [...paymentActivity, ...refundActivity].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    return {
        period: 'THIS_MONTH',
        summary: {
            currency: payments[0]?.currency || refunds[0]?.currency || 'INR',
            totalRevenue,
            successfulPayments: successfulPayments.length,
            pendingPayments: pendingPayments.length,
            refunds: totalRefunds,
            netRevenue,
        },
        recentActivity,
    }
}