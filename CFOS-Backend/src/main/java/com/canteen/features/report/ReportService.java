package com.canteen.features.report;

import com.canteen.features.report.dtos.FoodSalesBreakdown;
import com.canteen.features.report.dtos.ReportPeriodBreakdown;
import com.canteen.features.report.dtos.ReportResponseModel;
import com.canteen.model.Order;
import com.canteen.model.OrderItem;
import com.canteen.model.Status;
import com.canteen.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;

    private LocalDate parseDateStr(String dateStr) {
        if (dateStr == null || dateStr.isEmpty())
            return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd-M-yyyy"));
        } catch (Exception e) {
            return LocalDate.parse(dateStr);
        }
    }

    @Transactional(readOnly = true)
    public ReportResponseModel getReport(String type, String startDateStr, String endDateStr) {
        String reportType = (type != null) ? type.toLowerCase() : "daily";

        LocalDate endDate = (endDateStr != null && !endDateStr.isEmpty())
                ? parseDateStr(endDateStr)
                : LocalDate.now();

        LocalDate startDate;
        if (startDateStr != null && !startDateStr.isEmpty()) {
            startDate = parseDateStr(startDateStr);
        } else {
            if ("yearly".equals(reportType)) {
                startDate = endDate.minusYears(4);
            } else if ("monthly".equals(reportType)) {
                startDate = endDate.minusMonths(11);
            } else {
                startDate = endDate.minusDays(29);
            }
        }

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Order> orders = orderRepository.findByOrderStatusAndCreatedAtBetween(Status.COMPLETE, start, end);

        ReportResponseModel report = new ReportResponseModel();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalItemsSold = 0;
        for (Order order : orders) {
            totalRevenue = totalRevenue.add(order.getTotalAmount());
            for (OrderItem item : order.getOrderItems()) {
                totalItemsSold += item.getQuantity();
            }
        }
        report.setTotalRevenue(totalRevenue);
        report.setTotalOrders((long) orders.size());
        report.setTotalItemsSold(totalItemsSold);

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
        List<FoodSalesBreakdown> foodSalesList = new ArrayList<>(foodSalesMap.values());
        foodSalesList.sort((a, b) -> b.getQuantitySold().compareTo(a.getQuantitySold()));
        report.setFoodSales(foodSalesList);

        Map<String, ReportPeriodBreakdown> periodMap = new LinkedHashMap<>();

        if ("yearly".equals(reportType)) {
            LocalDate current = startDate.withDayOfYear(1);
            while (!current.isAfter(endDate)) {
                String label = String.valueOf(current.getYear());
                periodMap.put(label, new ReportPeriodBreakdown(label, 0L, BigDecimal.ZERO));
                current = current.plusYears(1);
            }
        } else if ("monthly".equals(reportType)) {
            LocalDate current = startDate.withDayOfMonth(1);
            while (!current.isAfter(endDate)) {
                String label = current.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                periodMap.put(label, new ReportPeriodBreakdown(label, 0L, BigDecimal.ZERO));
                current = current.plusMonths(1);
            }
        } else {
            LocalDate current = startDate;
            while (!current.isAfter(endDate)) {
                String label = current.toString();
                periodMap.put(label, new ReportPeriodBreakdown(label, 0L, BigDecimal.ZERO));
                current = current.plusDays(1);
            }
        }

        for (Order order : orders) {
            String label;
            if ("yearly".equals(reportType)) {
                label = String.valueOf(order.getCreatedAt().getYear());
            } else if ("monthly".equals(reportType)) {
                label = order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            } else {
                label = order.getCreatedAt().toLocalDate().toString();
            }

            ReportPeriodBreakdown breakdown = periodMap.get(label);
            if (breakdown == null) {
                breakdown = new ReportPeriodBreakdown(label, 0L, BigDecimal.ZERO);
                periodMap.put(label, breakdown);
            }
            breakdown.setOrderCount(breakdown.getOrderCount() + 1);
            breakdown.setRevenue(breakdown.getRevenue().add(order.getTotalAmount()));
        }

        List<ReportPeriodBreakdown> periodList = new ArrayList<>(periodMap.values());
        periodList.sort(Comparator.comparing(p -> p.getPeriodLabel()));
        report.setPeriodBreakdown(periodList);

        return report;
    }
}
