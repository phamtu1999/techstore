package com.techstore.config;

import com.techstore.entity.address.Address;
import com.techstore.entity.brand.Brand;
import com.techstore.entity.category.Category;
import com.techstore.entity.order.Coupon;
import com.techstore.entity.order.DiscountType;
import com.techstore.entity.product.Product;
import com.techstore.entity.product.ProductVariant;
import com.techstore.entity.user.Role;
import com.techstore.entity.user.User;
import com.techstore.repository.brand.BrandRepository;
import com.techstore.repository.category.CategoryRepository;
import com.techstore.repository.order.CouponRepository;
import com.techstore.repository.product.ProductRepository;
import com.techstore.repository.user.UserRepository;
import com.techstore.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Profile("!prod")
@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate transactionTemplate;

    @Value("${app.seed.demo-users.enabled:false}")
    private boolean demoUsersEnabled;

    @Value("${app.seed.demo-users.admin-password:}")
    private String demoAdminPassword;

    @Value("${app.seed.demo-users.customer-password:}")
    private String demoCustomerPassword;

    @Override
    public void run(String... args) {
        try {
            // Chờ DB ổn định (Tránh lỗi connection khi khởi động trên môi trường Cloud)
            Thread.sleep(5000);
            executeInitialization();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Startup initialization failed: {}", e.getMessage());
        }
    }

    protected void executeInitialization() {
        if (demoUsersEnabled) {
            try {
                transactionTemplate.executeWithoutResult(status -> {
                    if (userRepository.count() == 0) {
                        seedUsers();
                    }
                });
            } catch (Exception e) {
                log.error("FAILED TO SEED USERS: {}", e.getMessage());
            }
        }

        try {
            transactionTemplate.executeWithoutResult(status -> {
                if (categoryRepository.count() == 0) {
                    seedCategoriesAndBrands();
                }
            });
        } catch (Exception e) {
            log.error("FAILED TO SEED CATEGORIES/BRANDS: {}", e.getMessage());
        }

        try {
            transactionTemplate.executeWithoutResult(status -> {
                if (couponRepository.count() == 0) {
                    seedCoupons();
                }
            });
        } catch (Exception e) {
            log.error("FAILED TO SEED COUPONS: {}", e.getMessage());
        }
        
        try {
            transactionTemplate.executeWithoutResult(status -> {
                migrateProductSlugs();
            });
        } catch (Exception e) {
            log.error("FAILED TO MIGRATE SLUGS: {}", e.getMessage());
        }
    }

    private void migrateProductSlugs() {
        List<Product> products = productRepository.findAll();
        boolean hasChanges = false;
        
        for (Product product : products) {
            if (product.getCategory() == null) continue;
            
            Category category = product.getCategory();
            String prefix = category.getName();
            if (category.getParent() != null && !category.getParent().getSlug().equals("dien-tu")) {
                prefix = category.getParent().getName() + " " + prefix;
            }
            String expectedSlug = SlugUtils.deduplicate(SlugUtils.makeSlug(prefix + " " + product.getName()));
            String currentSlug = product.getSlug();
            
            if (currentSlug == null || !currentSlug.equals(expectedSlug)) {
                product.setSlug(expectedSlug);
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            productRepository.saveAll(products);
            log.info(">>> SLUG MIGRATION COMPLETED");
        }
    }

    private void seedUsers() {
        if (demoAdminPassword == null || demoAdminPassword.isBlank()
                || demoCustomerPassword == null || demoCustomerPassword.isBlank()) {
            return;
        }

        User admin = User.builder()
                .fullName("System Admin")
                .email("admin@techstore.com")
                .password(passwordEncoder.encode(demoAdminPassword))
                .role(Role.ROLE_ADMIN)
                .active(true)
                .status(com.techstore.entity.user.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        userRepository.save(admin);

        User customer = User.builder()
                .fullName("John Doe")
                .email("customer@gmail.com")
                .password(passwordEncoder.encode(demoCustomerPassword))
                .role(Role.ROLE_CUSTOMER)
                .active(true)
                .status(com.techstore.entity.user.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
        
        Address address = Address.builder()
                .user(customer)
                .receiverName("John Doe")
                .phone("0987654321")
                .province("Hồ Chí Minh")
                .district("Quận 1")
                .ward("Phường Bến Nghé")
                .detailedAddress("123 Lê Lợi")
                .isDefault(true)
                .build();
        customer.setAddresses(new java.util.ArrayList<>(List.of(address)));
        userRepository.save(customer);
    }

    private void seedCategoriesAndBrands() {
        Brand apple = brandRepository.save(Brand.builder().name("Apple").slug("apple").build());
        brandRepository.save(Brand.builder().name("Samsung").slug("samsung").build());
        brandRepository.save(Brand.builder().name("Xiaomi").slug("xiaomi").build());
        brandRepository.save(Brand.builder().name("ASUS").slug("asus").build());
        brandRepository.save(Brand.builder().name("HP").slug("hp").build());
        brandRepository.save(Brand.builder().name("Dell").slug("dell").build());
        brandRepository.save(Brand.builder().name("Acer").slug("acer").build());
        brandRepository.save(Brand.builder().name("Lenovo").slug("lenovo").build());
        brandRepository.save(Brand.builder().name("Sony").slug("sony").build());
        brandRepository.save(Brand.builder().name("MSI").slug("msi").build());

        Category electronics = categoryRepository.save(Category.builder()
                .name("Điện tử")
                .slug("dien-tu")
                .imageUrl("https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400")
                .active(true)
                .sortOrder(1)
                .build());

        Category smartphone = categoryRepository.save(Category.builder()
                .name("Điện thoại")
                .slug("dien-thoai")
                .imageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400")
                .parent(electronics)
                .active(true)
                .sortOrder(1)
                .build());

        Category iphone = categoryRepository.save(Category.builder()
                .name("iPhone")
                .slug("iphone")
                .imageUrl("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400")
                .parent(smartphone)
                .active(true)
                .sortOrder(1)
                .build());

        seedIphoneProduct(iphone, apple);
    }

    private void seedIphoneProduct(Category category, Brand brand) {
        Product iphone15 = Product.builder()
                .name("iPhone 15 Pro Max")
                .slug(SlugUtils.makeSlug(category.getName() + " " + "iPhone 15 Pro Max"))
                .description("iPhone 15 Pro Max - Chiếc iPhone mạnh mẽ nhất...")
                .category(category)
                .brand(brand)
                .active(true)
                .build();

        ProductVariant v1 = ProductVariant.builder()
                .product(iphone15)
                .sku("IP15PM-256-BLUE")
                .name("256GB - Blue Titanium")
                .price(new BigDecimal("32000000"))
                .stockQuantity(50)
                .color("Blue")
                .size("256GB")
                .build();

        iphone15.setVariants(new java.util.HashSet<>(Set.of(v1)));
        productRepository.save(iphone15);
    }

    private void seedCoupons() {
        couponRepository.save(Coupon.builder()
                .code("TECHSTORE2024")
                .discountType(DiscountType.PERCENT)
                .discountValue(new BigDecimal("10"))
                .maxDiscount(new BigDecimal("500000"))
                .minPurchase(new BigDecimal("2000000"))
                .expirationDate(Instant.now().plus(30, ChronoUnit.DAYS))
                .usageLimit(100)
                .active(true)
                .build());
    }
}
