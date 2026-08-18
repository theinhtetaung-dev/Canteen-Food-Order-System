package com.canteen.features.review.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Integer reviewId;
    private Integer userId;
    private String userName;
    private String userFullName;
    private Double rating;
    private String reviewText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
