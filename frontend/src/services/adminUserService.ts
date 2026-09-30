import type { AdminUser } from '../types/adminUser'

const mockAdminUsers: AdminUser[] = [
    {
        id: 'CUS-10001',
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        role: 'CUSTOMER',
        accountStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        lastLoginAt: '2026-09-30T08:45:00Z',
        createdAt: '2026-09-05T10:30:00Z',
    },
    {
        id: 'CUS-10002',
        name: 'Priya Singh',
        email: 'priya@example.com',
        role: 'CUSTOMER',
        accountStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        lastLoginAt: '2026-09-29T16:20:00Z',
        createdAt: '2026-09-08T09:15:00Z',
    },
    {
        id: 'CUS-10003',
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        role: 'CUSTOMER',
        accountStatus: 'LOCKED',
        verificationStatus: 'VERIFIED',
        lastLoginAt: '2026-09-30T07:10:00Z',
        createdAt: '2026-09-10T11:45:00Z',
    },
    {
        id: 'MER-10001',
        name: 'SecurePay Demo Store',
        email: 'merchant@securepay.com',
        role: 'MERCHANT',
        accountStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        lastLoginAt: '2026-09-30T09:20:00Z',
        createdAt: '2026-09-15T10:30:00Z',
    },
    {
        id: 'MER-10002',
        name: 'Urban Retail Solutions',
        email: 'urban@example.com',
        role: 'MERCHANT',
        accountStatus: 'SUSPENDED',
        verificationStatus: 'PENDING',
        lastLoginAt: '2026-09-27T13:40:00Z',
        createdAt: '2026-09-18T14:10:00Z',
    },
    {
        id: 'ADM-10001',
        name: 'SecurePay Administrator',
        email: 'admin@securepay.com',
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        verificationStatus: 'NOT_REQUIRED',
        lastLoginAt: '2026-09-30T09:45:00Z',
        createdAt: '2026-08-01T08:00:00Z',
    },
]

export async function getAdminUsers(): Promise<AdminUser[]> {
    return Promise.resolve(mockAdminUsers)
}