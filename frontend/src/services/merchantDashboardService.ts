import type { MerchantDashboardSummary } from '../types/merchantDashboard'

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantDashboardSummary(): Promise<MerchantDashboardSummary> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (!token) {
        throw new Error('Please log in to view the merchant dashboard.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/dashboard/summary`, {
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
            throw new Error('Access denied. Merchant credentials required.')
        }
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Unable to load merchant dashboard summary.')
    }

    const data = await response.json()

    return {
        currency: data.currency || 'INR',
        totalRevenue: Number(data.totalRevenue || 0),
        successfulPayments: Number(data.successfulPayments || 0),
        pendingPayments: Number(data.pendingPayments || 0),
        refunds: Number(data.refunds || 0),
        recentPayments: (data.recentPayments || []).map((p: any) => ({
            id: String(p.id),
            reference: String(p.reference),
            customerName: String(p.customerName || 'Customer'),
            amount: Number(p.amount || 0),
            status: String(p.status || 'SUCCESS') as any,
            createdAt: String(p.createdAt || new Date().toISOString()),
        })),
    }
}