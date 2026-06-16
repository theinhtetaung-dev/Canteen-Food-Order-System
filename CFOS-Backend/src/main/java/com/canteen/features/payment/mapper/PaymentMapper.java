package com.canteen.features.payment.mapper;

import com.canteen.features.payment.dtos.PaymentRequestModel;
import com.canteen.features.payment.dtos.PaymentResponseModel;
import com.canteen.model.Order;
import com.canteen.model.Payment;
import java.time.LocalDateTime;

public class PaymentMapper {

    public static Payment toEntity(PaymentRequestModel request) {
        if (request == null) return null;

        Payment payment = new Payment();
        Order order = new Order();
        order.setOrderId(request.getOrderId());
        payment.setOrder(order);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaidAt(LocalDateTime.now());
        
        return payment;
    }

    public static PaymentResponseModel toDto(Payment payment) {
        if (payment == null) return null;

        PaymentResponseModel dto = new PaymentResponseModel();
        dto.setPaymentId(payment.getPaymentId());
        if (payment.getOrder() != null) {
            dto.setOrderId(payment.getOrder().getOrderId());
        }
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaidAt(payment.getPaidAt());
        dto.setCreatedAt(payment.getCreatedAt());

        return dto;
    }
}
