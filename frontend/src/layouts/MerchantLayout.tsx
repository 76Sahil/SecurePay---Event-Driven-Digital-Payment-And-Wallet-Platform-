import { useState, useEffect, useCallback, useRef } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router'
import { useAuth } from '../context/useAuth'
import type { Notification } from '../types/notification'
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead } from '../services/notificationService'

function MerchantLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState<number>(0)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const loadNotifications = useCallback(async () => {
        try {
            const [list, count] = await Promise.all([
                getNotifications().catch(() => []),
                getUnreadNotificationCount().catch(() => 0),
            ])
            setNotifications(list)
            setUnreadCount(count)
        } catch {
            // Background telemetry
        }
    }, [])

    useEffect(() => {
        void loadNotifications()
        const interval = setInterval(() => {
            void loadNotifications()
        }, 15000)
        return () => clearInterval(interval)
    }, [loadNotifications])

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

    async function handleMarkRead(id: string) {
        try {
            await markNotificationAsRead(id)
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n)),
            )
            setUnreadCount((c) => Math.max(0, c - 1))
        } catch {
            // Ignore error
        }
    }

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <div className="customer-layout">
            <aside className="customer-sidebar">
                <div className="customer-sidebar__brand">
                    <div className="customer-sidebar__logo">
                        S
                    </div>

                    <div>
                        <p className="customer-sidebar__brand-name">
                            SecurePay
                        </p>

                        <p className="customer-sidebar__brand-subtitle">
                            Merchant Portal
                        </p>
                    </div>
                </div>

                <nav
                    className="customer-sidebar__nav"
                    aria-label="Merchant navigation"
                >
                    <NavLink
                        to="/merchant"
                        end
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ◫
                        </span>

                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/merchant/payments"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ₹
                        </span>

                        <span>Payments</span>
                    </NavLink>

                    <NavLink
                        to="/merchant/transactions"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ☷
                        </span>

                        <span>Transactions</span>
                    </NavLink>

                    <NavLink
                        to="/merchant/refunds"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ↩
                        </span>

                        <span>Refunds</span>
                    </NavLink>

                    <NavLink
                        to="/merchant/revenue"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ▤
                        </span>

                        <span>Revenue</span>
                    </NavLink>

                    <NavLink
                        to="/merchant/api-keys"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ◈
                        </span>

                        <span>API Keys</span>
                    </NavLink>

                    <NavLink
                        to="/merchant/profile"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ◉
                        </span>

                        <span>Profile</span>
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
                        SecurePay
                    </div>

                    <div className="customer-topbar__actions" style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            type="button"
                            className="customer-topbar__notification"
                            aria-label="Notifications"
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

                        {/* Merchant Real Notifications Dropdown */}
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
                                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Merchant Notifications</h4>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{unreadCount} unread</span>
                                </div>

                                {notifications.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                        No notifications yet.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {notifications.slice(0, 6).map((n) => (
                                            <div key={n.id} style={{
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                background: n.status === 'UNREAD' ? '#f0f9ff' : '#f8fafc',
                                                border: '1px solid ' + (n.status === 'UNREAD' ? '#bae6fd' : '#e2e8f0'),
                                                fontSize: '13px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <strong style={{ fontSize: '12px', color: '#0f172a' }}>{n.title}</strong>
                                                    {n.status === 'UNREAD' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleMarkRead(n.id)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#0284c7',
                                                                fontSize: '11px',
                                                                cursor: 'pointer',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            Mark Read
                                                        </button>
                                                    )}
                                                </div>
                                                <p style={{ margin: 0, color: '#334155', fontSize: '12px' }}>
                                                    {n.message}
                                                </p>
                                                <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                    <Link
                                        to="/merchant/payments"
                                        style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        View Merchant Payments →
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="customer-topbar__profile">
                            <div className="customer-topbar__avatar">
                                {user?.email
                                    ?.charAt(0)
                                    .toUpperCase() ?? 'U'}
                            </div>

                            <div className="customer-topbar__user">
                                <p>
                                    {user?.email ?? 'Merchant'}
                                </p>

                                <span>Merchant</span>
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

export default MerchantLayout