package com.canteen.features.auth;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.canteen.features.auth.dtos.CreateUserReqModel;
import com.canteen.features.auth.dtos.CreateUserResModel;
import com.canteen.features.auth.dtos.UpdateUserReqModel;
import com.canteen.features.auth.dtos.UpdateUserResModel;
import com.canteen.features.auth.dtos.UserResModel;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<CreateUserResModel> createUser(@Valid @RequestBody CreateUserReqModel request) {
        CreateUserResModel response = userService.createUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResModel> getUserById(@PathVariable Integer id) {
        UserResModel response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<UserResModel>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Page<UserResModel> response = userService.getAllUsers(page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UpdateUserResModel> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateUserReqModel request) {
        UpdateUserResModel response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
