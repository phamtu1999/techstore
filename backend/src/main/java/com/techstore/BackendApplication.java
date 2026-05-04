package com.techstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.boot.CommandLineRunner;

import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableAsync
@EnableAspectJAutoProxy
@EnableScheduling
public class BackendApplication {

	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

/*
	@Bean
	CommandLineRunner cleanupSuperAdminOrders(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				// Find superadmin user ID
				String userId = jdbcTemplate.queryForObject(
					"SELECT id FROM users WHERE email = 'admin@techstore.com'", String.class);
				
				if (userId != null) {
					System.out.println("🔄 CLEANUP: Found superadmin (ID: " + userId + "). Proceeding to delete orders...");
					
					// Delete in order to satisfy foreign keys: items -> payments -> orders
					// Note: Payments might be linked directly to orders
					int itemsDeleted = jdbcTemplate.update("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", userId);
					int paymentsDeleted = jdbcTemplate.update("DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", userId);
					int ordersDeleted = jdbcTemplate.update("DELETE FROM orders WHERE user_id = ?", userId);
					
					if (ordersDeleted > 0) {
						System.out.println("✅ CLEANUP: Deleted " + ordersDeleted + " orders, " + itemsDeleted + " items, " + paymentsDeleted + " payments for superadmin.");
					} else {
						System.out.println("ℹ️ CLEANUP: No orders found for superadmin.");
					}
				}
			} catch (org.springframework.dao.EmptyResultDataAccessException e) {
				System.out.println("ℹ️ CLEANUP: Superadmin user not found by email.");
			} catch (Exception e) {
				System.err.println("❌ CLEANUP: Error during order deletion: " + e.getMessage());
			}
		};
	}
*/

	@Bean
	public CommandLineRunner clearCacheOnStartup(RedisConnectionFactory connectionFactory) {
		return args -> {
			try (RedisConnection connection = connectionFactory.getConnection()) {
				connection.serverCommands().flushDb();
				System.out.println("✅ DEPLOYMENT: Redis cache flushed successfully.");
			} catch (Exception e) {
				// ⚠️ Không crash app - Redis có thể chưa sẵn sàng lúc khởi động
				System.err.println("⚠️ DEPLOYMENT: Redis not available, skipping cache flush. Reason: " + e.getMessage());
				System.err.println("   App will continue running. Redis will connect when available.");
			}
		};
	}
}
