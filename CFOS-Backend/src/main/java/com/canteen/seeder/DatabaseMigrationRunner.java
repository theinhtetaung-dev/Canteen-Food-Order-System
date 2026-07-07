package com.canteen.seeder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1) // Run before other CommandLineRunners (like DatabaseSeeder)
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Starting database status migration check...");
        try {
            // Update Tbl_User statuses to uppercase to match UserStatus enum
            int updatedUsersActive = jdbcTemplate.update(
                "UPDATE Tbl_User SET Status = 'ACTIVE' WHERE LOWER(Status) = 'active' AND Status != 'ACTIVE'"
            );
            int updatedUsersInactive = jdbcTemplate.update(
                "UPDATE Tbl_User SET Status = 'INACTIVE' WHERE LOWER(Status) = 'inactive' AND Status != 'INACTIVE'"
            );
            log.info("Migrated User statuses: ACTIVE={}, INACTIVE={}", updatedUsersActive, updatedUsersInactive);

            // Update Tbl_Order statuses to uppercase to match Status enum
            int updatedOrdersPending = jdbcTemplate.update(
                "UPDATE Tbl_Order SET order_status = 'PENDING' WHERE LOWER(order_status) = 'pending' AND order_status != 'PENDING'"
            );
            int updatedOrdersComplete = jdbcTemplate.update(
                "UPDATE Tbl_Order SET order_status = 'COMPLETE' WHERE LOWER(order_status) = 'complete' AND order_status != 'COMPLETE'"
            );
            int updatedOrdersCancel = jdbcTemplate.update(
                "UPDATE Tbl_Order SET order_status = 'CANCEL' WHERE LOWER(order_status) = 'cancel' AND order_status != 'CANCEL'"
            );
            log.info("Migrated Order statuses: PENDING={}, COMPLETE={}, CANCEL={}", 
                updatedOrdersPending, updatedOrdersComplete, updatedOrdersCancel);

        } catch (Exception e) {
            log.error("Failed to run database migration update", e);
        }
    }
}
