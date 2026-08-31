package com.canteen.features.dashboard;

import com.canteen.features.dashboard.dtos.*;
import com.canteen.features.report.dtos.FoodSalesBreakdown;
import com.canteen.model.Order;
import com.canteen.model.OrderItem;
import com.canteen.model.Status;
import com.canteen.model.User;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public AdminDashboardResModel getAdminDashboard(String timeRange, Integer canteenId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime end = now;

        timeRange = timeRange != null ? timeRange.toLowerCase() : "today";

        if ("year".equals(timeRange) || "yearly".equals(timeRange)) {
            start = now.with(TemporalAdjusters.firstDayOfYear()).with(LocalTime.MIN);
        } else if ("month".equals(timeRange) || "this month".equals(timeRange) || "monthly".equals(timeRange)) {
            start = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        } else if ("week".equals(timeRange) || "this week".equals(timeRange)) {
            start = now.with(DayOfWeek.MONDAY).with(LocalTime.MIN);
        } else { // today
            start = now.with(LocalTime.MIN);
        }

        List<Order> orders = orderRepository.findByOrderStatusAndCreatedAtBetween(Status.COMPLETE, start, end);
        if (canteenId != null) {
            orders = orders.stream()
                    .filter(o -> o.getOrderItems().stream()
                            .anyMatch(i -> i.getFood().getBranch() != null && i.getFood().getBranch().getBranchId().equals(canteenId)))
                    .collect(Collectors.toList());
        }

        AdminDashboardResModel response = new AdminDashboardResModel();

        // Top Foods
        Map<String, FoodSalesBreakdown> foodSalesMap = new HashMap<>();
        for (Order order : orders) {
            for (OrderItem item : order.getOrderItems()) {
                String foodName = item.getFood().getFoodName();
                FoodSalesBreakdown breakdown = foodSalesMap.computeIfAbsent(foodName,
                        k -> new FoodSalesBreakdown(k, 0L, BigDecimal.ZERO));
                breakdown.setQuantitySold(breakdown.getQuantitySold() + item.getQuantity());
                breakdown.setRevenue(breakdown.getRevenue().add(item.getSubTotal()));
            }
        }
        List<FoodSalesBreakdown> topFoods = new ArrayList<>(foodSalesMap.values());
        topFoods.sort((a, b) -> b.getQuantitySold().compareTo(a.getQuantitySold()));
        if (topFoods.size() > 5) {
            topFoods = topFoods.subList(0, 5);
        }
        response.setTopSellingFoods(topFoods);

        // Sales Trends Chart
        Map<String, BigDecimal> salesMap = new LinkedHashMap<>();

        if ("year".equals(timeRange) || "yearly".equals(timeRange)) {
            for (int i = 1; i <= 12; i++) {
                salesMap.put(LocalDate.of(now.getYear(), i, 1).format(DateTimeFormatter.ofPattern("MMM")), BigDecimal.ZERO);
            }
            for (Order o : orders) {
                String key = o.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM"));
                salesMap.put(key, salesMap.getOrDefault(key, BigDecimal.ZERO).add(o.getTotalAmount()));
            }
        } else if ("month".equals(timeRange) || "this month".equals(timeRange) || "monthly".equals(timeRange)) {
            int daysInMonth = now.toLocalDate().lengthOfMonth();
            for (int i = 1; i <= daysInMonth; i++) {
                salesMap.put(i + " " + now.format(DateTimeFormatter.ofPattern("MMM")), BigDecimal.ZERO);
            }
            for (Order o : orders) {
                String key = o.getCreatedAt().getDayOfMonth() + " " + o.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM"));
                salesMap.put(key, salesMap.getOrDefault(key, BigDecimal.ZERO).add(o.getTotalAmount()));
            }
        } else if ("week".equals(timeRange) || "this week".equals(timeRange)) {
            for (DayOfWeek day : DayOfWeek.values()) {
                salesMap.put(day.name().substring(0, 3), BigDecimal.ZERO);
            }
            for (Order o : orders) {
                String key = o.getCreatedAt().getDayOfWeek().name().substring(0, 3);
                salesMap.put(key, salesMap.getOrDefault(key, BigDecimal.ZERO).add(o.getTotalAmount()));
            }
        } else { // today
            String[] hours = {"08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"};
            for (String h : hours) {
                salesMap.put(h, BigDecimal.ZERO);
            }
            for (Order o : orders) {
                int hr = o.getCreatedAt().getHour();
                String hourStr;
                if (hr <= 8) hourStr = "08:00 AM";
                else if (hr == 9) hourStr = "09:00 AM";
                else if (hr == 10) hourStr = "10:00 AM";
                else if (hr == 11) hourStr = "11:00 AM";
                else if (hr == 12) hourStr = "12:00 PM";
                else if (hr == 13) hourStr = "01:00 PM";
                else if (hr == 14) hourStr = "02:00 PM";
                else if (hr == 15) hourStr = "03:00 PM";
                else if (hr == 16) hourStr = "04:00 PM";
                else hourStr = "05:00 PM";

                salesMap.put(hourStr, salesMap.getOrDefault(hourStr, BigDecimal.ZERO).add(o.getTotalAmount()));
            }
        }

        List<ChartDataModel> trends = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : salesMap.entrySet()) {
            trends.add(new ChartDataModel(entry.getKey(), entry.getValue()));
        }
        response.setSalesTrends(trends);

        return response;
    }

    public SuperadminDashboardResModel getSuperadminDashboard(String timeRange) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime end = now;

        timeRange = timeRange != null ? timeRange.toLowerCase() : "today";

        if ("year".equals(timeRange) || "yearly".equals(timeRange)) {
            start = now.with(TemporalAdjusters.firstDayOfYear()).with(LocalTime.MIN);
        } else if ("month".equals(timeRange) || "this month".equals(timeRange) || "monthly".equals(timeRange)) {
            start = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        } else if ("week".equals(timeRange) || "this week".equals(timeRange)) {
            start = now.with(DayOfWeek.MONDAY).with(LocalTime.MIN);
        } else { // today
            start = now.with(LocalTime.MIN);
        }

        List<User> users = userRepository.findAll();

        SuperadminDashboardResModel response = new SuperadminDashboardResModel();

        // Registration Growth
        Map<String, Long> growthMap = new LinkedHashMap<>();

        if ("year".equals(timeRange) || "yearly".equals(timeRange)) {
            for (int i = 1; i <= 12; i++) {
                growthMap.put(LocalDate.of(now.getYear(), i, 1).format(DateTimeFormatter.ofPattern("MMM")), 0L);
            }
            for (User u : users) {
                if (u.getCreatedAt() != null && !u.getCreatedAt().isBefore(start) && !u.getCreatedAt().isAfter(end)) {
                    String key = u.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM"));
                    growthMap.put(key, growthMap.getOrDefault(key, 0L) + 1);
                }
            }
        } else if ("month".equals(timeRange) || "this month".equals(timeRange) || "monthly".equals(timeRange)) {
            int daysInMonth = now.toLocalDate().lengthOfMonth();
            for (int i = 1; i <= daysInMonth; i++) {
                growthMap.put(i + " " + now.format(DateTimeFormatter.ofPattern("MMM")), 0L);
            }
            for (User u : users) {
                if (u.getCreatedAt() != null && !u.getCreatedAt().isBefore(start) && !u.getCreatedAt().isAfter(end)) {
                    String key = u.getCreatedAt().getDayOfMonth() + " " + u.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM"));
                    growthMap.put(key, growthMap.getOrDefault(key, 0L) + 1);
                }
            }
        } else if ("week".equals(timeRange) || "this week".equals(timeRange)) {
            for (DayOfWeek day : DayOfWeek.values()) {
                growthMap.put(day.name().substring(0, 3), 0L);
            }
            for (User u : users) {
                if (u.getCreatedAt() != null && !u.getCreatedAt().isBefore(start) && !u.getCreatedAt().isAfter(end)) {
                    String key = u.getCreatedAt().getDayOfWeek().name().substring(0, 3);
                    growthMap.put(key, growthMap.getOrDefault(key, 0L) + 1);
                }
            }
        } else { // today
            String[] hours = {"08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"};
            for (String h : hours) {
                growthMap.put(h, 0L);
            }
            for (User u : users) {
                if (u.getCreatedAt() != null && !u.getCreatedAt().isBefore(start) && !u.getCreatedAt().isAfter(end)) {
                    int hr = u.getCreatedAt().getHour();
                    String hourStr;
                    if (hr <= 9) hourStr = "08:00 AM";
                    else if (hr <= 11) hourStr = "10:00 AM";
                    else if (hr <= 13) hourStr = "12:00 PM";
                    else if (hr <= 15) hourStr = "02:00 PM";
                    else if (hr <= 17) hourStr = "04:00 PM";
                    else hourStr = "06:00 PM";
                    growthMap.put(hourStr, growthMap.getOrDefault(hourStr, 0L) + 1);
                }
            }
        }

        List<ChartDataModel> growth = new ArrayList<>();
        for (Map.Entry<String, Long> entry : growthMap.entrySet()) {
            growth.add(new ChartDataModel(entry.getKey(), entry.getValue()));
        }
        response.setRegistrationGrowth(growth);

        // Role Distribution (all time, or based on timeRange? Typically role distribution is all time, but user said "fix to work the today, this week... for chart and pi". I'll filter pie by timeRange too.)
        long studentCount = 0;
        long professorCount = 0;
        long canteenAdminCount = 0;
        long superAdminCount = 0;

        for (User u : users) {
            if (u.getCreatedAt() != null && !u.getCreatedAt().isBefore(start) && !u.getCreatedAt().isAfter(end)) {
                String roleName = u.getRole() != null ? u.getRole().getRoleName().toLowerCase() : "user";
                if ("user".equals(roleName)) {
                    studentCount++;
                } else if ("professor".equals(roleName)) {
                    professorCount++;
                } else if ("manager".equals(roleName)) {
                    canteenAdminCount++;
                } else if ("superadmin".equals(roleName) || "admin".equals(roleName)) {
                    superAdminCount++;
                }
            }
        }

        List<PieChartModel> roles = new ArrayList<>();
        if (studentCount > 0) roles.add(new PieChartModel("Students", studentCount, "#88C425"));
        if (professorCount > 0) roles.add(new PieChartModel("Professors", professorCount, "#5B8C11"));
        if (canteenAdminCount > 0) roles.add(new PieChartModel("Canteen Admins", canteenAdminCount, "#3B5B11"));
        if (superAdminCount > 0) roles.add(new PieChartModel("Super Admins", superAdminCount, "#A3D944"));

        if (roles.isEmpty()) {
            roles.add(new PieChartModel("No Users", 1L, "#e2e8f0"));
        }

        response.setRoleDistribution(roles);

        return response;
    }
}
