package com.canteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.canteen.model.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
}
