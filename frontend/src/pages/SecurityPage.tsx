import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type {
    SecurityActivity,
    SecurityOverview,
    TrustedDevice,
} from '../types/security'
import {
    getSecurityActivities,
    getSecurityOverview,
    getTrustedDevices,
    manageTrustedDevice,
} from '../services/securityService'

function SecurityPage() {
    const [overview, setOverview] =
        useState<SecurityOverview | null>(null)

    const [devices, setDevices] = useState<TrustedDevice[]>([])

    const [activities, setActivities] =
        useState<SecurityActivity[]>([])

    const [revokingDeviceId, setRevokingDeviceId] =
        useState<string | null>(null)

    const [deviceManagementError, setDeviceManagementError] =
        useState<string | null>(null)

    const [isLoading, setIsLoading] = useState(true)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadSecurityData() {
            try {
                setIsLoading(true)
                setError(null)

                const [
                    overviewData,
                    devicesData,
                    activitiesData,
                ] = await Promise.all([
                    getSecurityOverview(),
                    getTrustedDevices(),
                    getSecurityActivities(),
                ])

                setOverview(overviewData)
                setDevices(devicesData)
                setActivities(activitiesData)
            } catch {
                setError('Unable to load security information.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadSecurityData()
    }, [])

    const handleRevokeDevice = async (
        deviceId: string,
    ) => {
        const confirmed = window.confirm(
            'Are you sure you want to revoke this trusted device?',
        )

        if (!confirmed) {
            return
        }

        try {
            setRevokingDeviceId(deviceId)
            setDeviceManagementError(null)

            const response = await manageTrustedDevice(
                deviceId,
                'REVOKE',
            )

            setDevices((currentDevices) =>
                currentDevices.map((device) =>
                    device.id === response.deviceId
                        ? {
                            ...device,
                            status: response.status,
                        }
                        : device,
                ),
            )
        } catch (error) {
            setDeviceManagementError(
                error instanceof Error
                    ? error.message
                    : 'Unable to revoke the trusted device.',
            )
        } finally {
            setRevokingDeviceId(null)
        }
    }

    const formatDate = (createdAt: string) => {
        return new Date(createdAt).toLocaleString()
    }

    const getActivityStatusClass = (
        status: SecurityActivity['status'],
    ) => {
        return `security-activity-status security-activity-status-${status.toLowerCase()}`
    }

    const getDeviceStatusClass = (
        status: TrustedDevice['status'],
    ) => {
        return `security-device-status security-device-status-${status.toLowerCase()}`
    }

    return (
        <div className="security-page">
            <div className="security-header">
                <div>
                    <h1>Security</h1>

                    <p>
                        Manage your account security and
                        monitor recent security activity.
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="security-card security-state">
                    <p>Loading security information...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="security-card security-state security-error">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && deviceManagementError && (
                <div className="security-card security-state security-error">
                    <p>{deviceManagementError}</p>
                </div>
            )}

            {!isLoading && !error && overview && (
                <>
                    <section className="security-overview-grid">
                        <div className="security-card security-score-card">
                            <span className="security-card-label">
                                Security Status
                            </span>

                            <div className="security-score">
                                <strong>
                                    {overview.securityScore}
                                </strong>

                                <span>/ 100</span>
                            </div>

                            <span
                                className={`security-status-badge security-status-${overview.status.toLowerCase()}`}
                            >
                                {overview.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="security-card">
                            <span className="security-card-label">
                                Multi-Factor Authentication
                            </span>

                            <strong className="security-card-value">
                                {overview.mfaStatus === 'ENABLED'
                                    ? 'Enabled'
                                    : 'Disabled'}
                            </strong>

                            <p className="security-card-description">
                                Additional verification is
                                {overview.mfaStatus === 'ENABLED'
                                    ? ' enabled for your account.'
                                    : ' not enabled for your account.'}
                            </p>

                            <div style={{ marginTop: '16px' }}>
                                <Link
                                    to="/customer/security/mfa"
                                    className="primary-button"
                                >
                                    {overview.mfaStatus === 'ENABLED'
                                        ? 'Manage MFA'
                                        : 'Enable MFA'}
                                </Link>
                            </div>
                        </div>

                        <div className="security-card">
                            <span className="security-card-label">
                                Trusted Devices
                            </span>

                            <strong className="security-card-value">
                                {overview.trustedDeviceCount}
                            </strong>

                            <p className="security-card-description">
                                Devices currently associated
                                with your account.
                            </p>
                        </div>

                        <div className="security-card">
                            <span className="security-card-label">
                                Recent Activity
                            </span>

                            <strong className="security-card-value">
                                {overview.recentActivityCount}
                            </strong>

                            <p className="security-card-description">
                                Recent security events recorded
                                for your account.
                            </p>
                        </div>
                    </section>

                    <section className="security-section">
                        <div className="security-section-header">
                            <div>
                                <h2>Trusted Devices</h2>

                                <p>
                                    Devices that have recently
                                    accessed your account.
                                </p>
                            </div>

                            <span className="security-section-count">
                                {devices.length}
                            </span>
                        </div>

                        <div className="security-device-list">
                            {devices.map((device) => (
                                <div
                                    key={device.id}
                                    className="security-card security-device-item"
                                >
                                    <div className="security-device-main">
                                        <div className="security-device-icon">
                                            {device.type.charAt(0)}
                                        </div>

                                        <div>
                                            <div className="security-device-title-row">
                                                <h3>
                                                    {device.name}
                                                </h3>

                                                <span
                                                    className={getDeviceStatusClass(
                                                        device.status,
                                                    )}
                                                >
                                                    {device.status}
                                                </span>
                                            </div>

                                            <p>
                                                {device.browser} ·{' '}
                                                {device.location}
                                            </p>

                                            <span className="security-device-date">
                                                Last active:{' '}
                                                {formatDate(
                                                    device.lastActiveAt,
                                                )}
                                            </span>

                                            {device.status ===
                                                'TRUSTED' && (
                                                    <button
                                                        type="button"
                                                        className="security-device-revoke"
                                                        onClick={() => {
                                                            void handleRevokeDevice(
                                                                device.id,
                                                            )
                                                        }}
                                                        disabled={
                                                            revokingDeviceId ===
                                                            device.id
                                                        }
                                                    >
                                                        {revokingDeviceId ===
                                                        device.id
                                                            ? 'Revoking...'
                                                            : 'Revoke'}
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="security-section">
                        <div className="security-section-header">
                            <div>
                                <h2>Recent Security Activity</h2>

                                <p>
                                    Review important security
                                    events on your account.
                                </p>
                            </div>

                            <span className="security-section-count">
                                {activities.length}
                            </span>
                        </div>

                        <div className="security-activity-list">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="security-card security-activity-item"
                                >
                                    <div className="security-activity-main">
                                        <div className="security-activity-icon">
                                            {activity.type.charAt(0)}
                                        </div>

                                        <div className="security-activity-content">
                                            <div className="security-activity-title-row">
                                                <h3>
                                                    {activity.title}
                                                </h3>

                                                <span
                                                    className={getActivityStatusClass(
                                                        activity.status,
                                                    )}
                                                >
                                                    {activity.status}
                                                </span>
                                            </div>

                                            <p>
                                                {
                                                    activity.description
                                                }
                                            </p>

                                            <div className="security-activity-meta">
                                                <span>
                                                    {formatDate(
                                                        activity.createdAt,
                                                    )}
                                                </span>

                                                {activity.deviceName && (
                                                    <span>
                                                        {
                                                            activity.deviceName
                                                        }
                                                    </span>
                                                )}

                                                {activity.location && (
                                                    <span>
                                                        {
                                                            activity.location
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    )
}

export default SecurityPage