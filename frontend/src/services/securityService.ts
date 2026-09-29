import type {
    SecurityActivity,
    SecurityOverview,
    TrustedDevice,
    TrustedDeviceManagementAction,
    TrustedDeviceManagementResponse,
} from '../types/security'

const mockSecurityOverview: SecurityOverview = {
    status: 'SECURE',
    securityScore: 94,
    mfaStatus: 'ENABLED',
    trustedDeviceCount: 2,
    recentActivityCount: 4,
}

const mockTrustedDevices: TrustedDevice[] = [
    {
        id: 'device-demo-001',
        name: 'Windows PC',
        type: 'Desktop',
        browser: 'Chrome',
        location: 'Pune, India',
        lastActiveAt: '2026-09-29T09:15:00Z',
        status: 'CURRENT',
    },
    {
        id: 'device-demo-002',
        name: 'Android Phone',
        type: 'Mobile',
        browser: 'Chrome Mobile',
        location: 'Pune, India',
        lastActiveAt: '2026-09-28T18:30:00Z',
        status: 'TRUSTED',
    },
]

const mockSecurityActivities: SecurityActivity[] = [
    {
        id: 'security-event-demo-001',
        type: 'LOGIN_SUCCESS',
        status: 'SUCCESS',
        title: 'Successful login',
        description:
            'Your SecurePay account was accessed successfully.',
        createdAt: '2026-09-29T08:45:00Z',
        deviceName: 'Windows PC',
        location: 'Pune, India',
    },
    {
        id: 'security-event-demo-002',
        type: 'NEW_DEVICE',
        status: 'WARNING',
        title: 'New device detected',
        description:
            'A new device was used to access your SecurePay account.',
        createdAt: '2026-09-28T18:30:00Z',
        deviceName: 'Android Phone',
        location: 'Pune, India',
    },
    {
        id: 'security-event-demo-003',
        type: 'MFA_ENABLED',
        status: 'SUCCESS',
        title: 'MFA enabled',
        description:
            'Multi-factor authentication is enabled for your account.',
        createdAt: '2026-09-27T12:15:00Z',
    },
    {
        id: 'security-event-demo-004',
        type: 'PASSWORD_CHANGED',
        status: 'SUCCESS',
        title: 'Password changed',
        description:
            'Your account password was changed successfully.',
        createdAt: '2026-09-25T10:20:00Z',
    },
]

export async function getSecurityOverview(): Promise<SecurityOverview> {
    return Promise.resolve(mockSecurityOverview)
}

export async function getTrustedDevices(): Promise<TrustedDevice[]> {
    return Promise.resolve(mockTrustedDevices)
}

export async function manageTrustedDevice(
    deviceId: string,
    action: TrustedDeviceManagementAction,
): Promise<TrustedDeviceManagementResponse> {
    const device = mockTrustedDevices.find(
        (item) => item.id === deviceId,
    )

    if (!device) {
        throw new Error('Trusted device not found.')
    }

    if (device.status === 'CURRENT') {
        throw new Error(
            'The current device cannot be revoked.',
        )
    }

    if (action === 'REVOKE') {
        device.status = 'REVOKED'
    }

    return Promise.resolve({
        deviceId: device.id,
        status: device.status,
        action,
    })
}

export async function getSecurityActivities(): Promise<SecurityActivity[]> {
    return Promise.resolve(mockSecurityActivities)
}