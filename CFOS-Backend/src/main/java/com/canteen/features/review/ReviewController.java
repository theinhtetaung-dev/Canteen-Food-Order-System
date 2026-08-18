package com.canteen.features.review;

import com.canteen.features.review.dtos.ReviewRequest;
import com.canteen.features.review.dtos.ReviewResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAll() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    // CREATE
    @PostMapping
    public ResponseEntity<ReviewResponse> create(
            @Valid @RequestBody ReviewRequest request,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        return ResponseEntity.ok(reviewService.create(request, username));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody ReviewRequest request,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        return ResponseEntity.ok(reviewService.update(id, request, username));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        reviewService.delete(id, username);
        return ResponseEntity.ok("Review deleted successfully");
    }
}
