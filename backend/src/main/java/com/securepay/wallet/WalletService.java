
package com.securepay.wallet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.securepay.transaction.Transaction;
import com.securepay.transaction.TransactionRepository;
import com.securepay.transaction.TransactionStatus;
import com.securepay.transaction.TransactionType;

import java.math.BigDecimal;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(
            WalletRepository walletRepository,
            TransactionRepository transactionRepository
    ) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Wallet addMoney(Long userId, BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }

        Wallet wallet = walletRepository
                .findByUserIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Wallet not found for user"
                ));

        wallet.credit(amount);
        Transaction transaction = new Transaction(
                wallet,
                TransactionType.TOP_UP,
                TransactionStatus.SUCCESS,
                amount
        );

        transactionRepository.save(transaction);

        return wallet;
    }
}