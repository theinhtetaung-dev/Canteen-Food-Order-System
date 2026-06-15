package com.canteen.features.auth;

import com.canteen.features.auth.dtos.LoginReqModel;
import com.canteen.features.auth.dtos.LoginResModel;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public java.util.concurrent.CompletableFuture<ResponseEntity<LoginResModel>> login(@Valid @RequestBody LoginReqModel request) {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            try {
                LoginResModel response = userService.login(request);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                if (e instanceof RuntimeException) {
                    throw (RuntimeException) e;
                }
                throw new RuntimeException(e);
            }
        });
    }
}
