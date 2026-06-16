package com.canteen.features.payment;

import com.canteen.features.payment.dtos.PaymentRequestModel;
import com.canteen.features.payment.dtos.PaymentResponseModel;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponseModel> createPayment(@Valid @RequestBody PaymentRequestModel request) {
        PaymentResponseModel response = paymentService.createPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseModel> getPayment(@PathVariable Integer id) {
        PaymentResponseModel response = paymentService.getPayment(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<PaymentResponseModel>> getAllPayment(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Page<PaymentResponseModel> response = paymentService.getAllPayment(page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }
}
