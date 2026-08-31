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
import java.time.LocalDateTime;
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
    private final NotificationRepository notificationRepository;
    private final ReviewRepository reviewRepository;
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
        Role professorRole = createRole("Professor");
        
        roleRepository.saveAll(List.of(superAdminRole, adminRole, managerRole, userRole, professorRole));

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
        
        // User and Professor get Read permissions for Food Category & Menu
        for (Permission p : permissions) {
            if ("READ".equalsIgnoreCase(p.getActionName()) && 
                "Food Category & Menu".equalsIgnoreCase(p.getMenuName())) {
                RolePermission rp = new RolePermission();
                rp.setRole(userRole);
                rp.setPermission(p);
                rolePermissions.add(rp);

                RolePermission rpProf = new RolePermission();
                rpProf.setRole(professorRole);
                rpProf.setPermission(p);
                rolePermissions.add(rpProf);
            }
        }
        rolePermissionRepository.saveAll(rolePermissions);

        // 5. Seed Canteens/Branches (6 canteens)
        log.info("Seeding Canteens...");
        List<Branch> branches = new ArrayList<>();
        String[] branchNames = {
            "Main Canteen", "North Canteen", "South Canteen", 
            "East Canteen", "West Canteen", "Central Cafeteria"
        };
        String[] locations = {
            "Building A, Ground Floor", "Building C, 1st Floor", "Building B, Basement",
            "Building D, Ground Floor", "Building E, 2nd Floor", "Student Center, Hall 1"
        };
        for (int i = 0; i < 6; i++) {
            Branch branch = new Branch();
            branch.setBranchName(branchNames[i]);
            branch.setLocation(locations[i]);
            branches.add(branch);
        }
        branchRepository.saveAll(branches);
        branchRepository.flush();

        // 5.5 Seed Users (Superadmin 2, CanteenAdmin 12, Users 20)
        log.info("Seeding Users...");
        
        // 2 SuperAdmin Accounts
        User superAdminUser1 = new User();
        superAdminUser1.setUserName("superadmin");
        superAdminUser1.setFullName("Super Admin One");
        superAdminUser1.setEmail("superadmin1@canteen.com");
        superAdminUser1.setPasswordHash(passwordEncoder.encode("superadmin123"));
        superAdminUser1.setPhoneNumber("1112223333");
        superAdminUser1.setStatus(UserStatus.ACTIVE);
        superAdminUser1.setRole(superAdminRole);

        User superAdminUser2 = new User();
        superAdminUser2.setUserName("superadmin2");
        superAdminUser2.setFullName("Super Admin Two");
        superAdminUser2.setEmail("superadmin2@canteen.com");
        superAdminUser2.setPasswordHash(passwordEncoder.encode("superadmin123"));
        superAdminUser2.setPhoneNumber("1112224444");
        superAdminUser2.setStatus(UserStatus.ACTIVE);
        superAdminUser2.setRole(superAdminRole);

        userRepository.saveAll(List.of(superAdminUser1, superAdminUser2));

        // 12 CanteenAdmin Accounts (2 for each canteen)
        List<User> canteenAdmins = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            Branch branch = branches.get(i);
            for (int m = 1; m <= 2; m++) {
                int managerIndex = i * 2 + m;
                User manager = new User();
                manager.setUserName("manager" + managerIndex);
                manager.setFullName(branch.getBranchName() + " Admin " + m);
                manager.setEmail("manager" + managerIndex + "@canteen.com");
                manager.setPasswordHash(passwordEncoder.encode("manager123"));
                manager.setPhoneNumber("444555" + String.format("%04d", managerIndex));
                manager.setStatus(UserStatus.ACTIVE);
                manager.setRole(managerRole);
                manager.setCanteen(branch);
                canteenAdmins.add(manager);
            }
        }
        userRepository.saveAll(canteenAdmins);

        // 20 Users (username must be 2024-miit-cse-001 to 020)
        List<User> students = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            String username = String.format("2024-miit-cse-%03d", i);
            User student = new User();
            student.setUserName(username);
            student.setFullName("Student " + String.format("%02d", i));
            student.setEmail(null);
            student.setPasswordHash(passwordEncoder.encode("student123"));
            student.setPhoneNumber("099" + String.format("%07d", i));
            student.setStatus(UserStatus.ACTIVE);
            student.setRole(userRole);
            students.add(student);
        }
        userRepository.saveAll(students);

        // 5 Professor Accounts
        List<User> professors = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            User prof = new User();
            prof.setUserName("professor" + i);
            prof.setFullName("Professor " + i);
            prof.setEmail("professor" + i + "@miit.edu.mm");
            prof.setPasswordHash(passwordEncoder.encode("professor123"));
            prof.setPhoneNumber("099" + String.format("%07d", 200 + i));
            prof.setStatus(UserStatus.ACTIVE);
            prof.setRole(professorRole);
            professors.add(prof);
        }
        userRepository.saveAll(professors);

        // 6. Seed Food Categories
        log.info("Seeding Food Categories...");
        FoodCategory mainCourse = createCategory("Main Course", "Heavy meals for lunch or dinner", superAdminUser1);
        FoodCategory dessert = createCategory("Dessert", "Sweet treats after meals", superAdminUser1);
        FoodCategory beverage = createCategory("Beverage", "Drinks and refreshments", superAdminUser1);
        FoodCategory snacks = createCategory("Snacks", "Quick bites and light food", superAdminUser1);
        
        foodCategoryRepository.saveAll(List.of(mainCourse, dessert, beverage, snacks));

        // 7. Seed Food Items (20 food for each canteen)
        log.info("Seeding Food Items...");
        
        class FoodTemplate {
            String name;
            String desc;
            BigDecimal price;
            FoodCategory category;
            String imageUrl;

            FoodTemplate(String name, String desc, double price, FoodCategory category, String imageUrl) {
                this.name = name;
                this.desc = desc;
                this.price = new BigDecimal(price);
                this.category = category;
                this.imageUrl = imageUrl;
            }
        }

        List<FoodTemplate> templates = List.of(
            new FoodTemplate("Chicken Fried Rice", "Delicious chicken fried rice with fresh veggies", 3500.0, mainCourse, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=600"),
            new FoodTemplate("Spicy Noodle Soup", "Hot and spicy noodle soup with chicken", 2800.0, mainCourse, "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600"),
            new FoodTemplate("Grilled Chicken Burger", "Juicy grilled chicken burger with cheese", 4500.0, mainCourse, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"),
            new FoodTemplate("Classic Club Sandwich", "Double decker sandwich with chicken and egg", 3200.0, mainCourse, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600"),
            new FoodTemplate("Margherita Pizza", "Classic tomato sauce and mozzarella cheese", 5000.0, mainCourse, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=600"),
            new FoodTemplate("Shan Noodles", "Traditional Shan style rice noodles with chicken", 2500.0, mainCourse, "/food-images/Shan Noodles.webp"),
            new FoodTemplate("Nan Gyi Thoke", "Thick rice noodle salad with chicken curry", 2800.0, mainCourse, "/food-images/Nan Gyi Thoke.jpg"),
            new FoodTemplate("Tea Leaf Salad", "Traditional Myanmar fermented tea leaf salad", 2200.0, mainCourse, "/food-images/Tea Leaf Salad.jpg"),
            new FoodTemplate("Basil Fried Rice", "Spicy and fragrant fried rice with basil", 3000.0, mainCourse, "/food-images/Basil Fried Rice.jpg"),
            new FoodTemplate("Spaghetti Bolognese", "Spaghetti pasta with rich tomato minced beef sauce", 4500.0, mainCourse, "/food-images/Spaghetti.jpg"),
            new FoodTemplate("Chocolate Lava Cake", "Warm chocolate cake with molten center", 2000.0, dessert, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600"),
            new FoodTemplate("Strawberry Waffle", "Fresh waffles topped with strawberry syrup", 2500.0, dessert, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"),
            new FoodTemplate("Mango Pudding", "Sweet mango pudding with fresh cream", 1500.0, dessert, "https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=600"),
            new FoodTemplate("Shwe Yin Aye", "Sweet Myanmar dessert with coconut milk, jelly, sticky rice and bread", 1800.0, dessert, "/food-images/Shwe Yin Aye.jpg"),
            new FoodTemplate("Sweet Falooda", "Layered dessert with rose syrup, vermicelli, sweet basil seeds and ice cream", 2500.0, dessert, "/food-images/Falooda.jpg"),
            new FoodTemplate("Iced Caffe Latte", "Chilled espresso with fresh milk", 1800.0, beverage, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600"),
            new FoodTemplate("Fresh Lemonade", "Squeezed lemons with ice and mint", 1200.0, beverage, "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=600"),
            new FoodTemplate("Myanmar Traditional Tea", "Freshly brewed sweet and creamy milk tea", 1200.0, beverage, "/food-images/Myanmar Traditional Tea.jpg"),
            new FoodTemplate("Chocolate Milkshake", "Rich and creamy chocolate milkshake", 2200.0, beverage, "/food-images/Chocolate Milkshake.jpg"),
            new FoodTemplate("Fresh Mango Juice", "Freshly blended sweet ripe mangoes", 1800.0, beverage, "/food-images/Mango Juice.jpg")
        );

        List<Food> allFoods = new ArrayList<>();
        java.util.Map<Integer, List<Food>> branchFoodMap = new java.util.HashMap<>();

        for (Branch branch : branches) {
            List<Food> branchFoods = new ArrayList<>();
            for (FoodTemplate temp : templates) {
                Food food = new Food();
                food.setFoodName(branch.getBranchName() + " " + temp.name);
                food.setDescription(temp.desc);
                food.setPrice(temp.price);
                food.setCategory(temp.category);
                food.setCreatedBy(superAdminUser1);
                food.setBranch(branch);
                food.setImageUrl(temp.imageUrl);
                food.setIsAvailable(true);
                branchFoods.add(food);
                allFoods.add(food);
            }
            foodRepository.saveAll(branchFoods);
            branchFoodMap.put(branch.getBranchId(), branchFoods);
        }

        // 8. Seed Orders (each user have 10 orders spread across 1 year)
        log.info("Seeding Orders (each user gets 10 orders)...");
        java.util.Random random = new java.util.Random();
        
        for (User student : students) {
            for (int oIdx = 0; oIdx < 10; oIdx++) {
                // Pick a random canteen
                Branch branch = branches.get(random.nextInt(branches.size()));
                List<Food> branchFoods = branchFoodMap.get(branch.getBranchId());

                Order order = new Order();
                order.setUser(student);
                
                // Status distribution (8 COMPLETE, 1 PREPARING, 1 CANCEL)
                Status status;
                if (oIdx < 8) {
                    status = Status.COMPLETE;
                } else if (oIdx == 8) {
                    status = Status.PREPARING;
                } else {
                    status = Status.CANCEL;
                }
                order.setOrderStatus(status);

                // Select 1 to 3 random items from this branch
                int numItems = random.nextInt(3) + 1;
                List<OrderItem> items = new ArrayList<>();
                BigDecimal total = BigDecimal.ZERO;
                
                java.util.Set<Integer> pickedIndices = new java.util.HashSet<>();
                for (int itemIdx = 0; itemIdx < numItems; itemIdx++) {
                    int foodIdx = random.nextInt(branchFoods.size());
                    while (pickedIndices.contains(foodIdx)) {
                        foodIdx = random.nextInt(branchFoods.size());
                    }
                    pickedIndices.add(foodIdx);
                    Food food = branchFoods.get(foodIdx);

                    OrderItem orderItem = new OrderItem();
                    orderItem.setFood(food);
                    int qty = random.nextInt(2) + 1;
                    orderItem.setQuantity(qty);
                    orderItem.setSnapPrice(food.getPrice());
                    BigDecimal subTotal = food.getPrice().multiply(new BigDecimal(qty));
                    orderItem.setSubTotal(subTotal);
                    orderItem.setComment(random.nextBoolean() ? "Extra spicy" : null);
                    orderItem.setOrder(order);
                    items.add(orderItem);
                    
                    total = total.add(subTotal);
                }
                
                order.setOrderItems(items);
                order.setTotalAmount(total);

                // Save order & items
                Order savedOrder = orderRepository.save(order);

                // Distribute date over the past 365 days
                int baseDaysAgo = (9 - oIdx) * 36;
                int randomOffset = random.nextInt(30);
                LocalDateTime orderDate = LocalDateTime.now()
                    .minusDays(baseDaysAgo + randomOffset)
                    .minusHours(random.nextInt(12))
                    .minusMinutes(random.nextInt(60));

                java.sql.Timestamp sqlOrderDate = java.sql.Timestamp.valueOf(orderDate);
                
                // Update Order and OrderItems timestamps in DB via JDBC
                jdbcTemplate.update("UPDATE tbl_order SET created_at = ?, updated_at = ? WHERE orderid = ?", 
                    sqlOrderDate, sqlOrderDate, savedOrder.getOrderId());

                for (OrderItem item : savedOrder.getOrderItems()) {
                    jdbcTemplate.update("UPDATE tbl_order_item SET created_at = ?, updated_at = ? WHERE order_itemid = ?", 
                        sqlOrderDate, sqlOrderDate, item.getOrderItemId());
                }

                // Seed Payment
                if (status == Status.COMPLETE || status == Status.PREPARING) {
                    Payment payment = new Payment();
                    payment.setOrder(savedOrder);
                    payment.setAmount(total);
                    
                    String[] methods = {"KPay", "WavePay", "AYAPay", "Cash", "Card"};
                    payment.setPaymentMethod(methods[random.nextInt(methods.length)]);
                    payment.setPaidAt(orderDate.plusMinutes(random.nextInt(5) + 1));
                    Payment savedPayment = paymentRepository.save(payment);

                    java.sql.Timestamp sqlPaidAt = java.sql.Timestamp.valueOf(payment.getPaidAt());
                    jdbcTemplate.update("UPDATE tbl_payment SET created_at = ?, paid_at = ? WHERE paymentid = ?", 
                        sqlOrderDate, sqlPaidAt, savedPayment.getPaymentId());
                }

                // Seed Notifications
                Notification placeNotification = new Notification();
                placeNotification.setUser(student);
                placeNotification.setOrder(savedOrder);
                placeNotification.setTitle("Order Placed");
                placeNotification.setMessage("Your order of " + total + " MMK has been received.");
                placeNotification.setIsRead(true);
                Notification savedPlaceNotif = notificationRepository.save(placeNotification);
                jdbcTemplate.update("UPDATE tbl_notification SET created_at = ? WHERE notificationid = ?", 
                    sqlOrderDate, savedPlaceNotif.getNotificationId());

                if (status == Status.COMPLETE) {
                    Notification readyNotification = new Notification();
                    readyNotification.setUser(student);
                    readyNotification.setOrder(savedOrder);
                    readyNotification.setTitle("Order Completed");
                    readyNotification.setMessage("Your order is ready. Enjoy your meal!");
                    readyNotification.setIsRead(true);
                    Notification savedReadyNotif = notificationRepository.save(readyNotification);
                    LocalDateTime completedDate = orderDate.plusMinutes(15 + random.nextInt(10));
                    jdbcTemplate.update("UPDATE tbl_notification SET created_at = ? WHERE notificationid = ?", 
                        java.sql.Timestamp.valueOf(completedDate), savedReadyNotif.getNotificationId());
                } else if (status == Status.CANCEL) {
                    Notification cancelNotification = new Notification();
                    cancelNotification.setUser(student);
                    cancelNotification.setOrder(savedOrder);
                    cancelNotification.setTitle("Order Cancelled");
                    cancelNotification.setMessage("Your order was cancelled.");
                    cancelNotification.setIsRead(true);
                    Notification savedCancelNotif = notificationRepository.save(cancelNotification);
                    LocalDateTime cancelledDate = orderDate.plusMinutes(5 + random.nextInt(5));
                    jdbcTemplate.update("UPDATE tbl_notification SET created_at = ? WHERE notificationid = ?", 
                        java.sql.Timestamp.valueOf(cancelledDate), savedCancelNotif.getNotificationId());
                }
            }
        }

        // 9. Seed Reviews (suitable mock data)
        log.info("Seeding Reviews...");
        String[] reviewTexts = {
            "Excellent food quality, especially the fried rice!",
            "The Shan noodles were amazing and served very hot.",
            "Very clean environment and polite staff.",
            "Order was prepared very fast today.",
            "The lemonade was very refreshing on a hot day.",
            "The burger was juicy and delicious.",
            "Great service, clean place, and affordable prices.",
            "Falooda is a must-try dessert here!",
            "Love the mango pudding. Will order again.",
            "Convenient system to order food in advance.",
            "Basil fried rice has the perfect level of spice.",
            "Nice variety of beverages and desserts.",
            "Perfect spot for quick lunch between lectures.",
            "Spaghetti bolognese is rich in flavor.",
            "Staff is very friendly and fast.",
            "Good quality ingredients and hygienic cooking.",
            "Love the hot tea. Classic flavor.",
            "Waffles are super crispy and sweet.",
            "Wide selection of local Myanmar dishes.",
            "Really helpful food ordering app!"
        };

        for (int i = 0; i < 20; i++) {
            User student = students.get(i);
            Review review = new Review();
            review.setUser(student);
            
            double rating = 3.5 + (random.nextDouble() * 1.5);
            rating = Math.round(rating * 10.0) / 10.0;
            review.setRating(rating);
            review.setReviewText(reviewTexts[i]);
            Review savedReview = reviewRepository.save(review);
            
            LocalDateTime reviewDate = LocalDateTime.now().minusDays(random.nextInt(365)).minusHours(random.nextInt(24));
            jdbcTemplate.update("UPDATE tbl_review SET created_at = ?, updated_at = ? WHERE reviewid = ?", 
                java.sql.Timestamp.valueOf(reviewDate), java.sql.Timestamp.valueOf(reviewDate), savedReview.getReviewId());
        }

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
        
        // 1. Dashboard Module
        permissions.add(createPermission("Dashboard", "READ")); // ID 1
        
        // 2. Canteen Management Module
        permissions.add(createPermission("Canteen Management", "CREATE")); // ID 2
        permissions.add(createPermission("Canteen Management", "READ"));   // ID 3
        permissions.add(createPermission("Canteen Management", "UPDATE")); // ID 4
        permissions.add(createPermission("Canteen Management", "DELETE")); // ID 5

        // 3. Food Category & Menu Module
        permissions.add(createPermission("Food Category & Menu", "CREATE")); // ID 6
        permissions.add(createPermission("Food Category & Menu", "READ"));   // ID 7
        permissions.add(createPermission("Food Category & Menu", "UPDATE")); // ID 8
        permissions.add(createPermission("Food Category & Menu", "DELETE")); // ID 9

        // 4. Orders & POS Module
        permissions.add(createPermission("Orders & POS", "CREATE")); // ID 10
        permissions.add(createPermission("Orders & POS", "READ"));   // ID 11
        permissions.add(createPermission("Orders & POS", "UPDATE")); // ID 12
        permissions.add(createPermission("Orders & POS", "DELETE")); // ID 13

        // 5. User Management Module
        permissions.add(createPermission("User Management", "CREATE")); // ID 14
        permissions.add(createPermission("User Management", "READ"));   // ID 15
        permissions.add(createPermission("User Management", "UPDATE")); // ID 16
        permissions.add(createPermission("User Management", "DELETE")); // ID 17

        // 6. Role & Permission System Module
        permissions.add(createPermission("Role & Permission System", "CREATE")); // ID 18
        permissions.add(createPermission("Role & Permission System", "READ"));   // ID 19
        permissions.add(createPermission("Role & Permission System", "UPDATE")); // ID 20
        permissions.add(createPermission("Role & Permission System", "DELETE")); // ID 21

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
