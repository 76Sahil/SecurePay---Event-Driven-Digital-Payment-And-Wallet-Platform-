import type { MerchantRevenueData } from '../types/merchantRevenue'

const mockMerchantRevenue: MerchantRevenueData = {
    period: 'THIS_MONTH',

    summary: {
        currency: 'INR',
        totalRevenue: 125000,
        successfulPayments: 128,
        pendingPayments: 4,
        refunds: 3200,
        netRevenue: 121800,
    },

    recentActivity: [
        {
            id: 'revenue-001',
            reference: 'SP-PAY-20001',
            type: 'PAYMENT',
            amount: 2500,
            currency: 'INR',
            status: 'SUCCESS',
            createdAt: '2026-09-30T09:20:00Z',
        },
        {
            id: 'revenue-002',
            reference: 'SP-PAY-20002',
            type: 'PAYMENT',
            amount: 1800,
            currency: 'INR',
            status: 'SUCCESS',
            createdAt: '2026-09-29T16:10:00Z',
        },
        {
            id: 'revenue-003',
            reference: 'SP-PAY-20003',
            type: 'PAYMENT',
            amount: 4200,
            currency: 'INR',
            status: 'PENDING',
            createdAt: '2026-09-29T14:30:00Z',
        },
        {
            id: 'revenue-004',
            reference: 'SP-REF-70001',
            type: 'REFUND',
            amount: 950,
            currency: 'INR',
            status: 'SUCCESS',
            createdAt: '2026-09-29T12:15:00Z',
        },
        {
            id: 'revenue-005',
            reference: 'SP-PAY-20004',
            type: 'PAYMENT',
            amount: 3200,
            currency: 'INR',
            status: 'SUCCESS',
            createdAt: '2026-09-28T11:40:00Z',
        },
    ],
}

export async function getMerchantRevenue(): Promise<MerchantRevenueData> {
    return Promise.resolve(mockMerchantRevenue)
}