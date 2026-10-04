import type { MerchantProfile } from '../types/merchantProfile'

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantProfile(): Promise<MerchantProfile> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view merchant profile.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/profile`, {
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
        throw new Error(errorBody?.message || 'Unable to load merchant profile.')
    }

    return await response.json()
}