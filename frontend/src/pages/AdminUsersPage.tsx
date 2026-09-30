import { useEffect, useState } from 'react'
import { getAdminUsers } from '../services/adminUserService'
import type {
    AdminUser,
    AdminUserAccountStatus,
    AdminUserRole,
} from '../types/adminUser'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

function getRoleClass(role: AdminUserRole) {
    return role.toLowerCase()
}

function getStatusClass(status: AdminUserAccountStatus) {
    return status.toLowerCase()
}

function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await getAdminUsers()
                setUsers(data)
            } catch {
                setError('Unable to load users.')
            } finally {
                setIsLoading(false)
            }
        }

        loadUsers()
    }, [])

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">ADMINISTRATION</span>
                    <h1>Users</h1>
                    <p>View SecurePay customer, merchant, and administrator accounts.</p>
                </div>

                <div className="admin-users-state">
                    <p>Loading users...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">ADMINISTRATION</span>
                    <h1>Users</h1>
                    <p>View SecurePay customer, merchant, and administrator accounts.</p>
                </div>

                <div className="admin-users-state admin-users-state--error">
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="page-eyebrow">ADMINISTRATION</span>
                <h1>Users</h1>
                <p>
                    View SecurePay customer, merchant, and administrator accounts.
                </p>
            </div>

            <section className="admin-users-card">
                <div className="admin-users-card__header">
                    <div>
                        <h2>User Accounts</h2>
                        <p>{users.length} accounts</p>
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="admin-users-state">
                        <p>No users found.</p>
                    </div>
                ) : (
                    <div className="admin-users-table-wrapper">
                        <table className="admin-users-table">
                            <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Account Status</th>
                                <th>Verification</th>
                                <th>Last Login</th>
                                <th>Created</th>
                            </tr>
                            </thead>

                            <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="admin-user-identity">
                                            <strong>{user.name}</strong>
                                            <span>{user.email}</span>
                                            <small>{user.id}</small>
                                        </div>
                                    </td>

                                    <td>
                                            <span
                                                className={`admin-user-role ${getRoleClass(
                                                    user.role,
                                                )}`}
                                            >
                                                {user.role}
                                            </span>
                                    </td>

                                    <td>
                                            <span
                                                className={`admin-user-status ${getStatusClass(
                                                    user.accountStatus,
                                                )}`}
                                            >
                                                {user.accountStatus}
                                            </span>
                                    </td>

                                    <td>
                                            <span
                                                className={`admin-user-verification ${user.verificationStatus.toLowerCase()}`}
                                            >
                                                {user.verificationStatus}
                                            </span>
                                    </td>

                                    <td>{formatDate(user.lastLoginAt)}</td>

                                    <td>{formatDate(user.createdAt)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}

export default AdminUsersPage