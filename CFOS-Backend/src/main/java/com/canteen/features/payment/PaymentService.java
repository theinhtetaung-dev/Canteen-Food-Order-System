package com.canteen.features.payment;

import com.canteen.features.payment.dtos.PaymentRequestModel;
import com.canteen.features.payment.dtos.PaymentResponseModel;
import com.canteen.features.payment.mapper.PaymentMapper;
import com.canteen.model.Order;
import com.canteen.model.Payment;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
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
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + request.getOrderId()));

        Payment payment = PaymentMapper.toEntity(request);
        payment.setOrder(order);

        Payment savedPayment = paymentRepository.save(payment);
        return PaymentMapper.toDto(savedPayment);
    }

    public PaymentResponseModel getPayment(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return PaymentMapper.toDto(payment);
    }

    public Page<PaymentResponseModel> getAllPayment(int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(PaymentMapper::toDto);
    }
}
