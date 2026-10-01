import type { MerchantRefund } from '../types/merchantRefund'

const mockMerchantRefunds: MerchantRefund[] = [
    {
        id: 'refund-001',
        reference: 'SP-REF-70001',
        paymentReference: 'SP-PAY-20004',
        customerName: 'Neha Gupta',
        amount: 950,
        currency: 'INR',
        reason: 'Customer requested refund',
        status: 'SUCCESS',
        createdAt: '2026-09-29T15:20:00Z',
    },
    {
        id: 'refund-002',
        reference: 'SP-REF-70002',
        paymentReference: 'SP-PAY-20007',
        customerName: 'Vikram Mehta',
        amount: 3200,
        currency: 'INR',
        reason: 'Duplicate payment',
        status: 'PENDING',
        createdAt: '2026-09-30T08:45:00Z',
    },
    {
        id: 'refund-003',
        reference: 'SP-REF-70003',
        paymentReference: 'SP-PAY-20009',
        customerName: 'Ananya Rao',
        amount: 1500,
        currency: 'INR',
        reason: 'Order cancelled',
        status: 'SUCCESS',
        createdAt: '2026-09-28T12:10:00Z',
    },
    {
        id: 'refund-004',
        reference: 'SP-REF-70004',
        paymentReference: 'SP-PAY-20011',
        customerName: 'Riya Kapoor',
        amount: 4250,
        currency: 'INR',
        reason: 'Payment dispute',
        status: 'FAILED',
        createdAt: '2026-09-27T10:30:00Z',
    },
]

export async function getMerchantRefunds(): Promise<MerchantRefund[]> {
    return Promise.resolve(mockMerchantRefunds)
}