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
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

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
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        foodRepository.deleteAll();
        foodCategoryRepository.deleteAll();
        userRepository.deleteAll();
        rolePermissionRepository.deleteAll();
        permissionRepository.deleteAll();
        roleRepository.deleteAll();

        roleRepository.flush(); // Force deletes to be executed before inserts

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
        
        // Admin gets all permissions
        for (Permission p : permissions) {
            RolePermission rp = new RolePermission();
            rp.setRole(adminRole);
            rp.setPermission(p);
            rolePermissions.add(rp);
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
        User adminUser = new User();
        adminUser.setUserName("admin");
        adminUser.setFullName("Administrator");
        adminUser.setEmail("admin@canteen.com");
        adminUser.setPasswordHash(passwordEncoder.encode("admin123"));
        adminUser.setPhoneNumber("1234567890");
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setRole(adminRole);
        
        User normalUser = new User();
        normalUser.setUserName("user");
        normalUser.setFullName("Normal User");
        normalUser.setEmail("user@canteen.com");
        normalUser.setPasswordHash(passwordEncoder.encode("user123"));
        normalUser.setPhoneNumber("0987654321");
        normalUser.setStatus(UserStatus.ACTIVE);
        normalUser.setRole(userRole);

        userRepository.saveAll(List.of(adminUser, normalUser));

        // 6. Seed Food Categories
        log.info("Seeding Food Categories...");
        FoodCategory mainCourse = createCategory("Main Course", "Heavy meals for lunch or dinner", adminUser);
        FoodCategory dessert = createCategory("Dessert", "Sweet treats after meals", adminUser);
        FoodCategory beverage = createCategory("Beverage", "Drinks and refreshments", adminUser);
        
        foodCategoryRepository.saveAll(List.of(mainCourse, dessert, beverage));

        // 7. Seed Food Items
        log.info("Seeding Food Items...");
        Food food1 = createFood("Fried Rice", "Delicious chicken fried rice", new BigDecimal("3500.00"), mainCourse, adminUser);
        Food food2 = createFood("Noodle Soup", "Hot and spicy noodle soup", new BigDecimal("2500.00"), mainCourse, adminUser);
        
        Food food3 = createFood("Ice Cream", "Vanilla and chocolate mix", new BigDecimal("1500.00"), dessert, adminUser);
        Food food4 = createFood("Pudding", "Caramel custard pudding", new BigDecimal("1200.00"), dessert, adminUser);
        
        Food food5 = createFood("Coffee", "Hot brewed coffee", new BigDecimal("800.00"), beverage, adminUser);
        Food food6 = createFood("Orange Juice", "Fresh squeezed orange juice", new BigDecimal("1000.00"), beverage, adminUser);

        foodRepository.saveAll(List.of(food1, food2, food3, food4, food5, food6));

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

    private Food createFood(String name, String desc, BigDecimal price, FoodCategory category, User createdBy) {
        Food food = new Food();
        food.setFoodName(name);
        food.setDescription(desc);
        food.setPrice(price);
        food.setCategory(category);
        food.setCreatedBy(createdBy);
        return food;
    }
}
