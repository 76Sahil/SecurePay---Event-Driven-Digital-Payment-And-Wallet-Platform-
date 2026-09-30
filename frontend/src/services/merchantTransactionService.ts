import type { MerchantTransaction } from '../types/merchantTransaction'

const mockMerchantTransactions: MerchantTransaction[] = [
    {
        id: 'merchant-txn-001',
        reference: 'SP-TXN-50001',
        customerName: 'Aarav Sharma',
        type: 'PAYMENT',
        amount: 2500,
        currency: 'INR',
        status: 'SUCCESS',
        createdAt: '2026-09-30T09:30:00Z',
    },
    {
        id: 'merchant-txn-002',
        reference: 'SP-TXN-50002',
        customerName: 'Priya Singh',
        type: 'PAYMENT',
        amount: 1800,
        currency: 'INR',
        status: 'SUCCESS',
        createdAt: '2026-09-30T08:45:00Z',
    },
    {
        id: 'merchant-txn-003',
        reference: 'SP-TXN-50003',
        customerName: 'Rahul Verma',
        type: 'PAYMENT',
        amount: 4200,
        currency: 'INR',
        status: 'PENDING',
        createdAt: '2026-09-30T08:10:00Z',
    },
    {
        id: 'merchant-txn-004',
        reference: 'SP-TXN-50004',
        customerName: 'Neha Gupta',
        type: 'REFUND',
        amount: 950,
        currency: 'INR',
        status: 'SUCCESS',
        createdAt: '2026-09-29T16:20:00Z',
    },
    {
        id: 'merchant-txn-005',
        reference: 'SP-TXN-50005',
        customerName: 'Vikram Mehta',
        type: 'PAYMENT',
        amount: 3200,
        currency: 'INR',
        status: 'FAILED',
        createdAt: '2026-09-29T14:40:00Z',
    },
    {
        id: 'merchant-txn-006',
        reference: 'SP-TXN-50006',
        customerName: 'Ananya Rao',
        type: 'PAYOUT',
        amount: 5000,
        currency: 'INR',
        status: 'REVERSED',
        createdAt: '2026-09-29T11:15:00Z',
    },
]

export async function getMerchantTransactions(): Promise<
    MerchantTransaction[]
> {
    return Promise.resolve(mockMerchantTransactions)
}