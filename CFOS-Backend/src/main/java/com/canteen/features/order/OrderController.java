package com.canteen.features.order;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.canteen.features.order.dtos.OrderRequestModel;
import com.canteen.features.order.dtos.OrderResponseModel;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderSseService orderSseService;

    @PostMapping
    public ResponseEntity<OrderResponseModel> createOrder(
            @Valid @RequestBody OrderRequestModel request,
            HttpServletRequest httpRequest) {

        String username = (String) httpRequest.getAttribute("username");
        OrderResponseModel response = orderService.createOrder(request, username);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseModel> getOrderById(@PathVariable Integer id) {
        OrderResponseModel response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponseModel>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Page<OrderResponseModel> response = orderService.getAllOrders(page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderResponseModel>> getMyOrders(
            HttpServletRequest httpRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        String username = (String) httpRequest.getAttribute("username");
        Page<OrderResponseModel> response = orderService.getMyOrders(username, page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseModel> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam com.canteen.model.Status status) {
        OrderResponseModel response = orderService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamOrders() {
        return orderSseService.registerClient();
    }
}
