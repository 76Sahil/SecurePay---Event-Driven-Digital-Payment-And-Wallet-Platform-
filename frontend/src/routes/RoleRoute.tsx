import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/useAuth'
import type { UserRole } from '../context/AuthContext'

type RoleRouteProps = {
    allowedRoles: UserRole[]
}

function RoleRoute({
                       allowedRoles,
                   }: RoleRouteProps) {
    const { user } = useAuth()

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default RoleRoute