package com.securepay.payment;

import com.securepay.audit.SecurityAuditService;
import com.securepay.audit.SecurityAuditSeverity;
import com.securepay.ledger.LedgerEntryType;
import com.securepay.ledger.LedgerService;
import com.securepay.merchant.Merchant;
import com.securepay.merchant.MerchantRepository;
import com.securepay.payment.dto.CreatePaymentRequest;
import com.securepay.payment.dto.CreateRefundRequest;
import com.securepay.payment.dto.MerchantPaymentResponse;
import com.securepay.payment.dto.MerchantRefundResponse;
import com.securepay.transaction.WalletTransaction;
import com.securepay.transaction.WalletTransactionRepository;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.wallet.Wallet;
import com.securepay.wallet.WalletRepository;
import com.securepay.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
public class MerchantPaymentService {

    private final MerchantRepository merchantRepository;
    private final UserRepository userRepository;
    private final MerchantPaymentRepository paymentRepository;
    private final MerchantRefundRepository refundRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final LedgerService ledgerService;
    private final SecurityAuditService auditService;

    @Autowired(required = false)
    private NotificationService notificationService;

    private static final SecureRandom RANDOM = new SecureRandom();

    public MerchantPaymentService(
            MerchantRepository merchantRepository,
            UserRepository userRepository,
            MerchantPaymentRepository paymentRepository,
            MerchantRefundRepository refundRepository,
            WalletRepository walletRepository,
            WalletTransactionRepository transactionRepository,
            LedgerService ledgerService,
            SecurityAuditService auditService) {
        this.merchantRepository = merchantRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.refundRepository = refundRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerService = ledgerService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<MerchantPaymentResponse> getMerchantPayments(String keycloakUserId) {
        Merchant merchant = getMerchant(keycloakUserId);
        return paymentRepository.findByMerchantOrderByCreatedAtDesc(merchant)
                .stream()
                .map(MerchantPaymentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public MerchantPaymentResponse getPaymentById(String keycloakUserId, String paymentIdOrRef) {
        Merchant merchant = getMerchant(keycloakUserId);
        MerchantPayment payment;

        if (paymentIdOrRef.matches("\\d+")) {
            payment = paymentRepository.findByIdAndMerchant(Long.parseLong(paymentIdOrRef), merchant)
                    .orElseGet(() -> paymentRepository.findByReferenceAndMerchant(paymentIdOrRef, merchant)
                            .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentIdOrRef)));
        } else {
            payment = paymentRepository.findByReferenceAndMerchant(paymentIdOrRef, merchant)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentIdOrRef));
        }

