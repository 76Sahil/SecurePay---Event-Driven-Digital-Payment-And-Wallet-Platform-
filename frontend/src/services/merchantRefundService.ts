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

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantRefunds(): Promise<MerchantRefund[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        return Promise.resolve(mockMerchantRefunds)
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/merchant/refunds`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const data = await response.json()
            return data.map((r: any) => ({
                id: String(r.id),
                reference: r.reference,
                paymentReference: r.paymentReference,
                customerName: r.customerName,
                amount: Number(r.amount),
                currency: r.currency,
                reason: r.reason,
                status: r.status,
                createdAt: r.createdAt,
            }))
        }
    } catch {
        // Fallback to mock data
    }

    return Promise.resolve(mockMerchantRefunds)
}

export async function createMerchantRefund(refundData: {
    paymentReference: string
    amount: number
    reason: string
}): Promise<MerchantRefund> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (token) {
        const response = await fetch(`${API_BASE_URL}/api/merchant/refunds`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(refundData),
        })

        if (response.ok) {
            const r = await response.json()
            return {
                id: String(r.id),
                reference: r.reference,
                paymentReference: r.paymentReference,
                customerName: r.customerName,
                amount: Number(r.amount),
                currency: r.currency,
                reason: r.reason,
                status: r.status,
                createdAt: r.createdAt,
            }
        }
    }

    // Mock fallback
    const newRefund: MerchantRefund = {
        id: `refund-${Date.now()}`,
        reference: `SP-REF-${Math.floor(70000 + Math.random() * 20000)}`,
        paymentReference: refundData.paymentReference,
        customerName: 'Customer',
        amount: refundData.amount,
        currency: 'INR',
        reason: refundData.reason,
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
    }
    mockMerchantRefunds.unshift(newRefund)
    return newRefund
}