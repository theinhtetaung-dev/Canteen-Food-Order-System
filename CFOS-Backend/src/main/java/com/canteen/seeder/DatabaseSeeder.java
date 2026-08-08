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

        // 6. Seed Food Categories
        log.info("Seeding Food Categories...");
        FoodCategory mainCourse = createCategory("Main Course", "Heavy meals for lunch or dinner", superAdminUser);
        FoodCategory dessert = createCategory("Dessert", "Sweet treats after meals", superAdminUser);
        FoodCategory beverage = createCategory("Beverage", "Drinks and refreshments", superAdminUser);
        
        foodCategoryRepository.saveAll(List.of(mainCourse, dessert, beverage));

        // 7. Seed Food Items
        log.info("Seeding Food Items...");
        Food food1 = createFood("Fried Rice", "Delicious chicken fried rice", new BigDecimal("3500.00"), mainCourse, superAdminUser);
        Food food2 = createFood("Noodle Soup", "Hot and spicy noodle soup", new BigDecimal("2500.00"), mainCourse, superAdminUser);
        
        Food food3 = createFood("Ice Cream", "Vanilla and chocolate mix", new BigDecimal("1500.00"), dessert, superAdminUser);
        Food food4 = createFood("Pudding", "Caramel custard pudding", new BigDecimal("1200.00"), dessert, superAdminUser);
        
        Food food5 = createFood("Coffee", "Hot brewed coffee", new BigDecimal("800.00"), beverage, superAdminUser);
        Food food6 = createFood("Orange Juice", "Fresh squeezed orange juice", new BigDecimal("1000.00"), beverage, superAdminUser);

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
