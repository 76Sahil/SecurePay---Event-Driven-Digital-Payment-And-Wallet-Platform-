import { BrowserRouter, Routes, Route } from 'react-router'
import App from '../App'
import PublicLayout from '../layouts/PublicLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'

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
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter