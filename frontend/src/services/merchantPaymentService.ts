import type { MerchantPayment } from '../types/merchantPayment'

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantPayments(): Promise<MerchantPayment[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view merchant payments.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/payments`, {
        method: 'GET',
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
        throw new Error(errorBody?.message || 'Unable to load merchant payments.')
    }

    const data = await response.json()
    return data.map((p: any) => ({
        id: String(p.id),
        reference: String(p.reference),
        customerName: String(p.customerName || 'Customer'),
        customerEmail: String(p.customerEmail || ''),
        amount: Number(p.amount || 0),
        currency: String(p.currency || 'INR'),
        method: String(p.method || 'UPI') as any,
        status: String(p.status || 'SUCCESS') as any,
        createdAt: String(p.createdAt || new Date().toISOString()),
    }))
}

export async function getMerchantPaymentById(
    paymentId: string,
): Promise<MerchantPayment | null> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view payment details.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/payments/${paymentId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        if (response.status === 404) {
            return null
        }
        throw new Error('Unable to retrieve payment details.')
    }

    const p = await response.json()
    return {
        id: String(p.id),
        reference: String(p.reference),
        customerName: String(p.customerName || 'Customer'),
        customerEmail: String(p.customerEmail || ''),
        amount: Number(p.amount || 0),
        currency: String(p.currency || 'INR'),
        method: String(p.method || 'UPI') as any,
        status: String(p.status || 'SUCCESS') as any,
        createdAt: String(p.createdAt || new Date().toISOString()),
    }
}

export async function collectMerchantPayment(paymentData: {
    amount: number
    currency?: string
    customerName: string
    customerEmail: string
    method?: string
    description?: string
}): Promise<MerchantPayment> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to initiate payment collection.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/payments/collect`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Payment collection failed.')
    }

    const p = await response.json()
    return {
        id: String(p.id),
        reference: String(p.reference),
        customerName: String(p.customerName || paymentData.customerName),
        customerEmail: String(p.customerEmail || paymentData.customerEmail),
        amount: Number(p.amount || paymentData.amount),
        currency: String(p.currency || paymentData.currency || 'INR'),
        method: String(p.method || paymentData.method || 'UPI') as any,
        status: String(p.status || 'SUCCESS') as any,
        createdAt: String(p.createdAt || new Date().toISOString()),
    }
}