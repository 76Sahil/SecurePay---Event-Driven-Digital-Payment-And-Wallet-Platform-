import { BrowserRouter, Routes, Route } from 'react-router'
import App from '../App'
import PublicLayout from '../layouts/PublicLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import CustomerPortalPage from '../pages/CustomerPortalPage'
import MerchantPortalPage from '../pages/MerchantPortalPage'
import AdminPortalPage from '../pages/AdminPortalPage'
import ProtectedRoute from '../routes/ProtectedRoute'
import RoleRoute from '../routes/RoleRoute'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<App />}>
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/forgot-password"
                            element={<ForgotPasswordPage />}
                        />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route element={<RoleRoute allowedRoles={['CUSTOMER']} />}>
                            <Route
                                path="/customer"
                                element={<CustomerPortalPage />}
                            />
                        </Route>

                        <Route element={<RoleRoute allowedRoles={['MERCHANT']} />}>
                            <Route
                                path="/merchant"
                                element={<MerchantPortalPage />}
                            />
                        </Route>

                        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                            <Route
                                path="/admin"
                                element={<AdminPortalPage />}
                            />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter