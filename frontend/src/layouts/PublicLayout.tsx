import { Outlet, Link } from 'react-router'

function PublicLayout() {
    return (
        <div className="public-layout">
            <header className="site-header">
                <div className="site-header__container">
                    <Link to="/" className="site-header__brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: '#ffffff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '16px',
                        }}>
                            S
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                            SecurePay
                        </span>
                    </Link>

                    <nav className="site-header__nav" aria-label="Primary navigation" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontWeight: 500, fontSize: '14px' }}>
                            Platform
                        </Link>
                        <Link to="/login" className="sp-btn sp-btn-secondary sp-btn-sm" style={{ textDecoration: 'none' }}>
                            Sign In
                        </Link>
                        <Link to="/register" className="sp-btn sp-btn-primary sp-btn-sm" style={{ textDecoration: 'none' }}>
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="site-main">
                <div className="site-main__container">
                    <Outlet />
                </div>
            </main>

            <footer className="site-footer">
                <div className="site-footer__container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>SecurePay Platform</strong>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                            Event-Driven Digital Wallet, Peer-to-Peer Payments & Merchant Gateway.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b' }}>
                        <span>OAuth2 / Keycloak OIDC</span>
                        <span>•</span>
                        <span>Double-Entry Ledger</span>
                        <span>•</span>
                        <span>Kafka / Outbox</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default PublicLayout