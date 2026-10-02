
import type { CustomerProfile } from '../types/profile'

type BackendProfile = {
    id: string
    fullName: string
    email: string
    accountType: 'CUSTOMER' | 'MERCHANT'
    memberSince: string
    accountStatus: 'ACTIVE' | 'LOCKED'
}

export async function getCustomerProfile(): Promise<CustomerProfile> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (!token) {
        throw new Error('Please log in to view your profile.')
    }

    const response = await fetch(
        'http://localhost:8080/api/auth/profile',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        },
    )

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.')
        }

        if (response.status === 404) {
            throw new Error(
                'Profile not found in SecurePay database. Please check your registered account.',
            )
        }

        throw new Error('Unable to load profile information from the server.')
    }

    const data: BackendProfile = await response.json()

    return {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        phone: null,
        accountType: data.accountType,
        memberSince: new Date(data.memberSince).toLocaleDateString(
            'en-IN',
            {
                month: 'long',
                year: 'numeric',
            },
        ),
        mfaEnabled: null,
        trustedDevices: null,
        accountStatus: data.accountStatus,
    }
}