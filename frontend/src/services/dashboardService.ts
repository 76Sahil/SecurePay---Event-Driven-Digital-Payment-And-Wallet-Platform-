import type { CustomerDashboardSummary } from '../types'

const mockDashboardSummary: CustomerDashboardSummary = {
    wallet: {
        id: 'wallet-demo-001',
        userId: 'user-demo-001',
        balance: 25000,
        currency: 'INR',
        status: 'ACTIVE',
    },

    recentTransactions: [
        {
            id: 'txn-demo-001',
            reference: 'SP-TXN-10001',
            type: 'TOP_UP',
            direction: 'CREDIT',
            amount: 5000,
            currency: 'INR',
            status: 'SUCCESS',
            createdAt: '2026-09-28T10:30:00Z',
            description: 'Wallet top-up',
            paymentId: 'payment-demo-001',
        },

        {
            id: 'txn-demo-002',
            reference: 'SP-TXN-10002',
            type: 'TRANSFER',
            direction: 'DEBIT',
            amount: 1200,
            currency: 'INR',
            status: 'SUCCESS',
            createdAt: '2026-09-27T16:15:00Z',
            description: 'Money transfer',
            beneficiaryId: 'beneficiary-demo-001',
            beneficiaryName: 'Rahul Sharma',
        },

        {
            id: 'txn-demo-003',
            reference: 'SP-TXN-10003',
            type: 'TRANSFER',
            direction: 'DEBIT',
            amount: 500,
            currency: 'INR',
            status: 'PENDING',
            createdAt: '2026-09-27T12:45:00Z',
            description: 'Money transfer',
            beneficiaryId: 'beneficiary-demo-002',
            beneficiaryName: 'Priya Singh',
        },
    ],
}

export async function getCustomerDashboardSummary(): Promise<CustomerDashboardSummary> {
    return Promise.resolve(mockDashboardSummary)
}