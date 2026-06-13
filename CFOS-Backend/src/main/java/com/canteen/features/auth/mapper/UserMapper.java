package com.canteen.features.auth.mapper;

import com.canteen.features.auth.dtos.CreateUserReqModel;
import com.canteen.features.auth.dtos.UpdateUserReqModel;
import com.canteen.features.auth.dtos.UserResModel;
import com.canteen.model.User;

public class UserMapper {

    public static User toEntity(CreateUserReqModel request) {
        if (request == null) return null;

        User user = new User();
        user.setUserName(request.getUserName());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setStatus(request.getStatus());

        return user;
    }

    public static void updateEntity(User user, UpdateUserReqModel request) {
        if (user == null || request == null) return;
        
        user.setUserName(request.getUserName());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setStatus(request.getStatus());
    }

    public static UserResModel toDto(User user) {
        if (user == null) return null;

        UserResModel dto = new UserResModel();
        dto.setUserId(user.getUserId());
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().getRoleName());
        }
        dto.setUserName(user.getUserName());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setStatus(user.getStatus());
        dto.setDeleteFlag(user.getDeleteFlag());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        return dto;
    }
}
