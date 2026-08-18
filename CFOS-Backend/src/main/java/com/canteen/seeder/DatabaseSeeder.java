package com.canteen.seeder;

import com.canteen.model.*;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.jdbc.core.JdbcTemplate;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seeder.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;
    private final FoodCategoryRepository foodCategoryRepository;
    private final FoodRepository foodRepository;
    private final BranchRepository branchRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final JdbcTemplate jdbcTemplate;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedDatabase();
    }

    private void seedDatabase() {
        log.info("Starting database seeding process...");

        // Copy food photos to uploads/food-images directory
        copyFoodPhotosToUploads();

        // 1. Clear existing data in correct order to avoid foreign key constraints
        log.info("Clearing existing data...");
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_notification");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_payment");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_order_item");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_order");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_food");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_food_category");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_user");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_canteen");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_role_permission");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_permission");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_role");
        jdbcTemplate.execute("TRUNCATE TABLE tbl_review");
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

        // 2. Seed Roles
        log.info("Seeding Roles...");
        Role superAdminRole = createRole("SuperAdmin");
        Role adminRole = createRole("Admin");
        Role managerRole = createRole("Manager");
        Role userRole = createRole("User");
        
        roleRepository.saveAll(List.of(superAdminRole, adminRole, managerRole, userRole));

        // 3. Seed Permissions
        log.info("Seeding Permissions...");
        List<Permission> permissions = seedPermissions();

        // 4. Seed Role Permissions
        log.info("Seeding Role Permissions...");
        List<RolePermission> rolePermissions = new ArrayList<>();
        
        // SuperAdmin, Admin and Manager get all permissions
        for (Permission p : permissions) {
            RolePermission rpSuperAdmin = new RolePermission();
            rpSuperAdmin.setRole(superAdminRole);
            rpSuperAdmin.setPermission(p);
            rolePermissions.add(rpSuperAdmin);

            RolePermission rpAdmin = new RolePermission();
            rpAdmin.setRole(adminRole);
            rpAdmin.setPermission(p);
            rolePermissions.add(rpAdmin);

            RolePermission rpManager = new RolePermission();
            rpManager.setRole(managerRole);
            rpManager.setPermission(p);
            rolePermissions.add(rpManager);
        }
        
        // User gets Read permissions for Food and FoodCategory
        for (Permission p : permissions) {
            if ("Read".equals(p.getActionName()) && 
                ("Food".equals(p.getMenuName()) || "FoodCategory".equals(p.getMenuName()))) {
                RolePermission rp = new RolePermission();
                rp.setRole(userRole);
                rp.setPermission(p);
                rolePermissions.add(rp);
            }
        }
        rolePermissionRepository.saveAll(rolePermissions);

        // 5. Seed Canteens/Branches
        log.info("Seeding Canteens...");
        Branch mainCanteen = new Branch();
        mainCanteen.setBranchName("Main Canteen");
        mainCanteen.setLocation("Building A, Ground Floor");

        Branch northCanteen = new Branch();
        northCanteen.setBranchName("North Canteen");
        northCanteen.setLocation("Building C, 1st Floor");

        Branch southCanteen = new Branch();
        southCanteen.setBranchName("South Canteen");
        southCanteen.setLocation("Building B, Basement");

        branchRepository.saveAll(List.of(mainCanteen, northCanteen, southCanteen));
        branchRepository.flush();

        // 5.5 Seed Users
        log.info("Seeding Users...");
        User superAdminUser = new User();
        superAdminUser.setUserName("superadmin");
        superAdminUser.setFullName("Super Administrator");
        superAdminUser.setEmail("superadmin@canteen.com");
        superAdminUser.setPasswordHash(passwordEncoder.encode("superadmin123"));
        superAdminUser.setPhoneNumber("1112223333");
        superAdminUser.setStatus(UserStatus.ACTIVE);
        superAdminUser.setRole(superAdminRole);

        User managerUser = new User();
        managerUser.setUserName("manager");
        managerUser.setFullName("Central Canteen Manager");
        managerUser.setEmail("manager@canteen.com");
        managerUser.setPasswordHash(passwordEncoder.encode("manager123"));
        managerUser.setPhoneNumber("4445556666");
        managerUser.setStatus(UserStatus.ACTIVE);
        managerUser.setRole(managerRole);
        managerUser.setCanteen(mainCanteen);

        User managerUser2 = new User();
        managerUser2.setUserName("manager2");
        managerUser2.setFullName("Garden Bistro Manager");
        managerUser2.setEmail("manager2@canteen.com");
        managerUser2.setPasswordHash(passwordEncoder.encode("manager123"));
        managerUser2.setPhoneNumber("4445557777");
        managerUser2.setStatus(UserStatus.ACTIVE);
        managerUser2.setRole(managerRole);
        managerUser2.setCanteen(northCanteen);

        User managerUser3 = new User();
        managerUser3.setUserName("manager3");
        managerUser3.setFullName("Skyline Cafeteria Manager");
        managerUser3.setEmail("manager3@canteen.com");
        managerUser3.setPasswordHash(passwordEncoder.encode("manager123"));
        managerUser3.setPhoneNumber("4445558888");
        managerUser3.setStatus(UserStatus.ACTIVE);
        managerUser3.setRole(managerRole);
        managerUser3.setCanteen(southCanteen);
        
        User normalUser = new User();
        normalUser.setUserName("user");
        normalUser.setFullName("Normal User");
        normalUser.setEmail("user@canteen.com");
        normalUser.setPasswordHash(passwordEncoder.encode("user123"));
        normalUser.setPhoneNumber("0987654321");
        normalUser.setStatus(UserStatus.ACTIVE);
        normalUser.setRole(userRole);

        userRepository.saveAll(List.of(superAdminUser, managerUser, managerUser2, managerUser3, normalUser));

        // 6. Seed Food Categories
        log.info("Seeding Food Categories...");
        FoodCategory mainCourse = createCategory("Main Course", "Heavy meals for lunch or dinner", superAdminUser);
        FoodCategory dessert = createCategory("Dessert", "Sweet treats after meals", superAdminUser);
        FoodCategory beverage = createCategory("Beverage", "Drinks and refreshments", superAdminUser);
        
        foodCategoryRepository.saveAll(List.of(mainCourse, dessert, beverage));

        // 7. Seed Food Items
        log.info("Seeding Food Items...");
        List<Food> foods = new ArrayList<>();

        // Main Canteen Foods (10 items) - Using Online URLs (Unsplash)
        foods.add(createFood("Chicken Fried Rice", "Delicious chicken fried rice with fresh veggies", new BigDecimal("3500.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=600"));
        foods.add(createFood("Spicy Noodle Soup", "Hot and spicy noodle soup with chicken", new BigDecimal("2800.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600"));
        foods.add(createFood("Grilled Chicken Burger", "Juicy grilled chicken burger with cheese", new BigDecimal("4500.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"));
        foods.add(createFood("Classic Club Sandwich", "Double decker sandwich with chicken and egg", new BigDecimal("3200.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600"));
        foods.add(createFood("Margherita Pizza", "Classic tomato sauce and mozzarella cheese", new BigDecimal("5000.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=600"));
        foods.add(createFood("Chocolate Lava Cake", "Warm chocolate cake with molten center", new BigDecimal("2000.00"), dessert, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600"));
        foods.add(createFood("Strawberry Waffle", "Fresh waffles topped with strawberry syrup", new BigDecimal("2500.00"), dessert, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"));
        foods.add(createFood("Mango Pudding", "Sweet mango pudding with fresh cream", new BigDecimal("1500.00"), dessert, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=600"));
        foods.add(createFood("Iced Caffe Latte", "Chilled espresso with fresh milk", new BigDecimal("1800.00"), beverage, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600"));
        foods.add(createFood("Fresh Lemonade", "Squeezed lemons with ice and mint", new BigDecimal("1200.00"), beverage, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=600"));

        // North Canteen Foods (10 items) - Using real local image paths from resources
        foods.add(createFood("Traditional Mohinga", "Traditional Myanmar rice noodle soup with fish broth", new BigDecimal("2000.00"), mainCourse, superAdminUser, northCanteen, "/food-images/Mohinga.jpg"));
        foods.add(createFood("Shan Noodles", "Traditional Shan style rice noodles with chicken", new BigDecimal("2500.00"), mainCourse, superAdminUser, northCanteen, "/food-images/Shan Noodles.webp"));
        foods.add(createFood("Nan Gyi Thoke", "Thick rice noodle salad with chicken curry", new BigDecimal("2800.00"), mainCourse, superAdminUser, northCanteen, "/food-images/Nan Gyi Thoke.jpg"));
        foods.add(createFood("Tea Leaf Salad", "Traditional Myanmar fermented tea leaf salad", new BigDecimal("2200.00"), mainCourse, superAdminUser, northCanteen, "/food-images/Tea Leaf Salad.jpg"));
        foods.add(createFood("Basil Fried Rice", "Spicy and fragrant fried rice with basil", new BigDecimal("3000.00"), mainCourse, superAdminUser, northCanteen, "/food-images/Basil Fried Rice.jpg"));
        foods.add(createFood("Crispy Samosa", "Deep fried pastry filled with spiced potatoes and peas", new BigDecimal("1000.00"), dessert, superAdminUser, northCanteen, "/food-images/Samosa.jpeg"));
        foods.add(createFood("Shwe Yin Aye", "Sweet Myanmar dessert with coconut milk, jelly, sticky rice and bread", new BigDecimal("1800.00"), dessert, superAdminUser, northCanteen, "/food-images/Shwe Yin Aye.jpg"));
        foods.add(createFood("Myanmar Traditional Tea", "Freshly brewed sweet and creamy milk tea", new BigDecimal("1200.00"), beverage, superAdminUser, northCanteen, "/food-images/Myanmar Traditional Tea.jpg"));
        foods.add(createFood("Iced Coffee", "Chilled brewed coffee served with ice", new BigDecimal("1500.00"), beverage, superAdminUser, northCanteen, "/food-images/Iced Coffee.jpg"));
        foods.add(createFood("Fresh Coconut Water", "Natural, refreshing coconut water", new BigDecimal("1500.00"), beverage, superAdminUser, northCanteen, "/food-images/Coconut Water.jpg"));

        // South Canteen Foods (10 items) - Using real local image paths from resources
        foods.add(createFood("Chicken Dry Noodles", "Savory dry noodles served with tender chicken slices", new BigDecimal("2600.00"), mainCourse, superAdminUser, southCanteen, "/food-images/Chicken Dry Noodles.jpg"));
        foods.add(createFood("Claypot Meeshay", "Hot claypot rice noodles with pork and pickled veggies", new BigDecimal("3000.00"), mainCourse, superAdminUser, southCanteen, "/food-images/Claypot Meeshay.jpg"));
        foods.add(createFood("Crispy Chicken Burger", "Crispy fried chicken patty in a toasted bun with mayo", new BigDecimal("4000.00"), mainCourse, superAdminUser, southCanteen, "/food-images/Chicken Burger.jpg"));
        foods.add(createFood("Spaghetti Bolognese", "Spaghetti pasta with rich tomato minced beef sauce", new BigDecimal("4500.00"), mainCourse, superAdminUser, southCanteen, "/food-images/Spaghetti.jpg"));
        foods.add(createFood("Spicy Tom Yum Soup", "Spicy and sour soup with shrimp and lemongrass", new BigDecimal("3500.00"), mainCourse, superAdminUser, southCanteen, "/food-images/Tom Yum Soup.jpg"));
        foods.add(createFood("Sweet Falooda", "Layered dessert with rose syrup, vermicelli, sweet basil seeds and ice cream", new BigDecimal("2500.00"), dessert, superAdminUser, southCanteen, "/food-images/Falooda.jpg"));
        foods.add(createFood("Caramel Pudding", "Smooth and creamy caramel custard", new BigDecimal("1500.00"), dessert, superAdminUser, southCanteen, "/food-images/Pudding.jpg"));
        foods.add(createFood("Fresh Lemonade", "Refreshing lemonade with a touch of mint", new BigDecimal("1200.00"), beverage, superAdminUser, southCanteen, "/food-images/Lemonade.jpg"));
        foods.add(createFood("Chocolate Milkshake", "Rich and creamy chocolate milkshake", new BigDecimal("2200.00"), beverage, superAdminUser, southCanteen, "/food-images/Chocolate Milkshake.jpg"));
        foods.add(createFood("Fresh Mango Juice", "Freshly blended sweet ripe mangoes", new BigDecimal("1800.00"), beverage, superAdminUser, southCanteen, "/food-images/Mango Juice.jpg"));

        foodRepository.saveAll(foods);

        log.info("Database seeding completed successfully.");
    }

    private void copyFoodPhotosToUploads() {
        log.info("Copying food photos to uploads folder...");
        try {
            Path sourceDir = Paths.get(System.getProperty("user.dir"), "src", "main", "resources", "Food_Photos", "Food_Photos");
            if (!Files.exists(sourceDir)) {
                log.warn("Source directory for photos not found at path: " + sourceDir);
                return;
            }
            
            Path targetDir = Paths.get(System.getProperty("user.dir"), "uploads", "food-images");
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }
            
            try (var stream = Files.list(sourceDir)) {
                stream.forEach(sourcePath -> {
                    if (Files.isRegularFile(sourcePath)) {
                        Path targetPath = targetDir.resolve(sourcePath.getFileName());
                        try {
                            Files.copy(sourcePath, targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                        } catch (IOException e) {
                            log.error("Failed to copy food photo: " + sourcePath.getFileName(), e);
                        }
                    }
                });
            }
            log.info("Successfully copied food photos to uploads folder.");
        } catch (Exception e) {
            log.error("Error while copying food photos to uploads folder", e);
        }
    }

    private Role createRole(String roleName) {
        Role role = new Role();
        role.setRoleName(roleName);
        return role;
    }

    private Permission createPermission(String menuName, String actionName) {
        Permission permission = new Permission();
        permission.setMenuName(menuName);
        permission.setActionName(actionName);
        return permission;
    }

    private List<Permission> seedPermissions() {
        List<Permission> permissions = new ArrayList<>();
        String[] menus = {"User", "Role", "Permission", "FoodCategory", "Food", "Order", "Payment"};
        String[] actions = {"Create", "Read", "Update", "Delete"};

        for (String menu : menus) {
            for (String action : actions) {
                permissions.add(createPermission(menu, action));
            }
        }
        return permissionRepository.saveAll(permissions);
    }

    private FoodCategory createCategory(String name, String description, User createdBy) {
        FoodCategory category = new FoodCategory();
        category.setCategoryName(name);
        category.setDescription(description);
        category.setCreatedBy(createdBy);
        return category;
    }

    private Food createFood(String name, String desc, BigDecimal price, FoodCategory category, User createdBy, Branch branch, String imageUrl) {
        Food food = new Food();
        food.setFoodName(name);
        food.setDescription(desc);
        food.setPrice(price);
        food.setCategory(category);
        food.setCreatedBy(createdBy);
        food.setBranch(branch);
        food.setImageUrl(imageUrl);
        return food;
    }
}
