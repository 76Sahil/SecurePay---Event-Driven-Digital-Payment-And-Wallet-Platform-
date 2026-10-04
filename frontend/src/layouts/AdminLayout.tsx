import { useState, useEffect, useCallback, useRef } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router'
import { useAuth } from '../context/useAuth'

function AdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState<number>(0)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const loadSecurityNotifications = useCallback(async () => {
        const token = sessionStorage.getItem('securepay_access_token')
        if (!token) return

        try {
            const [eventsRes, metricsRes] = await Promise.all([
                fetch('http://localhost:8080/api/admin/security/events?limit=8', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch('http://localhost:8080/api/admin/security/metrics', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])

            if (eventsRes.ok) {
                const events = await eventsRes.json()
                setNotifications(Array.isArray(events) ? events : [])
            }
            if (metricsRes.ok) {
                const metrics = await metricsRes.json()
                const count = (metrics.criticalAlerts || 0) + (metrics.warningAlerts || 0)
                setUnreadCount(count)
            }
        } catch {
            // Background telemetry
        }
    }, [])

    useEffect(() => {
        void loadSecurityNotifications()
        const interval = setInterval(() => {
            void loadSecurityNotifications()
        }, 15000)
        return () => clearInterval(interval)
    }, [loadSecurityNotifications])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotifications(false)
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showNotifications])

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <div className="customer-layout">
            <aside className="customer-sidebar">
                <div className="customer-sidebar__brand">
                    <div className="customer-sidebar__logo" style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}>
                        SP
                    </div>

                    <div>
                        <p className="customer-sidebar__brand-name">
                            SecurePay
                        </p>

                        <p className="customer-sidebar__brand-subtitle" style={{ color: '#94a3b8' }}>
                            Admin Command Center
                        </p>
                    </div>
                </div>

                <nav
                    className="customer-sidebar__nav"
                    aria-label="Admin navigation"
                >
                    <NavLink
                        to="/admin"
                        end
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ◫
                        </span>
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/admin/security-events"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ◈
                        </span>
                        <span>Security Events</span>
                    </NavLink>

                    <NavLink
                        to="/admin/fraud-alerts"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ⚠
                        </span>
                        <span>Fraud Alerts</span>
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ♙
                        </span>
                        <span>Users</span>
                    </NavLink>

                    <NavLink
                        to="/admin/audit"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ☷
                        </span>
                        <span>Audit Logs</span>
                    </NavLink>
                </nav>

                <div className="customer-sidebar__footer">
                    <button
                        type="button"
                        className="customer-sidebar__logout"
                        onClick={handleLogout}
                    >
                        <span className="customer-sidebar__icon">
                            ←
                        </span>

                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="customer-content">
                <header className="customer-topbar">
                    <div className="customer-topbar__mobile-brand">
                        SecurePay Admin
                    </div>

                    <div className="customer-topbar__actions" style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            type="button"
                            className="customer-topbar__notification"
                            aria-label="Security notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ position: 'relative', cursor: 'pointer' }}
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="customer-topbar__notification-badge" style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    padding: '1px 5px',
                                    fontWeight: 700
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Admin Security Notifications Dropdown */}
                        {showNotifications && (
                            <div style={{
                                position: 'absolute',
                                top: '48px',
                                right: '120px',
                                width: '360px',
                                maxHeight: '420px',
                                overflowY: 'auto',
                                background: '#ffffff',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0',
                                zIndex: 1000,
                                padding: '16px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Security Notifications</h4>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{notifications.length} events</span>
                                </div>

                                {notifications.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                        No recent security alerts.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {notifications.map((ev) => (
                                            <div key={ev.id} style={{
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                background: ev.severity === 'CRITICAL' ? '#fff1f2' : ev.severity === 'WARN' ? '#fffbeb' : '#f8fafc',
                                                border: '1px solid ' + (ev.severity === 'CRITICAL' ? '#fecdd3' : ev.severity === 'WARN' ? '#fde68a' : '#e2e8f0'),
                                                fontSize: '13px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <strong style={{ fontSize: '12px', color: '#0f172a' }}>{ev.eventType}</strong>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        fontWeight: 700,
                                                        color: ev.severity === 'CRITICAL' ? '#be123c' : ev.severity === 'WARN' ? '#b45309' : '#0284c7'
                                                    }}>
                                                        {ev.severity}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, color: '#334155', fontSize: '12px' }}>
                                                    {ev.description || ev.details}
                                                </p>
                                                <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                                    {ev.actor || ev.userEmail} &bull; {new Date(ev.createdAt).toLocaleTimeString()}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                    <Link
                                        to="/admin/security-events"
                                        style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        View All Security Events →
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="customer-topbar__profile">
                            <div className="customer-topbar__avatar" style={{ background: '#0f172a', color: '#38bdf8' }}>
                                {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                            </div>

                            <div className="customer-topbar__user">
                                <p>{user?.email ?? 'admin@gmail.com'}</p>
                                <span style={{ color: '#0ea5e9', fontWeight: 600 }}>Administrator</span>
                            </div>

                            <span className="customer-topbar__chevron">
                                ⌄
                            </span>
                        </div>
                    </div>
                </header>

                <main className="customer-main">
                    <div className="customer-main__container">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout