package com.canteen.features.notification;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.canteen.features.notification.dtos.NotificationRequestModel;
import com.canteen.features.notification.dtos.NotificationResponseModel;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponseModel> createNotification(
            @Valid @RequestBody NotificationRequestModel request,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        NotificationResponseModel response = notificationService.createNotification(request, username);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-notifications")
    public ResponseEntity<List<NotificationResponseModel>> getMyNotifications(
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        List<NotificationResponseModel> response = notificationService.getMyNotifications(username);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseModel> markAsRead(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        NotificationResponseModel response = notificationService.markAsRead(id, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok().build();
    }
}
