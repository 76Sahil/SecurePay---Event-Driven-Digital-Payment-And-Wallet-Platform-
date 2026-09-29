import type { MerchantDashboardSummary } from '../types/merchantDashboard'

const mockMerchantDashboard: MerchantDashboardSummary = {
    currency: 'INR',
    totalRevenue: 125000,
    successfulPayments: 128,
    pendingPayments: 4,
    refunds: 3200,

    recentPayments: [
        {
            id: 'payment-demo-001',
            reference: 'SP-PAY-20001',
            customerName: 'Aarav Sharma',
            amount: 2500,
            status: 'SUCCESS',
            createdAt: '2026-09-29T14:30:00Z',
        },
        {
            id: 'payment-demo-002',
            reference: 'SP-PAY-20002',
            customerName: 'Priya Singh',
            amount: 1800,
            status: 'SUCCESS',
            createdAt: '2026-09-29T13:15:00Z',
        },
        {
            id: 'payment-demo-003',
            reference: 'SP-PAY-20003',
            customerName: 'Rahul Verma',
            amount: 4200,
            status: 'PENDING',
            createdAt: '2026-09-29T12:40:00Z',
        },
        {
            id: 'payment-demo-004',
            reference: 'SP-PAY-20004',
            customerName: 'Neha Gupta',
            amount: 950,
            status: 'SUCCESS',
            createdAt: '2026-09-29T11:20:00Z',
        },
    ],
}

export async function getMerchantDashboardSummary(): Promise<MerchantDashboardSummary> {
    return Promise.resolve(mockMerchantDashboard)
}