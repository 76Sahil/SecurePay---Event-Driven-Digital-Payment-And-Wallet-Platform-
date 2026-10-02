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
import ScanAndPayPage from '../pages/ScanAndPayPage'
import PayBillsPage from '../pages/PayBillsPage'
import TransactionsPage from '../pages/TransactionsPage'
import TransactionDetailsPage from '../pages/TransactionDetailsPage'
import BeneficiariesPage from '../pages/BeneficiariesPage'
import AddBeneficiaryPage from '../pages/AddBeneficiaryPage'
import BeneficiaryDetailsPage from '../pages/BeneficiaryDetailsPage'
import CardsPage from '../pages/CardsPage'
import CardDetailsPage from '../pages/CardDetailsPage'
import NotificationsPage from '../pages/NotificationsPage'
import SecurityPage from '../pages/SecurityPage'
import ProfilePage from '../pages/ProfilePage'

import ProtectedRoute from '../routes/ProtectedRoute'
import RoleRoute from '../routes/RoleRoute'

import MerchantLayout from '../layouts/MerchantLayout'
import MerchantPaymentsPage from '../pages/MerchantPaymentsPage'
import MerchantPaymentDetailsPage from '../pages/MerchantPaymentDetailsPage'
import MerchantTransactionsPage from '../pages/MerchantTransactionsPage'
import MerchantApiKeysPage from '../pages/MerchantApiKeysPage'
import MerchantProfilePage from '../pages/MerchantProfilePage'
import MerchantRefundsPage from '../pages/MerchantRefundsPage'
import MerchantRevenuePage from '../pages/MerchantRevenuePage'

import AdminLayout from '../layouts/AdminLayout'
import FraudAlertsPage from '../pages/FraudAlertsPage'
import SecurityEventsPage from '../pages/SecurityEventsPage'
import AdminUsersPage from '../pages/AdminUsersPage'
import AuditLogsPage from '../pages/AuditLogsPage'

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
                                    path="/customer/scan-and-pay"
                                    element={<ScanAndPayPage />}
                                />
                                <Route
                                    path="/customer/pay-bills"
                                    element={<PayBillsPage />}
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
                                    path="/customer/beneficiaries/add"
                                    element={<AddBeneficiaryPage />}
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
                                <Route
                                    path="/customer/profile"
                                    element={<ProfilePage />}
                                />
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

                                <Route
                                    path="/merchant/payments"
                                    element={<MerchantPaymentsPage />}
                                />
                                <Route
                                    path="/merchant/payments/:paymentId"
                                    element={<MerchantPaymentDetailsPage />}
                                />
                                <Route
                                    path="/merchant/transactions"
                                    element={<MerchantTransactionsPage />}
                                />
                                <Route
                                    path="/merchant/api-keys"
                                    element={<MerchantApiKeysPage />}
                                />
                                <Route path="/merchant/profile" element={<MerchantProfilePage />} />
                                <Route path="/merchant/refunds" element={<MerchantRefundsPage />} />
                                <Route path="/merchant/revenue" element={<MerchantRevenuePage />} />
                            </Route>
                        </Route>

                        {/* Admin routes */}
                        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                            <Route element={<AdminLayout />}>
                                <Route
                                    path="/admin"
                                    element={<AdminPortalPage />}
                                />
                                <Route
                                    path="/admin/fraud-alerts"
                                    element={<FraudAlertsPage />}
                                />
                                <Route
                                    path="/admin/security-events"
                                    element={<SecurityEventsPage />}
                                />
                                <Route path="/admin/users" element={<AdminUsersPage />} />
                                <Route path="/admin/audit" element={<AuditLogsPage />} />
                            </Route>
                        </Route>

                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter