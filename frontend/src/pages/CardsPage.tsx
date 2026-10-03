import { Link } from 'react-router'

function CardsPage() {
    return (
        <div className="sp-page cards-page">
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">Feature Scope</span>
                    <h1 className="sp-page-title">Cards</h1>
                    <p className="sp-page-subtitle">
                        Card issuing and management status in SecurePay.
                    </p>
                </div>
            </header>

            <section className="sp-card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '640px', margin: '32px auto' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#142d5a', marginBottom: '12px' }}>
                    Cards are not available yet
                </h2>
                <p style={{ color: '#556885', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                    SecurePay currently focuses on core event-driven fintech capabilities:
                </p>

                <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px 24px', borderRadius: '12px', marginBottom: '28px' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#253957', lineHeight: '1.8', fontSize: '14px' }}>
                        <li><strong>Digital Wallet:</strong> Instant balance top-up with double-entry accounting</li>
                        <li><strong>Peer-to-Peer Transfers:</strong> Direct wallet transfers to registered beneficiaries</li>
                        <li><strong>Merchant Payments:</strong> API key checkouts, hosted payments, and webhook callbacks</li>
                        <li><strong>Transaction Management:</strong> Audited real-time ledger and event stream</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link to="/customer/wallet" className="sp-btn sp-btn-primary">
                        Open Wallet
                    </Link>
                    <Link to="/customer/send-money" className="sp-btn sp-btn-secondary">
                        Send Money
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default CardsPage