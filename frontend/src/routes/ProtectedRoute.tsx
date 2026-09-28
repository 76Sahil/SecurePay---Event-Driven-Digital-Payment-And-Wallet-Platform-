import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/useAuth'

function ProtectedRoute() {
    const {
        isAuthenticated,
        isLoading,
    } = useAuth()

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute