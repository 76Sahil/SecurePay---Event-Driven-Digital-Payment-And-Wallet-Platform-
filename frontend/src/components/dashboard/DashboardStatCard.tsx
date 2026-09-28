type DashboardStatCardProps = {
    label: string
    value: string
    description?: string
    accent?: 'blue' | 'green' | 'purple' | 'red'
    icon?: string
}

function DashboardStatCard({
                               label,
                               value,
                               description,
                               accent = 'blue',
                               icon,
                           }: DashboardStatCardProps) {
    return (
        <article
            className={`dashboard-stat-card dashboard-stat-card--${accent}`}
        >
            <div className="dashboard-stat-card__top">
                <div className="dashboard-stat-card__icon">
                    {icon ?? '•'}
                </div>
            </div>

            <p className="dashboard-stat-card__label">
                {label}
            </p>

            <p className="dashboard-stat-card__value">
                {value}
            </p>

            {description && (
                <p className="dashboard-stat-card__description">
                    {description}
                </p>
            )}
        </article>
    )
}

export default DashboardStatCard