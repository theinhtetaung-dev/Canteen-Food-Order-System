package com.canteen.features.notification;

import com.canteen.features.notification.dtos.NotificationRequestModel;
import com.canteen.features.notification.dtos.NotificationResponseModel;
import com.canteen.features.notification.mapper.NotificationMapper;
import com.canteen.model.Notification;
import com.canteen.model.Order;
import com.canteen.model.User;
import com.canteen.repository.NotificationRepository;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.UserRepository;
import com.canteen.utils.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public NotificationResponseModel createNotification(NotificationRequestModel request, String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + request.getOrderId()));
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setOrder(order);
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        return NotificationMapper.toDto(saved);
    }

    @Transactional
    public void createNotification(User user, Order order, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setOrder(order);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public List<NotificationResponseModel> getMyNotifications(String username) {
        return notificationRepository.findByUser_UserNameOrderByCreatedAtDesc(username)
                .stream()
                .map(NotificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponseModel markAsRead(Integer id, String username) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));

        if (!notification.getUser().getUserName().equals(username)) {
            throw new IllegalArgumentException("You can only modify your own notifications");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return NotificationMapper.toDto(saved);
    }

    @Transactional
    public void markAllAsRead(String username) {
        List<Notification> notifications = notificationRepository.findByUser_UserNameOrderByCreatedAtDesc(username);
        for (Notification notification : notifications) {
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        }
    }
}
