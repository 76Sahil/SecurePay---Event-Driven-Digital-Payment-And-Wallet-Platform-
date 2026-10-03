
import type { Beneficiary } from '../types/beneficiary'

const API_BASE_URL = 'http://localhost:8080/api/beneficiaries'

function getAuthToken(): string {
    const token = sessionStorage.getItem('securepay_access_token')

    if (!token) {
        throw new Error('Session expired. Please login again.')
    }

    return token
}

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            'Unable to process beneficiary request.',
        )
    }

    return data as T
}

export async function getBeneficiaries(): Promise<Beneficiary[]> {
    const token = getAuthToken()

    const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    return handleResponse<Beneficiary[]>(response)
}

export async function getBeneficiaryById(
    beneficiaryId: string,
): Promise<Beneficiary | null> {
    const token = getAuthToken()

    const response = await fetch(
        `${API_BASE_URL}/${encodeURIComponent(beneficiaryId)}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )

    if (response.status === 404) {
        return null
    }

    return handleResponse<Beneficiary>(response)
}

export async function addBeneficiary(
    name: string,
    bankName: string,
    accountNumber: string,
    recipientEmail?: string,
): Promise<Beneficiary> {
    const token = getAuthToken()

    if (!recipientEmail?.trim()) {
        throw new Error(
            'Recipient email is required for a registered SecurePay customer.',
        )
    }

    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name: name.trim(),
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            recipientEmail: recipientEmail.trim().toLowerCase(),
        }),
    })

    return handleResponse<Beneficiary>(response)
}