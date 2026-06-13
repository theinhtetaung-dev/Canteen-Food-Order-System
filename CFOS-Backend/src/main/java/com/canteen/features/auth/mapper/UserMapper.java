package com.canteen.features.auth.mapper;

import com.canteen.features.auth.dtos.UserRequestModel;
import com.canteen.features.auth.dtos.UserResponseModel;
import com.canteen.model.User;

public class UserMapper {

    public static User toEntity(UserRequestModel request) {
        if (request == null) return null;

        User user = new User();
        user.setUserName(request.getUserName());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setStatus(request.getStatus());

        return user;
    }

    public static UserResponseModel toDto(User user) {
        if (user == null) return null;

        UserResponseModel dto = new UserResponseModel();
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
