package com.securepay.ledger;

import com.securepay.transaction.WalletTransaction;
import com.securepay.wallet.Wallet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class LedgerService {

    private final LedgerEntryRepository ledgerEntryRepository;

    public LedgerService(LedgerEntryRepository ledgerEntryRepository) {
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Transactional
    public LedgerEntry recordEntry(
            WalletTransaction transaction,
            Wallet wallet,
            LedgerEntryType entryType,
            BigDecimal amount,
            BigDecimal balanceAfter,
            String description) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Ledger entry amount must be strictly positive.");
        }

        LedgerEntry entry = new LedgerEntry();
        entry.setTransaction(transaction);
        entry.setWallet(wallet);
        entry.setEntryType(entryType);
        entry.setAmount(amount);
        entry.setCurrency(wallet.getCurrency());
        entry.setBalanceAfter(balanceAfter);
        entry.setDescription(description);

        return ledgerEntryRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public List<LedgerEntry> getEntriesForWallet(Wallet wallet) {
        return ledgerEntryRepository.findByWalletOrderByCreatedAtDesc(wallet);
    }

    @Transactional(readOnly = true)
    public List<LedgerEntry> getEntriesForTransaction(WalletTransaction transaction) {
        return ledgerEntryRepository.findByTransaction(transaction);
    }
}
