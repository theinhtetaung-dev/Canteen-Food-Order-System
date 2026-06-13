package com.canteen.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.canteen.model.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    @Override
    @EntityGraph(attributePaths = {"role"})
    Page<User> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"role"})
    Optional<User> findById(Integer id);

    Optional<User> findByUserName(String userName);
    boolean existsByUserName(String userName);
    boolean existsByEmail(String email);
}
