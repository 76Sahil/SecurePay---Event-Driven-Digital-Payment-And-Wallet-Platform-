import type { MerchantPayment } from '../types/merchantPayment'

const mockMerchantPayments: MerchantPayment[] = [
    {
        id: 'merchant-payment-001',
        reference: 'SP-PAY-20001',
        customerName: 'Aarav Sharma',
        customerEmail: 'aarav@example.com',
        amount: 2500,
        currency: 'INR',
        method: 'UPI',
        status: 'SUCCESS',
        createdAt: '2026-09-29T14:30:00Z',
    },
    {
        id: 'merchant-payment-002',
        reference: 'SP-PAY-20002',
        customerName: 'Priya Singh',
        customerEmail: 'priya@example.com',
        amount: 1800,
        currency: 'INR',
        method: 'CARD',
        status: 'SUCCESS',
        createdAt: '2026-09-29T13:15:00Z',
    },
    {
        id: 'merchant-payment-003',
        reference: 'SP-PAY-20003',
        customerName: 'Rahul Verma',
        customerEmail: 'rahul@example.com',
        amount: 4200,
        currency: 'INR',
        method: 'NET_BANKING',
        status: 'PENDING',
        createdAt: '2026-09-29T12:40:00Z',
    },
    {
        id: 'merchant-payment-004',
        reference: 'SP-PAY-20004',
        customerName: 'Neha Gupta',
        customerEmail: 'neha@example.com',
        amount: 950,
        currency: 'INR',
        method: 'WALLET',
        status: 'SUCCESS',
        createdAt: '2026-09-29T11:20:00Z',
    },
    {
        id: 'merchant-payment-005',
        reference: 'SP-PAY-20005',
        customerName: 'Vikram Mehta',
        customerEmail: 'vikram@example.com',
        amount: 3200,
        currency: 'INR',
        method: 'UPI',
        status: 'FAILED',
        createdAt: '2026-09-28T16:10:00Z',
    },
]

export async function getMerchantPayments(): Promise<MerchantPayment[]> {
    return Promise.resolve(mockMerchantPayments)
}