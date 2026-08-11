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
import java.math.BigDecimal;
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
        jdbcTemplate.execute("TRUNCATE TABLE tbl_branch");
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

        // 2. Seed Roles
        log.info("Seeding Roles...");
        Role adminRole = createRole("Admin");
        Role managerRole = createRole("Manager");
        Role userRole = createRole("User");
        
        roleRepository.saveAll(List.of(adminRole, managerRole, userRole));

        // 3. Seed Permissions
        log.info("Seeding Permissions...");
        List<Permission> permissions = seedPermissions();

        // 4. Seed Role Permissions
        log.info("Seeding Role Permissions...");
        List<RolePermission> rolePermissions = new ArrayList<>();
        
        // Admin and Manager get all permissions
        for (Permission p : permissions) {
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

        // 5. Seed Users
        log.info("Seeding Users...");
        User superAdminUser = new User();
        superAdminUser.setUserName("superadmin");
        superAdminUser.setFullName("Super Administrator");
        superAdminUser.setEmail("superadmin@canteen.com");
        superAdminUser.setPasswordHash(passwordEncoder.encode("superadmin123"));
        superAdminUser.setPhoneNumber("1112223333");
        superAdminUser.setStatus(UserStatus.ACTIVE);
        superAdminUser.setRole(adminRole);

        User managerUser = new User();
        managerUser.setUserName("manager");
        managerUser.setFullName("Kitchen Manager");
        managerUser.setEmail("manager@canteen.com");
        managerUser.setPasswordHash(passwordEncoder.encode("manager123"));
        managerUser.setPhoneNumber("4445556666");
        managerUser.setStatus(UserStatus.ACTIVE);
        managerUser.setRole(managerRole);
        
        User normalUser = new User();
        normalUser.setUserName("user");
        normalUser.setFullName("Normal User");
        normalUser.setEmail("user@canteen.com");
        normalUser.setPasswordHash(passwordEncoder.encode("user123"));
        normalUser.setPhoneNumber("0987654321");
        normalUser.setStatus(UserStatus.ACTIVE);
        normalUser.setRole(userRole);

        userRepository.saveAll(List.of(superAdminUser, managerUser, normalUser));

        // 5.5 Seed Canteens/Branches
        log.info("Seeding Canteens...");
        Branch mainCanteen = new Branch();
        mainCanteen.setBranchName("Main Canteen");
        mainCanteen.setLocation("Building A, Ground Floor");

        Branch northCanteen = new Branch();
        northCanteen.setBranchName("North Canteen");
        northCanteen.setLocation("Building C, 1st Floor");

        branchRepository.saveAll(List.of(mainCanteen, northCanteen));
        branchRepository.flush();

        try {
            jdbcTemplate.execute("INSERT INTO tbl_branch (branchid, branch_name, location, delete_flag) VALUES (1, 'Main Canteen', 'Building A, Ground Floor', 0)");
            jdbcTemplate.execute("INSERT INTO tbl_branch (branchid, branch_name, location, delete_flag) VALUES (2, 'North Canteen', 'Building C, 1st Floor', 0)");
        } catch (Exception e1) {
            try {
                jdbcTemplate.execute("INSERT INTO tbl_branch (BranchID, BranchName, Location, DeleteFlag) VALUES (1, 'Main Canteen', 'Building A, Ground Floor', 0)");
                jdbcTemplate.execute("INSERT INTO tbl_branch (BranchID, BranchName, Location, DeleteFlag) VALUES (2, 'North Canteen', 'Building C, 1st Floor', 0)");
            } catch (Exception e2) {
                try {
                    jdbcTemplate.execute("INSERT INTO tbl_branch (branchid, branchname, location, deleteflag) VALUES (1, 'Main Canteen', 'Building A, Ground Floor', 0)");
                    jdbcTemplate.execute("INSERT INTO tbl_branch (branchid, branchname, location, deleteflag) VALUES (2, 'North Canteen', 'Building C, 1st Floor', 0)");
                } catch (Exception e3) {
                    log.warn("Failed legacy tbl_branch insert: " + e3.getMessage());
                }
            }
        }

        // 6. Seed Food Categories
        log.info("Seeding Food Categories...");
        FoodCategory mainCourse = createCategory("Main Course", "Heavy meals for lunch or dinner", superAdminUser);
        FoodCategory dessert = createCategory("Dessert", "Sweet treats after meals", superAdminUser);
        FoodCategory beverage = createCategory("Beverage", "Drinks and refreshments", superAdminUser);
        
        foodCategoryRepository.saveAll(List.of(mainCourse, dessert, beverage));

        // 7. Seed Food Items
        log.info("Seeding Food Items...");
        List<Food> foods = new ArrayList<>();

        // Main Canteen Foods
        foods.add(createFood("Chicken Fried Rice", "Delicious chicken fried rice with fresh veggies", new BigDecimal("3500.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=600"));
        foods.add(createFood("Spicy Noodle Soup", "Hot and spicy noodle soup with chicken", new BigDecimal("2800.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600"));
        foods.add(createFood("Grilled Chicken Burger", "Juicy grilled chicken burger with cheese", new BigDecimal("4500.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"));
        foods.add(createFood("Classic Club Sandwich", "Double decker sandwich with chicken and egg", new BigDecimal("3200.00"), mainCourse, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600"));
        foods.add(createFood("Chocolate Lava Cake", "Warm chocolate cake with molten center", new BigDecimal("2000.00"), dessert, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600"));
        foods.add(createFood("Strawberry Waffle", "Fresh waffles topped with strawberry syrup", new BigDecimal("2500.00"), dessert, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"));
        foods.add(createFood("Mango Pudding", "Sweet mango pudding with fresh cream", new BigDecimal("1500.00"), dessert, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=600"));
        foods.add(createFood("Iced Caffe Latte", "Chilled espresso with fresh milk", new BigDecimal("1800.00"), beverage, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600"));
        foods.add(createFood("Fresh Lemonade", "Squeezed lemons with ice and mint", new BigDecimal("1200.00"), beverage, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=600"));
        foods.add(createFood("Green Tea Matcha", "Authentic iced green tea matcha", new BigDecimal("2200.00"), beverage, superAdminUser, mainCanteen, "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600"));

        // North Canteen Foods
        foods.add(createFood("Beef Fried Rice", "Savory beef fried rice with garlic", new BigDecimal("4000.00"), mainCourse, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600"));
        foods.add(createFood("Tom Yum Noodle", "Sour and spicy Thai noodle soup", new BigDecimal("3000.00"), mainCourse, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600"));
        foods.add(createFood("Cheese Pizza Slice", "Freshly baked pizza slice with mozzarella", new BigDecimal("2500.00"), mainCourse, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600"));
        foods.add(createFood("Crispy Chicken Strips", "Golden fried chicken strips with dip", new BigDecimal("3500.00"), mainCourse, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=600"));
        foods.add(createFood("Vanilla Cheesecake", "Creamy cheesecake on graham crust", new BigDecimal("2800.00"), dessert, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1524351199679-46cddf530c04?q=80&w=600"));
        foods.add(createFood("Chocolate Brownie", "Fudgy chocolate brownie with walnuts", new BigDecimal("1800.00"), dessert, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=600"));
        foods.add(createFood("Fruit Salad Bowl", "Assorted seasonal fresh fruits", new BigDecimal("2200.00"), dessert, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1519996521430-02b798c1d881?q=80&w=600"));
        foods.add(createFood("Bubble Milk Tea", "Classic milk tea with tapioca pearls", new BigDecimal("2500.00"), beverage, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600"));
        foods.add(createFood("Iced Peach Tea", "Brewed black tea with sweet peach syrup", new BigDecimal("1500.00"), beverage, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600"));
        foods.add(createFood("Mocha Frappe", "Blended coffee, chocolate, and milk", new BigDecimal("2800.00"), beverage, superAdminUser, northCanteen, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600"));

        foodRepository.saveAll(foods);

        log.info("Database seeding completed successfully.");
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
