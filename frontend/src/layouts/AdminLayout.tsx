import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth'

function AdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

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
                        SecurePay
                    </div>

                    <div className="customer-topbar__actions">
                        <button
                            type="button"
                            className="customer-topbar__notification"
                            aria-label="Security notifications"
                        >
                            🔔
                        </button>

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