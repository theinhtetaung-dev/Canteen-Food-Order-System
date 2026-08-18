package com.canteen.features.review;

import com.canteen.features.review.dtos.ReviewRequest;
import com.canteen.features.review.dtos.ReviewResponse;
import com.canteen.model.Review;
import com.canteen.model.User;
import com.canteen.repository.ReviewRepository;
import com.canteen.repository.UserRepository;
import com.canteen.utils.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    // GET ALL
    public List<ReviewResponse> getAll() {
        return reviewRepository.findAllActive()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // CREATE
    @Transactional
    public ReviewResponse create(ReviewRequest request, String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Review review = new Review();
        review.setUser(user);
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());
        review.setDeleteFlag(false);

        review = reviewRepository.save(review);
        return toResponse(review);
    }

    // UPDATE
    @Transactional
    public ReviewResponse update(Integer id, ReviewRequest request, String username) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Check if user is the author
        if (!review.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("You can only edit your own reviews");
        }

        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        review = reviewRepository.save(review);
        return toResponse(review);
    }

    // DELETE (SOFT DELETE)
    @Transactional
    public void delete(Integer id, String username) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Check if user is the author or admin (we can allow admin to delete, or just check role)
        boolean isOwner = review.getUser().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRole() != null && 
                ("Admin".equalsIgnoreCase(user.getRole().getRoleName()) || "SuperAdmin".equalsIgnoreCase(user.getRole().getRoleName()));

        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("You can only delete your own reviews");
        }

        review.setDeleteFlag(true);
        reviewRepository.save(review);
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse res = new ReviewResponse();
        res.setReviewId(review.getReviewId());
        res.setRating(review.getRating());
        res.setReviewText(review.getReviewText());
        res.setCreatedAt(review.getCreatedAt());
        res.setUpdatedAt(review.getUpdatedAt());

        if (review.getUser() != null) {
            res.setUserId(review.getUser().getUserId());
            res.setUserName(review.getUser().getUserName());
            res.setUserFullName(review.getUser().getFullName());
        }
        return res;
    }
}