        return MerchantPaymentResponse.from(payment);
    }

    @Transactional
    public MerchantPaymentResponse collectPayment(String keycloakUserId, CreatePaymentRequest request) {
        Merchant merchant = getMerchant(keycloakUserId);

        BigDecimal amount = request.amount();
        if (amount == null || amount.compareTo(new BigDecimal("1.00")) < 0) {
            throw new IllegalArgumentException("Amount must be at least INR 1.00");
        }

        String reference = "SP-PAY-" + (10000 + RANDOM.nextInt(90000));
        String method = (request.method() != null ? request.method().toUpperCase() : "UPI");

        Wallet merchantWallet = ensureWalletExists(merchant.getUser());

        if ("WALLET".equalsIgnoreCase(method)) {
            User customer = userRepository.findByEmail(request.customerEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Customer account not found for email: " + request.customerEmail()));

            Wallet customerWallet = ensureWalletExists(customer);
            if (customerWallet.getBalance().compareTo(amount) < 0) {
                throw new IllegalArgumentException("Insufficient customer wallet balance.");
            }

            BigDecimal customerBalance = customerWallet.getBalance().subtract(amount);
            customerWallet.setBalance(customerBalance);
            walletRepository.save(customerWallet);

            WalletTransaction customerTx = new WalletTransaction();
            customerTx.setWallet(customerWallet);
            customerTx.setType("PURCHASE");
            customerTx.setAmount(amount);
            customerTx.setCurrency(customerWallet.getCurrency());
            customerTx.setStatus("SUCCESS");
            customerTx.setDescription("Payment to " + merchant.getBusinessName());
            customerTx = transactionRepository.save(customerTx);

            ledgerService.recordEntry(
                    customerTx,
                    customerWallet,
                    LedgerEntryType.DEBIT,
                    amount,
                    customerBalance,
                    "Payment debit to " + merchant.getBusinessName()
            );

            BigDecimal merchantBalance = merchantWallet.getBalance().add(amount);
            merchantWallet.setBalance(merchantBalance);
            walletRepository.save(merchantWallet);

            WalletTransaction merchantTx = new WalletTransaction();
            merchantTx.setWallet(merchantWallet);
            merchantTx.setType("MERCHANT_PAYMENT");
            merchantTx.setAmount(amount);
            merchantTx.setCurrency(merchantWallet.getCurrency());
            merchantTx.setStatus("SUCCESS");
            merchantTx.setDescription("Received payment from " + request.customerEmail());
            merchantTx = transactionRepository.save(merchantTx);

            ledgerService.recordEntry(
                    merchantTx,
                    merchantWallet,
                    LedgerEntryType.CREDIT,
                    amount,
                    merchantBalance,
                    "Payment credit from " + request.customerEmail()
            );
        } else {
            BigDecimal merchantBalance = merchantWallet.getBalance().add(amount);
            merchantWallet.setBalance(merchantBalance);
            walletRepository.save(merchantWallet);

            WalletTransaction settlementTx = new WalletTransaction();
            settlementTx.setWallet(merchantWallet);
            settlementTx.setType("PAYMENT_SETTLEMENT");
            settlementTx.setAmount(amount);
            settlementTx.setCurrency(merchantWallet.getCurrency());
            settlementTx.setStatus("SUCCESS");
            settlementTx.setDescription("Settlement for payment " + reference + " (" + method + ")");
            settlementTx = transactionRepository.save(settlementTx);

            ledgerService.recordEntry(
                    settlementTx,
                    merchantWallet,
                    LedgerEntryType.CREDIT,
                    amount,
                    merchantBalance,
                    "Payment settlement via " + method
            );
        }

        MerchantPayment payment = new MerchantPayment();
        payment.setMerchant(merchant);
        payment.setReference(reference);
        payment.setCustomerName(request.customerName() != null ? request.customerName() : "Customer");
        payment.setCustomerEmail(request.customerEmail());
        payment.setAmount(amount);
        payment.setCurrency(request.currency() != null ? request.currency() : "INR");
        payment.setMethod(method);
        payment.setStatus("SUCCESS");
        payment.setDescription(request.description() != null ? request.description() : "Payment collected");

        MerchantPayment saved = paymentRepository.save(payment);

        if (notificationService != null) {
            notificationService.createNotification(
                    merchant.getUser(),
                    "PAYMENT",
                    "Payment Collected",
                    "Collected INR " + amount + " via " + method + " (ref: " + reference + ")",
                    null,
                    String.valueOf(saved.getId())
            );
        }

        auditService.recordEvent(
                "MERCHANT_PAYMENT_COLLECTED",
                merchant.getUser(),
                SecurityAuditSeverity.INFO,
                null,
                null,
                "Collected INR " + amount + " via " + method + " (ref: " + reference + ")"
        );

        return MerchantPaymentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<MerchantRefundResponse> getMerchantRefunds(String keycloakUserId) {
        Merchant merchant = getMerchant(keycloakUserId);
        return refundRepository.findByMerchantOrderByCreatedAtDesc(merchant)
                .stream()
                .map(MerchantRefundResponse::from)
                .toList();
    }

    @Transactional
    public MerchantRefundResponse processRefund(String keycloakUserId, CreateRefundRequest request) {
        Merchant merchant = getMerchant(keycloakUserId);

        MerchantPayment payment = paymentRepository.findByReferenceAndMerchant(request.paymentReference(), merchant)
                .orElseThrow(() -> new IllegalArgumentException("Payment reference not found: " + request.paymentReference()));

        if (!"SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalArgumentException("Cannot refund a payment with status: " + payment.getStatus());
        }

        BigDecimal refundAmount = request.amount();
        if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Refund amount must be strictly positive.");
        }

        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new IllegalArgumentException("Refund amount cannot exceed original payment amount.");
        }

        Wallet merchantWallet = ensureWalletExists(merchant.getUser());
        if (merchantWallet.getBalance().compareTo(refundAmount) < 0) {
            throw new IllegalArgumentException("Insufficient merchant wallet balance for refund.");
        }

        BigDecimal merchantBalance = merchantWallet.getBalance().subtract(refundAmount);
        merchantWallet.setBalance(merchantBalance);
        walletRepository.save(merchantWallet);

        WalletTransaction refundDebitTx = new WalletTransaction();
        refundDebitTx.setWallet(merchantWallet);
        refundDebitTx.setType("REFUND_DEBIT");
        refundDebitTx.setAmount(refundAmount);
        refundDebitTx.setCurrency(merchantWallet.getCurrency());
        refundDebitTx.setStatus("SUCCESS");
        refundDebitTx.setDescription("Refund for payment " + payment.getReference());
        refundDebitTx = transactionRepository.save(refundDebitTx);

        ledgerService.recordEntry(
                refundDebitTx,
                merchantWallet,
                LedgerEntryType.DEBIT,
                refundAmount,
                merchantBalance,
                "Refund debit for " + payment.getReference()
        );

        if ("WALLET".equalsIgnoreCase(payment.getMethod())) {
            Optional<User> customerOpt = userRepository.findByEmail(payment.getCustomerEmail());
            if (customerOpt.isPresent()) {
                Wallet customerWallet = ensureWalletExists(customerOpt.get());
                BigDecimal customerBalance = customerWallet.getBalance().add(refundAmount);
                customerWallet.setBalance(customerBalance);
                walletRepository.save(customerWallet);

                WalletTransaction refundCreditTx = new WalletTransaction();
                refundCreditTx.setWallet(customerWallet);
                refundCreditTx.setType("REFUND_CREDIT");
                refundCreditTx.setAmount(refundAmount);
                refundCreditTx.setCurrency(customerWallet.getCurrency());
                refundCreditTx.setStatus("SUCCESS");
                refundCreditTx.setDescription("Refund from " + merchant.getBusinessName());
                refundCreditTx = transactionRepository.save(refundCreditTx);

                ledgerService.recordEntry(
                        refundCreditTx,
                        customerWallet,
                        LedgerEntryType.CREDIT,
                        refundAmount,
                        customerBalance,
                        "Refund credit from " + merchant.getBusinessName()
                );
            }
        }

        payment.setStatus("REFUNDED");
        paymentRepository.save(payment);

        String refundRef = "SP-REF-" + (70000 + RANDOM.nextInt(20000));
        MerchantRefund refund = new MerchantRefund();
        refund.setMerchant(merchant);
        refund.setPayment(payment);
        refund.setReference(refundRef);
        refund.setPaymentReference(payment.getReference());
        refund.setCustomerName(payment.getCustomerName());
        refund.setAmount(refundAmount);
        refund.setCurrency(payment.getCurrency());
        refund.setReason(request.reason() != null ? request.reason() : "Customer requested refund");
        refund.setStatus("SUCCESS");

        MerchantRefund saved = refundRepository.save(refund);

        if (notificationService != null) {
            notificationService.createNotification(
                    merchant.getUser(),
                    "REFUND",
                    "Refund Processed",
                    "Processed refund of INR " + refundAmount + " for " + payment.getReference(),
                    null,
                    String.valueOf(payment.getId())
            );
        }

        auditService.recordEvent(
                "MERCHANT_REFUND_PROCESSED",
                merchant.getUser(),
                SecurityAuditSeverity.INFO,
                null,
                null,
                "Processed refund of INR " + refundAmount + " for " + payment.getReference()
        );

        return MerchantRefundResponse.from(saved);
    }

    private Merchant getMerchant(String keycloakUserId) {
        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for Keycloak identity: " + keycloakUserId));

        return merchantRepository.findByUser(user).orElseGet(() -> {
            Merchant merchant = new Merchant();
            merchant.setUser(user);
            merchant.setMerchantId("MER-" + (10000 + user.getId()));
            merchant.setBusinessName(user.getFullName() + " Store");
            merchant.setLegalName(user.getFullName() + " Private Limited");
            merchant.setEmail(user.getEmail());
            merchant.setPhone(user.getPhoneNumber() != null ? user.getPhoneNumber() : "+91 98765 43210");
            merchant.setMerchantType("BUSINESS");
            merchant.setAccountStatus("ACTIVE");
            merchant.setVerificationStatus("VERIFIED");
            merchant.setSettlementCurrency("INR");
            return merchantRepository.save(merchant);
        });
    }

    private Wallet ensureWalletExists(User user) {
        return walletRepository.findByUser(user).orElseGet(() -> {
            Wallet wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(BigDecimal.ZERO);
            wallet.setCurrency("INR");
            wallet.setStatus("ACTIVE");
            return walletRepository.save(wallet);
        });
    }
}
