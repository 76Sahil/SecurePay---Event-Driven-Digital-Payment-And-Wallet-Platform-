package com.securepay.migration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class FlywayMigrationTest {

    @Autowired
    private Flyway flyway;

    @Test
    void shouldSuccessfullyApplyAllFlywayMigrations() {
        MigrationInfo[] appliedMigrations = flyway.info().applied();

        assertThat(appliedMigrations)
                .isNotEmpty()
                .hasSize(7);

        assertThat(appliedMigrations[0].getDescription()).isEqualTo("create users table");
        assertThat(appliedMigrations[1].getDescription()).isEqualTo("create wallets table");
        assertThat(appliedMigrations[2].getDescription()).isEqualTo("create wallet transactions table");
        assertThat(appliedMigrations[3].getDescription()).isEqualTo("create beneficiaries table");
        assertThat(appliedMigrations[4].getDescription()).isEqualTo("enhance users table");
        assertThat(appliedMigrations[5].getDescription()).isEqualTo("create idempotency and ledger tables");
        assertThat(appliedMigrations[6].getDescription()).isEqualTo("create merchants and api keys tables");

        assertThat(flyway.info().current().getVersion().getVersion()).isEqualTo("7");
    }
}
