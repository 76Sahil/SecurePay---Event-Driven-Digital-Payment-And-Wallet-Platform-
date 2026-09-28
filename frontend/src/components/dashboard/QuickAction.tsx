import { Link } from 'react-router'

type QuickActionProps = {
    label: string
    description: string
    icon: string
    to: string
}

function QuickAction({
                         label,
                         description,
                         icon,
                         to,
                     }: QuickActionProps) {
    return (
        <Link
            to={to}
            className="quick-action"
        >
            <span className="quick-action__icon">
                {icon}
            </span>

            <span className="quick-action__content">
                <span className="quick-action__label">
                    {label}
                </span>

                <span className="quick-action__description">
                    {description}
                </span>
            </span>
        </Link>
    )
}

export default QuickAction