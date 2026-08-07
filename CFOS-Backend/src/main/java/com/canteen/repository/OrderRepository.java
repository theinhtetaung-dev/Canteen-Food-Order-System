package com.canteen.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.canteen.model.Order;
import com.canteen.model.Status;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    @EntityGraph(attributePaths = { "user", "orderItems", "orderItems.food" })
    Optional<Order> findById(Integer id);

    @EntityGraph(attributePaths = { "orderItems", "orderItems.food" })
    List<Order> findByOrderStatusAndCreatedAtBetween(
        Status orderStatus,
        java.time.LocalDateTime start,
        java.time.LocalDateTime end
    );

    @EntityGraph(attributePaths = { "orderItems", "orderItems.food" })
    Page<Order> findByUser_UserName(String userName, Pageable pageable);
}
