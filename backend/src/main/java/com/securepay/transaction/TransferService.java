package com.securepay.transaction;

import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.wallet.Wallet;
import com.securepay.wallet.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;

@Service
public class TransferService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public TransferService(
            WalletRepository walletRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public void transfer(
            Long senderId,
            String recipientEmail,
            BigDecimal amount) {

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Transfer amount must be greater than zero");
        }

        String normalizedEmail = recipientEmail
                .trim()
                .toLowerCase(Locale.ROOT);

        User recipient = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Recipient not found"));

        Long recipientId = recipient.getId();

        if (senderId.equals(recipientId)) {
            throw new IllegalArgumentException(
                    "You cannot transfer money to yourself");
        }

        // Lock both wallets in a consistent order.
        Long firstUserId = Math.min(senderId, recipientId);
        Long secondUserId = Math.max(senderId, recipientId);

        Wallet firstWallet = walletRepository
                .findByUserIdForUpdate(firstUserId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Sender or recipient wallet not found"));

        Wallet secondWallet = walletRepository
                .findByUserIdForUpdate(secondUserId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Sender or recipient wallet not found"));

        Wallet senderWallet = senderId.equals(firstUserId)
                ? firstWallet : secondWallet;

        Wallet recipientWallet = recipientId.equals(firstUserId)
                ? firstWallet : secondWallet;

        // Debit sender and credit recipient.
        senderWallet.debit(amount);
        recipientWallet.credit(amount);

        // Record both sides of the transfer.
        transactionRepository.save(new Transaction(
                senderWallet,
                TransactionType.TRANSFER_OUT,
                TransactionStatus.SUCCESS,
                amount));

        transactionRepository.save(new Transaction(
                recipientWallet,
                TransactionType.TRANSFER_IN,
                TransactionStatus.SUCCESS,
                amount));
    }
}