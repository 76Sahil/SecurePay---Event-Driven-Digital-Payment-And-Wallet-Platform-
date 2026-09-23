import { Outlet, Link } from 'react-router'

function PublicLayout() {
    return (
        <div className="public-layout">
            <header className="site-header">
                <div className="site-header__container">
                    <Link to="/" className="site-header__brand">
                        SecurePay
                    </Link>

                    <nav className="site-header__nav" aria-label="Primary navigation">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </nav>
                </div>
            </header>

            <main className="site-main">
                <div className="site-main__container">
                    <Outlet />
                </div>
            </main>

            <footer className="site-footer">
                <div className="site-footer__container">
                    <p>SecurePay</p>
                </div>
            </footer>
        </div>
    )
}

export default PublicLayout