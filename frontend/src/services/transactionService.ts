import type { Transaction } from '../types/transaction'

const mockTransactions: Transaction[] = [
    {
        id: 'txn-demo-001',
        reference: 'SP-TXN-10001',
        type: 'TOP_UP',
        direction: 'CREDIT',
        amount: 5000,
        currency: 'INR',
        status: 'SUCCESS',
        description: 'Wallet top-up',
        paymentId: 'payment-demo-001',
        createdAt: '2026-09-28T10:30:00Z',
    },
    {
        id: 'txn-demo-002',
        reference: 'SP-TXN-10002',
        type: 'TRANSFER',
        direction: 'DEBIT',
        amount: 1200,
        currency: 'INR',
        status: 'SUCCESS',
        description: 'Transfer to Rahul Sharma',
        beneficiaryId: 'beneficiary-demo-001',
        beneficiaryName: 'Rahul Sharma',
        createdAt: '2026-09-27T16:15:00Z',
    },
    {
        id: 'txn-demo-003',
        reference: 'SP-TXN-10003',
        type: 'TRANSFER',
        direction: 'DEBIT',
        amount: 500,
        currency: 'INR',
        status: 'PENDING',
        description: 'Transfer to Priya Singh',
        beneficiaryId: 'beneficiary-demo-002',
        beneficiaryName: 'Priya Singh',
        createdAt: '2026-09-27T12:45:00Z',
    },
]

export async function getTransactions(): Promise<Transaction[]> {
    return Promise.resolve(mockTransactions)
}