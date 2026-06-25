package com.canteen.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.canteen.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    @EntityGraph(attributePaths = { "user", "orderItems", "orderItems.food" })
    Optional<Order> findById(Integer id);

}
