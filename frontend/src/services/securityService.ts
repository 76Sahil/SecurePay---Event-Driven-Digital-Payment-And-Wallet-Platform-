import type {
    SecurityActivity,
    SecurityOverview,
    TrustedDevice,
    TrustedDeviceManagementAction,
    TrustedDeviceManagementResponse,
} from '../types/security'

export async function getSecurityOverview(): Promise<SecurityOverview> {
    return Promise.resolve({
        status: 'SECURE',
        securityScore: 0,
        mfaStatus: 'DISABLED',
        trustedDeviceCount: 0,
        recentActivityCount: 0,
    })
}

export async function getTrustedDevices(): Promise<TrustedDevice[]> {
    return Promise.resolve([])
}

export async function getSecurityActivities(): Promise<SecurityActivity[]> {
    return Promise.resolve([])
}

export async function manageTrustedDevice(
    deviceId: string,
    action: TrustedDeviceManagementAction,
): Promise<TrustedDeviceManagementResponse> {
    return Promise.resolve({
        deviceId,
        status: 'REVOKED',
        action,
    })
}