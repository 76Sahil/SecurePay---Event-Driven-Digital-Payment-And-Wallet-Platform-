import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth'

function CustomerLayout() {
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
                            Customer Portal
                        </p>
                    </div>
                </div>

                <nav
                    className="customer-sidebar__nav"
                    aria-label="Customer navigation"
                >
                    <NavLink
                        to="/customer"
                        end
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ◫
                        </span>

                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/customer/wallet"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ▣
                        </span>

                        <span>Wallet</span>
                    </NavLink>

                    <NavLink
                        to="/customer/add-money"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ⊕
                        </span>

                        <span>Add Money</span>
                    </NavLink>

                    <NavLink
                        to="/customer/send-money"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ↗
                        </span>

                        <span>Send Money</span>
                    </NavLink>

                    <NavLink
                        to="/customer/beneficiaries"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ♙
                        </span>

                        <span>Beneficiaries</span>
                    </NavLink>

                    <NavLink
                        to="/customer/transactions"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ☷
                        </span>

                        <span>Transactions</span>
                    </NavLink>

                    <NavLink
                        to="/customer/cards"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ▤
                        </span>

                        <span>Cards</span>
                    </NavLink>

                    <NavLink
                        to="/customer/notifications"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ♧
                        </span>

                        <span>Notifications</span>
                    </NavLink>

                    <NavLink
                        to="/customer/security"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ◈
                        </span>

                        <span>Security</span>
                    </NavLink>

                    <NavLink
                        to="/customer/profile"
                        className="customer-sidebar__link"
                    >
                        <span className="customer-sidebar__icon">
                            ○
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
                                    {user?.email ?? 'Customer'}
                                </p>

                                <span>Customer</span>
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

export default CustomerLayout