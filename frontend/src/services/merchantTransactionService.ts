import type { MerchantTransaction } from '../types/merchantTransaction'
import { getMerchantPayments } from './merchantPaymentService'
import { getMerchantRefunds } from './merchantRefundService'

export async function getMerchantTransactions(): Promise<MerchantTransaction[]> {
    const [payments, refunds] = await Promise.all([
        getMerchantPayments().catch(() => []),
        getMerchantRefunds().catch(() => []),
    ])

    const paymentTxns: MerchantTransaction[] = payments.map((p) => ({
        id: `txn-pay-${p.id}`,
        reference: p.reference,
        customerName: p.customerName,
        type: 'PAYMENT',
        amount: p.amount,
        currency: p.currency,
        status: p.status === 'REFUNDED' ? 'SUCCESS' : p.status,
        createdAt: p.createdAt,
    }))

    const refundTxns: MerchantTransaction[] = refunds.map((r) => ({
        id: `txn-ref-${r.id}`,
        reference: r.reference,
        customerName: r.customerName,
        type: 'REFUND',
        amount: r.amount,
        currency: r.currency,
        status: r.status,
        createdAt: r.createdAt,
    }))

    return [...paymentTxns, ...refundTxns].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
}