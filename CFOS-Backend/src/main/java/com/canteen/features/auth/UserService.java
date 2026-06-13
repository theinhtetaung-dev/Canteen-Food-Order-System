package com.canteen.features.auth;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.canteen.features.auth.dtos.UserRequestModel;
import com.canteen.features.auth.dtos.UserResponseModel;
import com.canteen.features.auth.mapper.UserMapper;
import com.canteen.model.Role;
import com.canteen.model.User;
import com.canteen.repository.RoleRepository;
import com.canteen.repository.UserRepository;
import com.canteen.utils.PaginationValidator;

import lombok.RequiredArgsConstructor;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public UserResponseModel createUser(UserRequestModel request) {
        if (userRepository.existsByUserName(request.getUserName())) {
            throw new RuntimeException("Username already exists: " + request.getUserName());
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleId()));

        User user = UserMapper.toEntity(request);
        user.setRole(role);

        return UserMapper.toDto(userRepository.save(user));
    }

    public UserResponseModel getUserById(Integer id) {
        return userRepository.findById(id)
                .map(UserMapper::toDto)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public Page<UserResponseModel> getAllUsers(int page, int size, String sortBy, String direction) {
        PaginationValidator.validate(page, size, sortBy, direction, 
                Set.of("userId", "userName", "fullName", "email", "status", "createdAt", "updatedAt"));

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return userRepository.findAll(pageable).map(UserMapper::toDto);
    }

    @Transactional
    public UserResponseModel updateUser(Integer id, UserRequestModel request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (!user.getUserName().equals(request.getUserName()) && userRepository.existsByUserName(request.getUserName())) {
            throw new RuntimeException("Username already exists: " + request.getUserName());
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleId()));

        user.setRole(role);
        user.setUserName(request.getUserName());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setStatus(request.getStatus());
        // Notice: In a real app, password updating should be handled separately

        return UserMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setDeleteFlag(true);
        userRepository.save(user);
    }
}
