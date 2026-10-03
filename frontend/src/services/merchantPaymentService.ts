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

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantPayments(): Promise<MerchantPayment[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        return Promise.resolve(mockMerchantPayments)
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/merchant/payments`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const data = await response.json()
            return data.map((p: any) => ({
                id: String(p.id),
                reference: p.reference,
                customerName: p.customerName,
                customerEmail: p.customerEmail,
                amount: Number(p.amount),
                currency: p.currency,
                method: p.method,
                status: p.status,
                createdAt: p.createdAt,
            }))
        }
    } catch {
        // Fallback to mock data
    }

    return Promise.resolve(mockMerchantPayments)
}

export async function getMerchantPaymentById(
    paymentId: string,
): Promise<MerchantPayment | null> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/merchant/payments/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const p = await response.json()
                return {
                    id: String(p.id),
                    reference: p.reference,
                    customerName: p.customerName,
                    customerEmail: p.customerEmail,
                    amount: Number(p.amount),
                    currency: p.currency,
                    method: p.method,
                    status: p.status,
                    createdAt: p.createdAt,
                }
            }
        } catch {
            // Fallback to mock search
        }
    }

    const payments = await getMerchantPayments()
    return payments.find((payment) => payment.id === paymentId || payment.reference === paymentId) ?? null
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
    if (token) {
        const response = await fetch(`${API_BASE_URL}/api/merchant/payments/collect`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        })

        if (response.ok) {
            const p = await response.json()
            return {
                id: String(p.id),
                reference: p.reference,
                customerName: p.customerName,
                customerEmail: p.customerEmail,
                amount: Number(p.amount),
                currency: p.currency,
                method: p.method,
                status: p.status,
                createdAt: p.createdAt,
            }
        }
    }

    // Mock fallback
    const newPayment: MerchantPayment = {
        id: `merchant-payment-${Date.now()}`,
        reference: `SP-PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        method: (paymentData.method as any) || 'UPI',
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
    }
    mockMerchantPayments.unshift(newPayment)
    return newPayment
}