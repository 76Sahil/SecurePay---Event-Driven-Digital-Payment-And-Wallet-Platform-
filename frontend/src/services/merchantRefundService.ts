import type { MerchantRefund } from '../types/merchantRefund'

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantRefunds(): Promise<MerchantRefund[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view merchant refunds.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/refunds`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.')
        }
        if (response.status === 403) {
            throw new Error('Access denied. Merchant role required.')
        }
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Unable to load merchant refunds.')
    }

    const data = await response.json()
    return data.map((r: any) => ({
        id: String(r.id),
        reference: String(r.reference),
        paymentReference: String(r.paymentReference),
        customerName: String(r.customerName || 'Customer'),
        amount: Number(r.amount || 0),
        currency: String(r.currency || 'INR'),
        reason: String(r.reason || 'Requested by merchant'),
        status: String(r.status || 'SUCCESS') as any,
        createdAt: String(r.createdAt || new Date().toISOString()),
    }))
}

export async function processRefund(refundData: {
    paymentReference: string
    amount: number
    reason: string
}): Promise<MerchantRefund> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to process a refund.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/refunds`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Refund processing failed.')
    }

    const r = await response.json()
    return {
        id: String(r.id),
        reference: String(r.reference),
        paymentReference: String(r.paymentReference),
        customerName: String(r.customerName || 'Customer'),
        amount: Number(r.amount || refundData.amount),
        currency: String(r.currency || 'INR'),
        reason: String(r.reason || refundData.reason),
        status: String(r.status || 'SUCCESS') as any,
        createdAt: String(r.createdAt || new Date().toISOString()),
    }
}