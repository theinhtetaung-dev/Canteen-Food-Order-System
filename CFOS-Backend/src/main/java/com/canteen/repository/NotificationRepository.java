package com.canteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.canteen.model.Notification;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser_UserNameOrderByCreatedAtDesc(String username);
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
}
