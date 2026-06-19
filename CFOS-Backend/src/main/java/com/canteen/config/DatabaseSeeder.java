package com.canteen.config;

import com.canteen.model.*;
import com.canteen.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;
    private final FoodCategoryRepository foodCategoryRepository;
    private final FoodRepository foodRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public DatabaseSeeder(RoleRepository roleRepository,
                          PermissionRepository permissionRepository,
                          RolePermissionRepository rolePermissionRepository,
                          UserRepository userRepository,
                          FoodCategoryRepository foodCategoryRepository,
                          FoodRepository foodRepository,
                          OrderRepository orderRepository,
                          PaymentRepository paymentRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userRepository = userRepository;
        this.foodCategoryRepository = foodCategoryRepository;
        this.foodRepository = foodRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        clearDatabase();
        seedRoles();
        seedPermissions();
        seedRolePermissions();
        seedUsers();
        seedFoodCategories();
        seedFoods();
    }

    private void clearDatabase() {
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        foodRepository.deleteAll();
        foodCategoryRepository.deleteAll();
        userRepository.deleteAll();
        rolePermissionRepository.deleteAll();
        permissionRepository.deleteAll();
        roleRepository.deleteAll();
        System.out.println("Database cleared.");
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setRoleName("ADMIN");
            roleRepository.save(adminRole);

            Role userRole = new Role();
            userRole.setRoleName("USER");
            roleRepository.save(userRole);

            System.out.println("Roles seeded.");
        }
    }

    private void seedPermissions() {
        if (permissionRepository.count() == 0) {
            String[][] perms = {
                    {"Food", "Create"}, {"Food", "Read"}, {"Food", "Update"}, {"Food", "Delete"},
                    {"Order", "Create"}, {"Order", "Read"}, {"Order", "Update"}, {"Order", "Delete"}
            };

            for (String[] p : perms) {
                Permission permission = new Permission();
                permission.setMenuName(p[0]);
                permission.setActionName(p[1]);
                permissionRepository.save(permission);
            }
            System.out.println("Permissions seeded.");
        }
    }

    private void seedRolePermissions() {
        if (rolePermissionRepository.count() == 0 && roleRepository.count() > 0 && permissionRepository.count() > 0) {
            // Give ADMIN all permissions
            Role admin = roleRepository.findAll().stream().filter(r -> r.getRoleName().equals("ADMIN")).findFirst().orElse(null);
            List<Permission> allPermissions = permissionRepository.findAll();

            if (admin != null) {
                for (Permission p : allPermissions) {
                    RolePermission rp = new RolePermission();
                    rp.setRole(admin);
                    rp.setPermission(p);
                    rolePermissionRepository.save(rp);
                }
            }

            // Give USER read food and create order permissions
            Role user = roleRepository.findAll().stream().filter(r -> r.getRoleName().equals("USER")).findFirst().orElse(null);
            if (user != null) {
                for (Permission p : allPermissions) {
                    if ((p.getMenuName().equals("Food") && p.getActionName().equals("Read")) ||
                            (p.getMenuName().equals("Order") && p.getActionName().equals("Create")) ||
                            (p.getMenuName().equals("Order") && p.getActionName().equals("Read"))) {
                        RolePermission rp = new RolePermission();
                        rp.setRole(user);
                        rp.setPermission(p);
                        rolePermissionRepository.save(rp);
                    }
                }
            }
            System.out.println("RolePermissions seeded.");
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            
            // Admin User
            Role adminRole = roleRepository.findAll().stream().filter(r -> r.getRoleName().equals("ADMIN")).findFirst().orElse(null);
            if (adminRole != null) {
                User admin = new User();
                admin.setUserName("admin");
                admin.setFullName("System Administrator");
                admin.setEmail("admin@canteen.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setPhoneNumber("1234567890");
                admin.setStatus("ACTIVE");
                admin.setRole(adminRole);
                userRepository.save(admin);
            }

            // Normal User
            Role userRole = roleRepository.findAll().stream().filter(r -> r.getRoleName().equals("USER")).findFirst().orElse(null);
            if (userRole != null) {
                User normalUser = new User();
                normalUser.setUserName("student");
                normalUser.setFullName("John Doe");
                normalUser.setEmail("student@canteen.com");
                normalUser.setPasswordHash(passwordEncoder.encode("student123"));
                normalUser.setPhoneNumber("0987654321");
                normalUser.setStatus("ACTIVE");
                normalUser.setRole(userRole);
                userRepository.save(normalUser);
            }
            System.out.println("Users seeded.");
        }
    }

    private void seedFoodCategories() {
        if (foodCategoryRepository.count() == 0) {
            User admin = userRepository.findByUserName("admin").orElse(null);
            if (admin != null) {
                FoodCategory mainCourse = new FoodCategory();
                mainCourse.setCategoryName("Main Course");
                mainCourse.setDescription("Hearty and filling meals");
                mainCourse.setCreatedBy(admin);
                foodCategoryRepository.save(mainCourse);

                FoodCategory beverages = new FoodCategory();
                beverages.setCategoryName("Beverages");
                beverages.setDescription("Refreshing drinks");
                beverages.setCreatedBy(admin);
                foodCategoryRepository.save(beverages);

                FoodCategory desserts = new FoodCategory();
                desserts.setCategoryName("Desserts");
                desserts.setDescription("Sweet treats to end your meal");
                desserts.setCreatedBy(admin);
                foodCategoryRepository.save(desserts);

                System.out.println("Food Categories seeded.");
            }
        }
    }

    private void seedFoods() {
        if (foodRepository.count() == 0) {
            User admin = userRepository.findByUserName("admin").orElse(null);
            List<FoodCategory> categories = foodCategoryRepository.findAll();

            if (admin != null && !categories.isEmpty()) {
                FoodCategory mainCourse = categories.stream().filter(c -> c.getCategoryName().equals("Main Course")).findFirst().orElse(null);
                FoodCategory beverages = categories.stream().filter(c -> c.getCategoryName().equals("Beverages")).findFirst().orElse(null);
                FoodCategory desserts = categories.stream().filter(c -> c.getCategoryName().equals("Desserts")).findFirst().orElse(null);

                if (mainCourse != null) {
                    Food food1 = new Food();
                    food1.setCategory(mainCourse);
                    food1.setFoodName("Chicken Fried Rice");
                    food1.setDescription("Classic fried rice with tender chicken pieces and mixed vegetables.");
                    food1.setPrice(new BigDecimal("5.50"));
                    food1.setCreatedBy(admin);
                    food1.setIsAvailable(true);
                    // Leaving imageUrl empty as requested
                    foodRepository.save(food1);

                    Food food2 = new Food();
                    food2.setCategory(mainCourse);
                    food2.setFoodName("Spicy Noodles");
                    food2.setDescription("Wok-tossed noodles in a spicy chili sauce.");
                    food2.setPrice(new BigDecimal("4.00"));
                    food2.setCreatedBy(admin);
                    food2.setIsAvailable(true);
                    foodRepository.save(food2);
                }

                if (beverages != null) {
                    Food food3 = new Food();
                    food3.setCategory(beverages);
                    food3.setFoodName("Iced Lemon Tea");
                    food3.setDescription("Freshly brewed tea with a hint of lemon and ice.");
                    food3.setPrice(new BigDecimal("2.00"));
                    food3.setCreatedBy(admin);
                    food3.setIsAvailable(true);
                    foodRepository.save(food3);
                }

                if (desserts != null) {
                    Food food4 = new Food();
                    food4.setCategory(desserts);
                    food4.setFoodName("Chocolate Brownie");
                    food4.setDescription("Rich and fudgy chocolate brownie.");
                    food4.setPrice(new BigDecimal("3.50"));
                    food4.setCreatedBy(admin);
                    food4.setIsAvailable(true);
                    foodRepository.save(food4);
                }

                System.out.println("Foods seeded.");
            }
        }
    }
}
