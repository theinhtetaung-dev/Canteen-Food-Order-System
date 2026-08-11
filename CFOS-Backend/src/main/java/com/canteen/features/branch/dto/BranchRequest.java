package com.canteen.features.branch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BranchRequest {
    @NotBlank(message = "Branch name is required")
    private String branchName;
    private String location;
}
