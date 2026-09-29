import { BrowserRouter, Routes, Route } from 'react-router'
import App from '../App'
import PublicLayout from '../layouts/PublicLayout'
import CustomerLayout from '../layouts/CustomerLayout'

import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'

import CustomerPortalPage from '../pages/CustomerPortalPage'
import MerchantPortalPage from '../pages/MerchantPortalPage'
import AdminPortalPage from '../pages/AdminPortalPage'
import WalletPage from '../pages/WalletPage'
import AddMoneyPage from '../pages/AddMoneyPage'
import SendMoneyPage from '../pages/SendMoneyPage'
import TransactionsPage from '../pages/TransactionsPage'
import TransactionDetailsPage from '../pages/TransactionDetailsPage'
import BeneficiariesPage from '../pages/BeneficiariesPage'
import BeneficiaryDetailsPage from '../pages/BeneficiaryDetailsPage'
import CardsPage from '../pages/CardsPage'
import CardDetailsPage from '../pages/CardDetailsPage'
import NotificationsPage from '../pages/NotificationsPage'
import SecurityPage from '../pages/SecurityPage'

import ProtectedRoute from '../routes/ProtectedRoute'
import RoleRoute from '../routes/RoleRoute'

import MerchantLayout from '../layouts/MerchantLayout'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<App />}>

                    {/* Public routes */}
                    <Route element={<PublicLayout />}>
                        <Route
                            path="/"
                            element={<HomePage />}
                        />

                        <Route
                            path="/login"
                            element={<LoginPage />}
                        />

                        <Route
                            path="/register"
                            element={<RegisterPage />}
                        />

                        <Route
                            path="/forgot-password"
                            element={<ForgotPasswordPage />}
                        />
                    </Route>

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>

                        {/* Customer routes */}
                        <Route
                            element={
                                <RoleRoute
                                    allowedRoles={['CUSTOMER']}
                                />
                            }
                        >
                            <Route element={<CustomerLayout />}>
                                <Route
                                    path="/customer"
                                    element={<CustomerPortalPage />}
                                />

                                <Route
                                    path="/customer/wallet"
                                    element={<WalletPage />}
                                />
                                <Route
                                    path="/customer/add-money"
                                    element={<AddMoneyPage />}
                                />
                                <Route
                                    path="/customer/send-money"
                                    element={<SendMoneyPage />}
                                />
                                <Route
                                    path="/customer/transactions"
                                    element={<TransactionsPage />}
                                />
                                <Route
                                    path="/customer/transactions/:transactionId"
                                    element={<TransactionDetailsPage />}
                                />
                                <Route
                                    path="/customer/beneficiaries"
                                    element={<BeneficiariesPage />}
                                />
                                <Route
                                    path="/customer/beneficiaries/:beneficiaryId"
                                    element={<BeneficiaryDetailsPage />}
                                />
                                <Route path="/customer/cards" element={<CardsPage />} />
                                <Route
                                    path="/customer/cards/:cardId"
                                    element={<CardDetailsPage />}
                                />
                                <Route
                                    path="/customer/notifications"
                                    element={<NotificationsPage />}
                                />
                                <Route path="/customer/security" element={<SecurityPage />} />
                            </Route>
                        </Route>

                        {/* Merchant routes */}
                        <Route
                            element={
                                <RoleRoute
                                    allowedRoles={['MERCHANT']}
                                />
                            }
                        >
                            <Route element={<MerchantLayout />}>
                                <Route
                                    path="/merchant"
                                    element={<MerchantPortalPage />}
                                />
                            </Route>
                        </Route>

                        {/* Admin routes */}
                        <Route
                            element={
                                <RoleRoute
                                    allowedRoles={['ADMIN']}
                                />
                            }
                        >
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