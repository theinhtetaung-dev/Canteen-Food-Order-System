package com.canteen.features.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.canteen.features.order.dtos.OrderRequestModel;
import com.canteen.features.order.dtos.OrderResponseModel;
import com.canteen.features.order.mapper.OrderMapper;
import com.canteen.model.Order;
import com.canteen.model.OrderItem;
import com.canteen.model.Food;
import com.canteen.model.Status;
import com.canteen.model.User;
import com.canteen.repository.FoodRepository;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.UserRepository;
import com.canteen.utils.OrderStatusValidator;
import com.canteen.utils.PaginationValidator;
import com.canteen.utils.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FoodRepository foodRepository;
    private final OrderStatusValidator orderStatusValidator;

    @Transactional
    public OrderResponseModel createOrder(OrderRequestModel request, String username) {

        User user = userRepository.findByUserName(username)
                                  .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Set<Integer> foodIds = new HashSet<>();
        if (request.getOrderItems() != null) {
            for (var itemRequest : request.getOrderItems()) {
                foodIds.add(itemRequest.getFoodId());
            }
        }

        List<Food> fetchedFoods = foodRepository.findAllById(foodIds);

        Map<Integer, Food> foodMap = new HashMap<>();
        if (fetchedFoods != null) {
            for (Food food : fetchedFoods) {
                foodMap.put(food.getFoodId(), food);
            }
        }

        Order order = new Order();
        order.setOrderStatus(Status.PENDING);
        order.setUser(user);
        order.setOrderItems(new ArrayList<>());

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Process order items in-memory without hitting the database again
        if (request.getOrderItems() != null) {
            for (var itemRequest : request.getOrderItems()) {

                Food food = foodMap.get(itemRequest.getFoodId());

                if (food == null) {
                    throw new ResourceNotFoundException("Food not found: " + itemRequest.getFoodId());
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setFood(food);
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setSnapPrice(food.getPrice());

                // Calculate subtotal
                BigDecimal subTotal = orderItem.getSnapPrice().multiply(new BigDecimal(orderItem.getQuantity()));
                orderItem.setSubTotal(subTotal);

                totalAmount = totalAmount.add(subTotal);

                order.getOrderItems().add(orderItem);
            }
        }

        order.setTotalAmount(totalAmount);

        return OrderMapper.toDto(orderRepository.save(order));
    }

    public OrderResponseModel getOrderById(Integer id) {
        return orderRepository.findById(id)
                .map(OrderMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    public Page<OrderResponseModel> getAllOrders(int page, int size, String sortBy, String direction) {
        PaginationValidator.validate(page, size, sortBy, direction,
                Set.of("orderId", "totalAmount", "createdAt", "updatedAt", "orderStatus"));

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return orderRepository.findAll(pageable).map(OrderMapper::toDto);
    }

    @Transactional
    public OrderResponseModel updateStatus(Integer id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        Status targetStatus = Status.valueOf(status.toUpperCase());
        orderStatusValidator.validateTransition(order.getOrderStatus(), targetStatus);

        order.setOrderStatus(targetStatus);
        return OrderMapper.toDto(orderRepository.save(order));
    }

    // @Transactional
    // public void deleteOrder(Integer id) {
    //     Order order = orderRepository.findById(id)
    //             .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    //     order.setDeleteFlag(true);
    //     orderRepository.save(order);
    // }
}
