import type { AdminUser } from '../types/adminUser'

const API_BASE_URL = 'http://localhost:8080'

export async function getAdminUsers(): Promise<AdminUser[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view users.')
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/security/users`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('Access denied. Administrator privileges required.')
        }
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Unable to load users.')
    }

    const data = await response.json()
    return (Array.isArray(data) ? data : []).map((u: any) => ({
        id: u.id ?? `USR-${u.userId}`,
        name: u.name ?? 'SecurePay User',
        email: u.email,
        role: (u.role ?? 'CUSTOMER') as any,
        accountStatus: (u.accountStatus ?? 'ACTIVE') as any,
        verificationStatus: (u.verificationStatus ?? 'VERIFIED') as any,
        lastLoginAt: u.lastLoginAt ?? u.createdAt,
        createdAt: u.createdAt ?? new Date().toISOString(),
    }))
}

export async function lockUserAccount(userId: string | number): Promise<boolean> {
    const token = sessionStorage.getItem('securepay_access_token')
    const numericId = typeof userId === 'string' ? userId.replace(/\D/g, '') : userId
    if (!token || !numericId) return false

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/security/users/${numericId}/lock`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        return res.ok
    } catch {
        return false
    }
}

export async function unlockUserAccount(userId: string | number): Promise<boolean> {
    const token = sessionStorage.getItem('securepay_access_token')
    const numericId = typeof userId === 'string' ? userId.replace(/\D/g, '') : userId
    if (!token || !numericId) return false

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/security/users/${numericId}/unlock`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        return res.ok
    } catch {
        return false
    }
}