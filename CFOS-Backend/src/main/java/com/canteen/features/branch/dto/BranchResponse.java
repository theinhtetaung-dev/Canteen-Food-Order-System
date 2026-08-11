package com.canteen.features.branch.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BranchResponse {
    private Integer branchId;
    private String branchName;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
