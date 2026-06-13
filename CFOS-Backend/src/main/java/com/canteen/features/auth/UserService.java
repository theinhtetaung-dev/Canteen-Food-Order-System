package com.canteen.features.auth;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.canteen.features.auth.dtos.CreateUserReqModel;
import com.canteen.features.auth.dtos.CreateUserResModel;
import com.canteen.features.auth.dtos.UpdateUserReqModel;
import com.canteen.features.auth.dtos.UpdateUserResModel;
import com.canteen.features.auth.dtos.UserResModel;
import com.canteen.features.auth.mapper.UserMapper;
import com.canteen.model.Role;
import com.canteen.model.User;
import com.canteen.repository.RoleRepository;
import com.canteen.repository.UserRepository;
import com.canteen.utils.JwtUtil;
import com.canteen.utils.PaginationValidator;
import com.canteen.utils.exceptions.DuplicateResourceException;
import com.canteen.utils.exceptions.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public CreateUserResModel createUser(CreateUserReqModel request) {
        if (userRepository.existsByUserName(request.getUserName())) {
            throw new DuplicateResourceException("Username already exists: " + request.getUserName());
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRoleId()));

        User user = UserMapper.toEntity(request);
        user.setRole(role);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        CreateUserResModel response = new CreateUserResModel();
        response.setUserId(user.getUserId());
        response.setUserName(user.getUserName());
        response.setMessage("User created successfully");

        return response;
    }

    @Transactional(readOnly = true)
    public com.canteen.features.auth.dtos.LoginResModel login(com.canteen.features.auth.dtos.LoginReqModel request) {
        User user = userRepository.findByUserName(request.getUserName())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResourceNotFoundException("Invalid username or password");
        }
        
        if (Boolean.TRUE.equals(user.getDeleteFlag())) {
            throw new ResourceNotFoundException("Account is disabled");
        }

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
        String token = jwtUtil.generateToken(user.getUserName(), user.getUserId(), roleName);

        com.canteen.features.auth.dtos.LoginResModel response = new com.canteen.features.auth.dtos.LoginResModel();
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setUserName(user.getUserName());
        response.setRole(roleName);

        return response;
    }

    @Transactional(readOnly = true)
    public UserResModel getUserById(Integer id) {
        return userRepository.findById(id)
                .map(UserMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<UserResModel> getAllUsers(int page, int size, String sortBy, String direction) {
        PaginationValidator.validate(page, size, sortBy, direction, 
                Set.of("userId", "userName", "fullName", "email", "status", "createdAt", "updatedAt"));

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return userRepository.findAll(pageable).map(UserMapper::toDto);
    }

    @Transactional
    public UpdateUserResModel updateUser(Integer id, UpdateUserReqModel request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (!user.getUserName().equals(request.getUserName()) && userRepository.existsByUserName(request.getUserName())) {
            throw new DuplicateResourceException("Username already exists: " + request.getUserName());
        }
        
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRoleId()));

        UserMapper.updateEntity(user, request);
        user.setRole(role);

        userRepository.save(user);

        UpdateUserResModel response = new UpdateUserResModel();
        response.setUserId(user.getUserId());
        response.setUserName(user.getUserName());
        response.setMessage("User updated successfully");

        return response;
    }

    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setDeleteFlag(true);
        userRepository.save(user);
    }
}
