package com.canteen.features.auth;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.canteen.features.auth.dtos.CreateUserReqModel;
import com.canteen.features.auth.dtos.CreateUserResModel;
import com.canteen.features.auth.dtos.UpdateUserReqModel;
import com.canteen.features.auth.dtos.UpdateUserResModel;
import com.canteen.features.auth.dtos.UpdateProfileReqModel;
import com.canteen.features.auth.dtos.UserResModel;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public java.util.concurrent.CompletableFuture<ResponseEntity<CreateUserResModel>> createUser(@Valid @RequestBody CreateUserReqModel request) {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            try {
                CreateUserResModel response = userService.createUser(request);
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } catch (Exception e) {
                if (e instanceof RuntimeException) {
                    throw (RuntimeException) e;
                }
                throw new RuntimeException(e);
            }
        });
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Integer id) {
        userService.resetPassword(id);
        return ResponseEntity.ok().build();
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

    @GetMapping("/me")
    public ResponseEntity<UserResModel> getMyProfile(HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        UserResModel response = userService.getUserProfile(username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UpdateUserResModel> updateMyProfile(
            @Valid @RequestBody UpdateProfileReqModel request,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        UpdateUserResModel response = userService.updateUserProfile(username, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody com.canteen.features.auth.dtos.ChangePasswordReqModel request,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        userService.changePassword(username, request);
        return ResponseEntity.ok().build();
    }
}
