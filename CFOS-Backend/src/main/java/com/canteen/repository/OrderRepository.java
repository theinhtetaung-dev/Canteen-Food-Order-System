package com.canteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.canteen.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

}
