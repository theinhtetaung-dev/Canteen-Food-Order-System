package com.canteen.features.payment;

import com.canteen.features.payment.dtos.PaymentRequestModel;
import com.canteen.features.payment.dtos.PaymentResponseModel;
import com.canteen.features.payment.mapper.PaymentMapper;
import com.canteen.model.Order;
import com.canteen.model.Payment;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.PaymentRepository;
import com.canteen.utils.PaginationValidator;
import com.canteen.utils.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentResponseModel createPayment(PaymentRequestModel request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        Payment payment = PaymentMapper.toEntity(request);
        payment.setOrder(order);

        return PaymentMapper.toDto(paymentRepository.save(payment));
    }

    public PaymentResponseModel getPayment(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return PaymentMapper.toDto(payment);
    }

    public Page<PaymentResponseModel> getAllPayment(int page, int size, String sortBy, String direction) {
        PaginationValidator.validate(page, size, sortBy, direction,
                Set.of("paymentId", "createdAt", "updatedAt","paidAt" , "paymentMethod"));

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(PaymentMapper::toDto);
    }
}
