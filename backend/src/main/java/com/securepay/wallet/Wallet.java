
package com.securepay.wallet;

import com.securepay.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
        name = "wallets",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_wallets_user_id",
                        columnNames = "user_id"
                )
        }
)
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    @Column(
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Wallet() {
        // Required by JPA
    }

    public Wallet(User user) {
        this.user = user;
        this.balance = BigDecimal.ZERO;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }


    public void credit(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Credit amount must be greater than zero"
            );
        }

        this.balance = this.balance.add(amount);
    }

    public void debit(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Debit amount must be greater than zero"
            );
        }

        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalArgumentException(
                    "Insufficient wallet balance"
            );
        }

        this.balance = this.balance.subtract(amount);
    }
}