package com.securepay.ledger;

import com.securepay.transaction.WalletTransaction;
import com.securepay.wallet.Wallet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LedgerServiceTest {

    @Mock
    private LedgerEntryRepository repository;

    @InjectMocks
    private LedgerService ledgerService;

    private Wallet wallet;
    private WalletTransaction transaction;

    @BeforeEach
    void setUp() {
        wallet = new Wallet();
        wallet.setBalance(new BigDecimal("1000.00"));
        wallet.setCurrency("INR");

        transaction = new WalletTransaction();
        transaction.setAmount(new BigDecimal("250.00"));
        transaction.setType("TRANSFER");
        transaction.setStatus("SUCCESS");
    }

    @Test
    void shouldRecordDebitEntryCorrectly() {
        when(repository.save(any(LedgerEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LedgerEntry entry = ledgerService.recordEntry(
                transaction,
                wallet,
                LedgerEntryType.DEBIT,
                new BigDecimal("250.00"),
                new BigDecimal("750.00"),
                "Debit transfer"
        );

        assertThat(entry).isNotNull();
        assertThat(entry.getEntryType()).isEqualTo(LedgerEntryType.DEBIT);
        assertThat(entry.getAmount()).isEqualByComparingTo("250.00");
        assertThat(entry.getBalanceAfter()).isEqualByComparingTo("750.00");
        assertThat(entry.getCurrency()).isEqualTo("INR");
        verify(repository).save(any(LedgerEntry.class));
    }

    @Test
    void shouldRecordCreditEntryCorrectly() {
        when(repository.save(any(LedgerEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LedgerEntry entry = ledgerService.recordEntry(
                transaction,
                wallet,
                LedgerEntryType.CREDIT,
                new BigDecimal("500.00"),
                new BigDecimal("1500.00"),
                "Credit top-up"
        );

        assertThat(entry).isNotNull();
        assertThat(entry.getEntryType()).isEqualTo(LedgerEntryType.CREDIT);
        assertThat(entry.getAmount()).isEqualByComparingTo("500.00");
        assertThat(entry.getBalanceAfter()).isEqualByComparingTo("1500.00");
        verify(repository).save(any(LedgerEntry.class));
    }

    @Test
    void shouldRejectNonPositiveAmount() {
        assertThatThrownBy(() -> ledgerService.recordEntry(
                transaction,
                wallet,
                LedgerEntryType.DEBIT,
                BigDecimal.ZERO,
                new BigDecimal("1000.00"),
                "Zero amount"
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("strictly positive");

        assertThatThrownBy(() -> ledgerService.recordEntry(
                transaction,
                wallet,
                LedgerEntryType.DEBIT,
                new BigDecimal("-50.00"),
                new BigDecimal("1000.00"),
                "Negative amount"
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("strictly positive");
    }

    @Test
    void shouldQueryEntriesForWallet() {
        when(repository.findByWalletOrderByCreatedAtDesc(wallet)).thenReturn(List.of(new LedgerEntry()));

        List<LedgerEntry> entries = ledgerService.getEntriesForWallet(wallet);

        assertThat(entries).hasSize(1);
        verify(repository).findByWalletOrderByCreatedAtDesc(wallet);
    }
}
