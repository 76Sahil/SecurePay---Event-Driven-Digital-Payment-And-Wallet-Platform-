import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth'

function MerchantLayout() {
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

                    <div className="customer-topbar__actions">
                        <button
                            type="button"
                            className="customer-topbar__notification"
                            aria-label="Notifications"
                        >
                            ♧

                            <span className="customer-topbar__notification-badge">
                                3
                            </span>
                        </button>

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