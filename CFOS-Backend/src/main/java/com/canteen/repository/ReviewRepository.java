package com.canteen.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.canteen.model.Review;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    @Query("SELECT r FROM Review r WHERE r.deleteFlag = false ORDER BY r.createdAt DESC")
    List<Review> findAllActive();
    
    @Query("SELECT r FROM Review r WHERE r.deleteFlag = false ORDER BY r.createdAt DESC")
    Page<Review> findAllActive(Pageable pageable);
}
