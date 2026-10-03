package com.securepay.ledger;

import com.securepay.transaction.WalletTransaction;
import com.securepay.wallet.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findByWalletOrderByCreatedAtDesc(Wallet wallet);

    List<LedgerEntry> findByTransaction(WalletTransaction transaction);
}
